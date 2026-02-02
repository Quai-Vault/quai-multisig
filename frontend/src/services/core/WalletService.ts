import { Contract, ZeroAddress, Interface, ContractFactory } from 'quais';
import type { Contract, Signer, Provider } from '../../types';
import type { WalletInfo, DeploymentConfig } from '../../types';
import { CONTRACT_ADDRESSES } from '../../config/contracts';
import { extractIpfsHashFromBytecode } from '../../utils/ipfsHelper';
import { BaseService } from './BaseService';

import MultisigWalletABI from '../../config/abi/MultisigWallet.json';
import ProxyFactoryABI from '../../config/abi/ProxyFactory.json';
import MultisigWalletProxyABI from '../../config/abi/MultisigWalletProxy.json';

/**
 * Service for core wallet operations
 * Handles wallet deployment, info retrieval, and factory interactions
 */
export class WalletService extends BaseService {
  private factoryContract: Contract;

  constructor(provider?: Provider) {
    super(provider);
    this.factoryContract = new Contract(
      CONTRACT_ADDRESSES.PROXY_FACTORY,
      ProxyFactoryABI.abi,
      this.provider
    );
  }

  /**
   * Override setSigner to also update factory contract
   */
  setSigner(signer: Signer | null): void {
    super.setSigner(signer);
    if (signer) {
      this.factoryContract = this.factoryContract.connect(signer) as Contract;
    } else {
      this.factoryContract = new Contract(
        CONTRACT_ADDRESSES.PROXY_FACTORY,
        ProxyFactoryABI.abi,
        this.provider
      );
    }
  }

  /**
   * Get the implementation address from the factory
   */
  async getImplementationAddress(): Promise<string> {
    return await this.factoryContract.implementation();
  }

  /**
   * Verify factory configuration
   */
  async verifyFactoryConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const implAddress = await this.getImplementationAddress();

      if (!implAddress || implAddress === ZeroAddress) {
        errors.push('Implementation address is not set');
      } else {
        const code = await this.provider.getCode(implAddress);
        if (code === '0x') {
          errors.push(`Implementation contract at ${implAddress} has no code`);
        }
      }
    } catch (error) {
      errors.push('Failed to verify factory configuration: ' +
        (error instanceof Error ? error.message : 'Unknown error'));
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Deploy a new multisig wallet directly (without factory CREATE2)
   */
  async deployWallet(
    config: DeploymentConfig,
    onProgress?: (progress: {
      step: 'deploying' | 'deploying_waiting' | 'registering' | 'registering_waiting' | 'verifying' | 'success';
      deployTxHash?: string;
      registerTxHash?: string;
      walletAddress?: string;
      message?: string;
    }) => void
  ): Promise<string> {
    const signer = this.requireSigner();

    if (!config) {
      throw new Error('Deployment config is required');
    }

    const { owners, threshold } = config;

    // Validate inputs
    if (!owners || !Array.isArray(owners)) {
      throw new Error('Owners must be an array');
    }
    if (owners.length === 0) {
      throw new Error('At least one owner is required');
    }
    if (threshold === undefined || threshold === null || threshold === 0 || threshold > owners.length) {
      throw new Error(`Invalid threshold: ${threshold} (must be between 1 and ${owners.length})`);
    }

    try {
      // Encode initialization data
      const iface = new Interface(MultisigWalletABI.abi);
      const initData = iface.encodeFunctionData('initialize', [owners, threshold]);

      // Validate ABI and bytecode
      if (!MultisigWalletProxyABI?.bytecode) {
        throw new Error('MultisigWalletProxy ABI or bytecode is missing.');
      }
      if (!MultisigWalletProxyABI.deployedBytecode) {
        throw new Error('MultisigWalletProxy deployedBytecode is missing.');
      }

      // Extract IPFS hash from bytecode
      const ipfsHash = extractIpfsHashFromBytecode(MultisigWalletProxyABI.bytecode);
      if (!ipfsHash) {
        throw new Error('Failed to extract IPFS hash from proxy bytecode');
      }

      // Deploy proxy with IPFS hash
      const ProxyFactory = new ContractFactory(
        MultisigWalletProxyABI.abi,
        MultisigWalletProxyABI.bytecode,
        signer,
        ipfsHash
      );

      onProgress?.({ step: 'deploying', message: 'Please approve the deployment transaction in your wallet' });

      const proxy = await ProxyFactory.deploy(
        CONTRACT_ADDRESSES.MULTISIG_IMPLEMENTATION,
        initData
      );

      const deployTxHash = proxy.deploymentTransaction()?.hash;

      onProgress?.({
        step: 'deploying_waiting',
        deployTxHash,
        message: 'Waiting for deployment transaction to be confirmed...',
      });

      await proxy.waitForDeployment();
      const walletAddress = await proxy.getAddress();

      // Verify deployed bytecode
      onProgress?.({
        step: 'verifying',
        deployTxHash,
        walletAddress,
        message: 'Verifying deployed contract...',
      });

      await this.verifyDeployedBytecode(walletAddress);

      // Register wallet with factory
      const registerTxHash = await this.registerWalletWithFactory(
        walletAddress,
        onProgress,
        deployTxHash
      );

      onProgress?.({
        step: 'success',
        deployTxHash,
        registerTxHash,
        walletAddress,
        message: 'Wallet created successfully!',
      });

      return walletAddress;
    } catch (error) {
      // Log without sensitive deployment details (addresses already revealed through deployment progress)
      console.error('Deployment error:', error instanceof Error ? error.message : 'Unknown error');

      // Check for ethers.js error structure
      const ethersError = error as { code?: string; reason?: string; message?: string };
      if (ethersError.code === 'CALL_EXCEPTION') {
        throw new Error('Deployment failed: ' + (ethersError.reason || ethersError.message || 'Unknown error'));
      }
      throw error;
    }
  }

  /**
   * Verify deployed bytecode matches expected
   */
  private async verifyDeployedBytecode(walletAddress: string): Promise<void> {
    try {
      const deployedCode = await this.provider.getCode(walletAddress);
      const expectedDeployed = MultisigWalletProxyABI.deployedBytecode.replace('0x', '').toLowerCase();
      const actualDeployed = deployedCode.replace('0x', '').toLowerCase();

      if (actualDeployed !== expectedDeployed) {
        console.warn('Deployed bytecode does not match expected');
      }
    } catch {
      // Verification is non-blocking
    }
  }

  /**
   * Register wallet with factory for discovery
   */
  private async registerWalletWithFactory(
    walletAddress: string,
    onProgress?: (progress: any) => void,
    deployTxHash?: string
  ): Promise<string | undefined> {
    try {
      onProgress?.({
        step: 'registering',
        deployTxHash,
        walletAddress,
        message: 'Please approve the registration transaction in your wallet',
      });

      const registerTx = await this.factoryContract.registerWallet(walletAddress);
      const registerTxHash = registerTx.hash;

      onProgress?.({
        step: 'registering_waiting',
        deployTxHash,
        registerTxHash,
        walletAddress,
        message: 'Waiting for registration transaction to be confirmed...',
      });

      await registerTx.wait();

      return registerTxHash;
    } catch {
      return undefined;
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    const wallet = this.getWalletContract(walletAddress);

    const [owners, threshold, balance] = await Promise.all([
      wallet.getOwners(),
      wallet.threshold(),
      this.provider.getBalance(walletAddress),
    ]);

    return {
      address: walletAddress,
      owners: Array.from(owners).map(address => String(address)),
      threshold: Number(threshold),
      balance: balance.toString(),
    };
  }

  /**
   * Get all wallets for an owner address
   */
  async getWalletsForOwner(ownerAddress: string): Promise<string[]> {
    const wallets = await this.factoryContract.getWalletsByCreator(ownerAddress);
    return Array.from(wallets).map(address => String(address));
  }

  /**
   * Check if an address is an owner of the wallet
   */
  async isOwner(walletAddress: string, address: string): Promise<boolean> {
    const wallet = this.getWalletContract(walletAddress);
    return await wallet.isOwner(address);
  }

  /**
   * Check if a module is enabled
   */
  async isModuleEnabled(walletAddress: string, moduleAddress: string): Promise<boolean> {
    const wallet = this.getWalletContract(walletAddress);
    return await wallet.modules(moduleAddress);
  }

  /**
   * Get the balance of a wallet address
   */
  async getBalance(walletAddress: string): Promise<bigint> {
    return await this.provider.getBalance(walletAddress);
  }

  /**
   * Get factory contract (for use by other services)
   */
  getFactoryContract(): Contract {
    return this.factoryContract;
  }

  /**
   * Extract wallet address from deployment receipt
   */
  extractWalletAddressFromReceipt(receipt: any): string {
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = this.factoryContract.interface.parseLog(log);
        return parsed?.name === 'WalletCreated';
      } catch {
        return false;
      }
    });

    if (!event) {
      throw new Error('Wallet creation event not found');
    }

    const parsedEvent = this.factoryContract.interface.parseLog(event);
    const walletAddress = parsedEvent?.args.wallet;

    if (!walletAddress) {
      throw new Error('Failed to get wallet address from event');
    }

    return walletAddress;
  }
}
