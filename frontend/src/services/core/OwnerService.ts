import type { Provider } from '../../types';
import { BaseService } from './BaseService';
import { TransactionService } from './TransactionService';
import { validateAddress } from '../utils/TransactionErrorHandler';

/**
 * Service for owner and module management
 * Handles addOwner, removeOwner, changeThreshold, enableModule, disableModule
 *
 * Note: These operations require multisig approval, so they create proposals
 */
export class OwnerService extends BaseService {
  private transactionService: TransactionService;

  constructor(provider?: Provider, transactionService?: TransactionService) {
    super(provider);
    this.transactionService = transactionService || new TransactionService(provider);
  }

  /**
   * Sync signer with transaction service
   */
  setSigner(signer: any): void {
    super.setSigner(signer);
    this.transactionService.setSigner(signer);
  }

  /**
   * Add a new owner to the wallet
   * @returns Transaction hash of the proposed transaction
   */
  async addOwner(walletAddress: string, newOwner: string): Promise<string> {
    this.requireSigner();

    const normalizedOwner = validateAddress(newOwner);
    const wallet = this.getWalletContract(walletAddress);

    // Check if already an owner
    const isAlreadyOwner = await wallet.isOwner(normalizedOwner);
    if (isAlreadyOwner) {
      throw new Error('Address is already an owner');
    }

    // Check for pending addOwner transaction
    await this.checkPendingAddOwner(walletAddress, normalizedOwner, wallet);

    // Encode addOwner function call
    const data = wallet.interface.encodeFunctionData('addOwner', [normalizedOwner]);

    // Propose transaction to wallet itself (self-call)
    return this.transactionService.proposeTransaction(walletAddress, walletAddress, 0n, data);
  }

  /**
   * Remove an owner from the wallet
   * @returns Transaction hash of the proposed transaction
   */
  async removeOwner(walletAddress: string, owner: string): Promise<string> {
    this.requireSigner();

    const normalizedOwner = validateAddress(owner);
    const wallet = this.getWalletContract(walletAddress);

    // Validate owner exists and threshold constraint
    const [isOwner, owners, threshold] = await Promise.all([
      wallet.isOwner(normalizedOwner),
      wallet.getOwners(),
      wallet.threshold(),
    ]);

    if (!isOwner) {
      throw new Error('Address is not an owner');
    }

    const currentOwnerCount = owners.length;
    const newOwnerCount = currentOwnerCount - 1;
    const currentThreshold = Number(threshold);

    if (newOwnerCount < currentThreshold) {
      throw new Error(
        `Cannot remove owner: would reduce owners to ${newOwnerCount}, but threshold is ${currentThreshold}. ` +
        `Lower the threshold first (to ${newOwnerCount} or less) or add more owners.`
      );
    }

    // Encode removeOwner function call
    const data = wallet.interface.encodeFunctionData('removeOwner', [normalizedOwner]);

    return this.transactionService.proposeTransaction(walletAddress, walletAddress, 0n, data);
  }

  /**
   * Change the approval threshold
   * @returns Transaction hash of the proposed transaction
   */
  async changeThreshold(walletAddress: string, newThreshold: number): Promise<string> {
    this.requireSigner();

    if (newThreshold < 1) {
      throw new Error('Threshold must be at least 1');
    }

    const wallet = this.getWalletContract(walletAddress);
    const owners = await wallet.getOwners();

    if (newThreshold > owners.length) {
      throw new Error(`Threshold cannot exceed number of owners (${owners.length})`);
    }

    // Encode changeThreshold function call
    const data = wallet.interface.encodeFunctionData('changeThreshold', [newThreshold]);

    return this.transactionService.proposeTransaction(walletAddress, walletAddress, 0n, data);
  }

  /**
   * Enable a module
   * @returns Transaction hash of the proposed transaction
   */
  async enableModule(walletAddress: string, moduleAddress: string): Promise<string> {
    this.requireSigner();

    const normalizedModule = validateAddress(moduleAddress);
    const wallet = this.getWalletContract(walletAddress);

    // Check if module is already enabled
    const isEnabled = await wallet.modules(normalizedModule);
    if (isEnabled) {
      throw new Error('Module is already enabled');
    }

    // Encode enableModule function call
    const data = wallet.interface.encodeFunctionData('enableModule', [normalizedModule]);

    return this.transactionService.proposeTransaction(walletAddress, walletAddress, 0n, data);
  }

  /**
   * Disable a module
   * @returns Transaction hash of the proposed transaction
   */
  async disableModule(walletAddress: string, moduleAddress: string): Promise<string> {
    this.requireSigner();

    const normalizedModule = validateAddress(moduleAddress);
    const wallet = this.getWalletContract(walletAddress);

    // Check if module is enabled
    const isEnabled = await wallet.modules(normalizedModule);
    if (!isEnabled) {
      throw new Error('Module is not enabled');
    }

    // Encode disableModule function call
    const data = wallet.interface.encodeFunctionData('disableModule', [normalizedModule]);

    return this.transactionService.proposeTransaction(walletAddress, walletAddress, 0n, data);
  }

  // ============ Private Helper Methods ============

  /**
   * Check for pending addOwner transaction for this address
   */
  private async checkPendingAddOwner(
    walletAddress: string,
    normalizedOwner: string,
    wallet: any
  ): Promise<void> {
    try {
      const pendingTxs = await this.transactionService.getPendingTransactions(walletAddress);
      const addOwnerSelector = '0x7065cb48'; // addOwner function selector

      for (const tx of pendingTxs) {
        if (
          tx.to.toLowerCase() === walletAddress.toLowerCase() &&
          tx.data.startsWith(addOwnerSelector)
        ) {
          try {
            const decoded = wallet.interface.decodeFunctionData('addOwner', tx.data);
            const pendingOwner = decoded[0];
            if (pendingOwner.toLowerCase() === normalizedOwner.toLowerCase()) {
              throw new Error(
                `A transaction to add ${normalizedOwner} is already pending. ` +
                `Transaction hash: ${tx.hash.slice(0, 10)}...`
              );
            }
          } catch {
            // Decoding failed, continue
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message?.includes('already pending')) {
        throw error;
      }
      // Continue - no pending transaction found
    }
  }
}
