import type { Contract, Provider } from '../../types';
import type { Transaction, PendingTransaction } from '../../types';
import { BaseService } from './BaseService';
import {
  isUserRejection,
  formatTransactionError,
  validateTxHash,
  TransactionErrors,
} from '../utils/TransactionErrorHandler';
import {
  estimateGasWithBuffer,
  estimateGasOrThrow,
  buildTxOptions,
  GasPresets,
  logGasUsage,
} from '../utils/GasEstimator';

/**
 * Service for transaction operations
 * Handles propose, approve, revoke, cancel, execute, and query transactions
 */
export class TransactionService extends BaseService {

  constructor(provider?: Provider) {
    super(provider);
  }

  /**
   * Propose a new transaction
   */
  async proposeTransaction(
    walletAddress: string,
    to: string,
    value: bigint,
    data: string
  ): Promise<string> {
    const signer = this.requireSigner();
    const wallet = this.getWalletContract(walletAddress, signer);

    // Check if caller is an owner
    const callerAddress = await signer.getAddress();
    const isOwner = await wallet.isOwner(callerAddress);
    if (!isOwner) {
      throw new Error(`Address ${callerAddress} is not an owner of this wallet`);
    }

    // Check for existing transaction
    await this.checkExistingTransaction(wallet, to, value, data, walletAddress);

    // Determine if this is a self-call (unreliable gas estimation)
    const isSelfCall = to.toLowerCase() === walletAddress.toLowerCase();

    // Skip gas estimation for self-calls
    if (!isSelfCall) {
      await this.validateProposalGas(wallet, to, value, data, walletAddress);
    }

    // Send transaction
    const txOptions = isSelfCall ? await this.buildSelfCallOptions(signer) : {};

    let tx;
    try {
      tx = await wallet.proposeTransaction(to, value, data, txOptions);
    } catch (error) {
      throw formatTransactionError(error, 'Transaction proposal failed', wallet);
    }

    const receipt = await tx.wait();

    // Extract transaction hash from event
    return this.extractTxHashFromReceipt(receipt, wallet);
  }

  /**
   * Approve a transaction
   */
  async approveTransaction(walletAddress: string, txHash: string): Promise<void> {
    const signer = this.requireSigner();
    const normalizedHash = validateTxHash(txHash);
    const wallet = this.getWalletContract(walletAddress, signer);

    const { gasLimit } = await estimateGasWithBuffer(
      wallet.approveTransaction,
      [normalizedHash],
      GasPresets.standard
    );

    const tx = await wallet.approveTransaction(normalizedHash, buildTxOptions(gasLimit));
    await tx.wait();
  }

  /**
   * Revoke approval for a transaction
   */
  async revokeApproval(walletAddress: string, txHash: string): Promise<void> {
    const signer = this.requireSigner();
    const normalizedHash = validateTxHash(txHash);
    const wallet = this.getWalletContract(walletAddress, signer);
    const signerAddress = await signer.getAddress();

    // Pre-validation
    await this.validateRevokeApproval(wallet, normalizedHash, signerAddress);

    const { gasLimit } = await estimateGasWithBuffer(
      wallet.revokeApproval,
      [normalizedHash],
      GasPresets.simple
    );

    const nonce = await this.provider.getTransactionCount(signerAddress, 'pending');
    const tx = await wallet.revokeApproval(normalizedHash, { gasLimit, nonce });

    const receipt = await tx.wait();

    if (receipt?.status === 0) {
      throw new Error('Revoke approval transaction reverted');
    }

    // Verify on-chain
    const stillApproved = await wallet.approvals(normalizedHash, signerAddress);
    if (stillApproved) {
      throw new Error('Approval revocation may have failed - approval still exists on-chain');
    }
  }

  /**
   * Cancel a pending transaction
   */
  async cancelTransaction(walletAddress: string, txHash: string): Promise<void> {
    const signer = this.requireSigner();
    const normalizedHash = validateTxHash(txHash);
    const wallet = this.getWalletContract(walletAddress, signer);
    const callerAddress = await signer.getAddress();

    // Validate cancellation
    await this.validateCancelTransaction(wallet, normalizedHash, callerAddress);

    // Estimate gas (will throw if validation fails)
    await estimateGasOrThrow(
      wallet.cancelTransaction,
      [normalizedHash],
      'cancel transaction',
      wallet
    );

    const { gasLimit } = await estimateGasWithBuffer(
      wallet.cancelTransaction,
      [normalizedHash],
      GasPresets.standard
    );

    const tx = await wallet.cancelTransaction(normalizedHash, buildTxOptions(gasLimit));
    const receipt = await tx.wait();

    // Verify on-chain
    const verifyTx = await wallet.transactions(normalizedHash);
    if (!verifyTx.cancelled) {
      if (receipt?.status === 0) {
        throw new Error('Transaction cancellation failed (reverted)');
      }
    }
  }

  /**
   * Execute a transaction
   */
  async executeTransaction(walletAddress: string, txHash: string): Promise<void> {
    const signer = this.requireSigner();
    const normalizedHash = validateTxHash(txHash);
    const wallet = this.getWalletContract(walletAddress, signer);

    // Pre-validation
    await this.validateExecuteTransaction(wallet, normalizedHash, walletAddress);

    const { gasLimit } = await estimateGasWithBuffer(
      wallet.executeTransaction,
      [normalizedHash],
      GasPresets.complex
    );

    let tx;
    try {
      tx = await wallet.executeTransaction(normalizedHash, buildTxOptions(gasLimit));
    } catch (error) {
      throw formatTransactionError(error, 'Transaction execution failed', wallet);
    }

    const receipt = await tx.wait();
    logGasUsage('executeTransaction', receipt, gasLimit);

    if (receipt?.status === 0) {
      throw new Error('Transaction execution reverted');
    }
  }

  /**
   * Approve and execute a transaction atomically
   * Prevents frontrunning by combining approval and execution in a single transaction
   * @returns true if executed, false if only approved (threshold not yet met)
   */
  async approveAndExecute(walletAddress: string, txHash: string): Promise<boolean> {
    const signer = this.requireSigner();
    const normalizedHash = validateTxHash(txHash);
    const wallet = this.getWalletContract(walletAddress, signer);
    const signerAddress = await signer.getAddress();

    // Pre-validation
    const [txDetails, threshold, isOwner, hasApproved] = await Promise.all([
      wallet.transactions(normalizedHash),
      wallet.threshold(),
      wallet.isOwner(signerAddress),
      wallet.approvals(normalizedHash, signerAddress),
    ]);

    const zeroAddress = '0x0000000000000000000000000000000000000000';
    if (txDetails.to.toLowerCase() === zeroAddress.toLowerCase()) {
      throw new Error(TransactionErrors.TX_NOT_FOUND);
    }
    if (!isOwner) {
      throw new Error(TransactionErrors.NOT_OWNER);
    }
    if (txDetails.executed) {
      throw new Error(TransactionErrors.TX_ALREADY_EXECUTED);
    }
    if (txDetails.cancelled) {
      throw new Error('Transaction has been cancelled');
    }
    if (hasApproved) {
      throw new Error('You have already approved this transaction');
    }

    const { gasLimit } = await estimateGasWithBuffer(
      wallet.approveAndExecute,
      [normalizedHash],
      GasPresets.complex
    );

    let tx;
    try {
      tx = await wallet.approveAndExecute(normalizedHash, buildTxOptions(gasLimit));
    } catch (error) {
      throw formatTransactionError(error, 'Approve and execute failed', wallet);
    }

    const receipt = await tx.wait();
    logGasUsage('approveAndExecute', receipt, gasLimit);

    if (receipt?.status === 0) {
      throw new Error('Transaction reverted');
    }

    // Check if transaction was executed by looking for TransactionExecuted event
    for (const log of receipt.logs || []) {
      try {
        const parsed = wallet.interface.parseLog(log);
        if (parsed?.name === 'TransactionExecuted' && parsed.args?.txHash === normalizedHash) {
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
  }

  /**
   * Get transaction details
   */
  async getTransaction(walletAddress: string, txHash: string): Promise<Transaction> {
    const wallet = this.getWalletContract(walletAddress);
    const tx = await wallet.transactions(txHash);

    return {
      to: tx.to,
      value: tx.value,
      data: tx.data,
      executed: tx.executed,
      numApprovals: tx.numApprovals,
      timestamp: tx.timestamp,
    };
  }

  /**
   * Get a specific transaction by hash
   */
  async getTransactionByHash(walletAddress: string, txHash: string): Promise<PendingTransaction | null> {
    try {
      const wallet = this.getWalletContract(walletAddress);
      const [owners, threshold, tx] = await Promise.all([
        wallet.getOwners(),
        wallet.threshold(),
        wallet.transactions(txHash),
      ]);

      const zeroAddress = '0x0000000000000000000000000000000000000000';
      if (tx.to.toLowerCase() === zeroAddress.toLowerCase()) {
        return null;
      }

      const approvals = await this.getApprovalsForTransaction(wallet, txHash, owners);

      return {
        hash: txHash,
        to: tx.to,
        value: tx.value.toString(),
        data: tx.data,
        numApprovals: Number(tx.numApprovals),
        threshold: Number(threshold),
        executed: tx.executed,
        cancelled: tx.cancelled || false,
        timestamp: Number(tx.timestamp),
        proposer: tx.proposer || '',
        approvals,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get pending transactions for a wallet
   */
  async getPendingTransactions(walletAddress: string): Promise<PendingTransaction[]> {
    return this.getTransactionsByFilter(walletAddress, 'TransactionProposed', tx => !tx.executed && !tx.cancelled);
  }

  /**
   * Get executed transactions for a wallet
   */
  async getExecutedTransactions(walletAddress: string): Promise<PendingTransaction[]> {
    return this.getTransactionsByFilter(walletAddress, 'TransactionExecuted', tx => tx.executed);
  }

  /**
   * Get cancelled transactions for a wallet
   */
  async getCancelledTransactions(walletAddress: string): Promise<PendingTransaction[]> {
    return this.getTransactionsByFilter(walletAddress, 'TransactionCancelled', tx => tx.cancelled);
  }

  // ============ Private Helper Methods ============

  /**
   * Check for existing transaction with same parameters
   */
  private async checkExistingTransaction(
    wallet: Contract,
    to: string,
    value: bigint,
    data: string,
    walletAddress: string
  ): Promise<void> {
    try {
      const nonce = await wallet.nonce();
      const txHash = await wallet.getTransactionHash(to, value, data, nonce);
      const existingTx = await wallet.transactions(txHash);

      const zeroAddress = '0x0000000000000000000000000000000000000000';
      if (existingTx.to.toLowerCase() !== zeroAddress.toLowerCase()) {
        if (existingTx.cancelled) {
          // Transaction exists but is cancelled - re-proposing will overwrite it
        } else if (existingTx.executed) {
          throw new Error('This transaction was already executed');
        } else {
          const txDetails = await this.getTransactionByHash(walletAddress, txHash);
          throw new Error(
            `A transaction with these parameters already exists (hash: ${txHash}). ` +
            `It has ${txDetails?.numApprovals || 0}/${txDetails?.threshold || 0} approvals.`
          );
        }
      }
    } catch (error) {
      if (error.message?.includes('already exists') || error.message?.includes('already executed')) {
        throw error;
      }
      // Transaction doesn't exist yet
    }
  }

  /**
   * Validate gas estimation for proposal
   */
  private async validateProposalGas(
    wallet: Contract,
    to: string,
    value: bigint,
    data: string,
    walletAddress: string
  ): Promise<void> {
    // Skip for cancelled transaction overwrites
    try {
      const nonce = await wallet.nonce();
      const txHash = await wallet.getTransactionHash(to, value, data, nonce);
      const existingTx = await wallet.transactions(txHash);
      if (existingTx.cancelled) {
        return;
      }
    } catch {
      // Continue
    }

    try {
      await wallet.proposeTransaction.estimateGas(to, value, data);
    } catch (error) {
      if (error.reason && !error.reason.includes('missing revert data')) {
        throw new Error(`Transaction proposal would fail: ${error.reason}`);
      }
    }
  }

  /**
   * Build options for self-call transactions
   */
  private async buildSelfCallOptions(signer: any): Promise<Record<string, any>> {
    const txOptions: Record<string, any> = {
      gasLimit: 200000n,
    };

    try {
      const callerAddress = await signer.getAddress();
      const currentNonce = await this.provider.getTransactionCount(callerAddress, 'pending');
      txOptions.nonce = currentNonce;
    } catch {
      // Use default nonce if explicit nonce fails
    }

    return txOptions;
  }

  /**
   * Extract transaction hash from proposal receipt
   */
  private extractTxHashFromReceipt(receipt: any, wallet: Contract): string {
    // Method 1: Check fragment name
    let event = receipt.logs.find((log: any) => log.fragment?.name === 'TransactionProposed');
    if (event?.args?.txHash) {
      return event.args.txHash;
    }

    // Method 2: Parse logs using interface
    for (const log of receipt.logs) {
      try {
        const parsed = wallet.interface.parseLog(log);
        if (parsed?.name === 'TransactionProposed' && parsed.args?.txHash) {
          return parsed.args.txHash;
        }
      } catch {
        continue;
      }
    }

    // Method 3: Check topics
    try {
      const eventDef = wallet.interface.getEvent('TransactionProposed');
      if (eventDef) {
        const foundLog = receipt.logs.find(
          (log: any) => log.topics?.[0] === eventDef.topicHash
        );
        if (foundLog) {
          const parsed = wallet.interface.parseLog(foundLog);
          if (parsed?.args?.txHash) {
            return parsed.args.txHash;
          }
        }
      }
    } catch {
      // Fall through to error
    }

    throw new Error('Transaction proposal event not found');
  }

  /**
   * Validate revoke approval preconditions
   */
  private async validateRevokeApproval(
    wallet: Contract,
    txHash: string,
    signerAddress: string
  ): Promise<void> {
    const txDetails = await wallet.transactions(txHash);
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    if (txDetails.to === zeroAddress) {
      throw new Error(TransactionErrors.TX_NOT_FOUND);
    }
    if (txDetails.executed) {
      throw new Error('Cannot revoke approval for an executed transaction');
    }
    if (txDetails.cancelled) {
      throw new Error('Cannot revoke approval for a cancelled transaction');
    }

    const hasApproved = await wallet.approvals(txHash, signerAddress);
    if (!hasApproved) {
      throw new Error(TransactionErrors.NOT_APPROVED);
    }
  }

  /**
   * Validate cancel transaction preconditions
   */
  private async validateCancelTransaction(
    wallet: Contract,
    txHash: string,
    callerAddress: string
  ): Promise<void> {
    const [txDetails, threshold, isOwner] = await Promise.all([
      wallet.transactions(txHash),
      wallet.threshold(),
      wallet.isOwner(callerAddress),
    ]);

    const zeroAddress = '0x0000000000000000000000000000000000000000';

    if (txDetails.to.toLowerCase() === zeroAddress.toLowerCase()) {
      throw new Error(TransactionErrors.TX_NOT_FOUND);
    }
    if (txDetails.executed) {
      throw new Error('Cannot cancel an executed transaction');
    }
    if (txDetails.cancelled) {
      throw new Error('Transaction has already been cancelled');
    }
    if (!isOwner) {
      throw new Error(TransactionErrors.NOT_OWNER);
    }

    const isProposer = txDetails.proposer?.toLowerCase() === callerAddress.toLowerCase();
    if (!isProposer) {
      const currentApprovals = Number(txDetails.numApprovals);
      const requiredThreshold = Number(threshold);
      if (currentApprovals < requiredThreshold) {
        throw new Error(
          `Only the proposer can cancel immediately. To cancel as non-proposer, ` +
          `needs ${requiredThreshold} approvals (has ${currentApprovals})`
        );
      }
    }
  }

  /**
   * Validate execute transaction preconditions
   */
  private async validateExecuteTransaction(
    wallet: Contract,
    txHash: string,
    walletAddress: string
  ): Promise<any> {
    const txDetails = await wallet.transactions(txHash);
    const threshold = await wallet.threshold();
    const zeroAddress = '0x0000000000000000000000000000000000000000';

    if (txDetails.to.toLowerCase() === zeroAddress.toLowerCase()) {
      throw new Error(TransactionErrors.TX_NOT_FOUND);
    }
    if (txDetails.executed) {
      throw new Error(TransactionErrors.TX_ALREADY_EXECUTED);
    }
    if (txDetails.cancelled) {
      throw new Error('Transaction has been cancelled and cannot be executed');
    }
    if (txDetails.numApprovals < threshold) {
      throw new Error(TransactionErrors.NOT_ENOUGH_APPROVALS(
        Number(txDetails.numApprovals),
        Number(threshold)
      ));
    }

    // Check removeOwner constraints for self-calls
    if (txDetails.to.toLowerCase() === walletAddress.toLowerCase() && txDetails.data !== '0x') {
      await this.validateSelfCallConstraints(wallet, txDetails);
    }

    return txDetails;
  }

  /**
   * Validate self-call constraints (owner management)
   */
  private async validateSelfCallConstraints(wallet: Contract, txDetails: any): Promise<void> {
    try {
      const decoded = wallet.interface.parseTransaction({ data: txDetails.data });
      if (decoded?.name === 'removeOwner') {
        const owners = await wallet.getOwners();
        const threshold = await wallet.threshold();
        if (owners.length - 1 < Number(threshold)) {
          throw new Error(
            `Cannot remove owner: would reduce owners to ${owners.length - 1}, ` +
            `but threshold is ${threshold}. Lower the threshold first.`
          );
        }
      }
    } catch (error) {
      if (error.message?.includes('Cannot remove owner')) {
        throw error;
      }
    }
  }

  /**
   * Get approvals for each owner
   * Uses Promise.all for parallel fetching instead of sequential loop
   */
  private async getApprovalsForTransaction(
    wallet: Contract,
    txHash: string,
    owners: string[]
  ): Promise<{ [owner: string]: boolean }> {
    const approvalResults = await Promise.all(
      owners.map(async (owner) => {
        const approved = await wallet.approvals(txHash, owner);
        return { owner: owner.toLowerCase(), approved };
      })
    );

    const approvals: { [owner: string]: boolean } = {};
    for (const { owner, approved } of approvalResults) {
      approvals[owner] = approved;
    }
    return approvals;
  }

  /**
   * Get transactions by event filter
   */
  private async getTransactionsByFilter(
    walletAddress: string,
    eventName: string,
    filterFn: (tx: any) => boolean
  ): Promise<PendingTransaction[]> {
    const wallet = this.getWalletContract(walletAddress);
    const [owners, threshold] = await Promise.all([
      wallet.getOwners(),
      wallet.threshold(),
    ]);

    const filter = wallet.filters[eventName]();
    let events: any[] = [];

    try {
      events = await wallet.queryFilter(filter, -5000, 'latest');
    } catch (error) {
      if (error.message?.includes('exceeds maximum limit')) {
        try {
          events = await wallet.queryFilter(filter, -2000, 'latest');
        } catch {
          events = [];
        }
      }
    }

    const transactions: PendingTransaction[] = [];
    const seenHashes = new Set<string>();

    for (const event of events) {
      if (!('args' in event)) continue;
      const txHash = event.args.txHash;
      if (!txHash || seenHashes.has(txHash.toLowerCase())) continue;
      seenHashes.add(txHash.toLowerCase());

      try {
        const tx = await wallet.transactions(txHash);
        if (!filterFn(tx)) continue;

        const approvals = await this.getApprovalsForTransaction(wallet, txHash, owners);

        transactions.push({
          hash: txHash,
          to: tx.to,
          value: tx.value.toString(),
          data: tx.data,
          numApprovals: Number(tx.numApprovals),
          threshold: Number(threshold),
          executed: tx.executed,
          cancelled: tx.cancelled || false,
          timestamp: Number(tx.timestamp),
          proposer: tx.proposer || event.args.proposer || '',
          approvals,
        });
      } catch {
        // Skip transactions that fail to load
      }
    }

    transactions.sort((a, b) => b.timestamp - a.timestamp);
    return transactions;
  }
}
