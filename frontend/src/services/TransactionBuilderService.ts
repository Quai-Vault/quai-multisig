import { Interface, isAddress, isHexString, formatQuai, parseQuai, keccak256, solidityPacked } from 'quais';
import type { Provider } from 'quais';
import type { TransactionData, DecodedTransaction, ValidationResult } from '../types';

export class TransactionBuilderService {
  /**
   * Build a simple transfer transaction
   */
  buildTransfer(to: string, value: bigint): TransactionData {
    return {
      to,
      value,
      data: '0x',
    };
  }

  /**
   * Build a contract interaction transaction
   */
  buildContractCall(
    contractAddress: string,
    abi: any[],
    functionName: string,
    args: any[],
    value: bigint = 0n
  ): TransactionData {
    const iface = new Interface(abi);
    const data = iface.encodeFunctionData(functionName, args);

    return {
      to: contractAddress,
      value,
      data,
    };
  }

  /**
   * Build transaction to add an owner
   */
  buildAddOwner(newOwner: string): TransactionData {
    const iface = new Interface([
      'function addOwner(address owner)',
    ]);

    return {
      to: '', // Will be set to wallet address
      value: 0n,
      data: iface.encodeFunctionData('addOwner', [newOwner]),
    };
  }

  /**
   * Build transaction to remove an owner
   */
  buildRemoveOwner(owner: string): TransactionData {
    const iface = new Interface([
      'function removeOwner(address owner)',
    ]);

    return {
      to: '', // Will be set to wallet address
      value: 0n,
      data: iface.encodeFunctionData('removeOwner', [owner]),
    };
  }

  /**
   * Build transaction to change threshold
   */
  buildChangeThreshold(newThreshold: number): TransactionData {
    const iface = new Interface([
      'function changeThreshold(uint256 threshold)',
    ]);

    return {
      to: '', // Will be set to wallet address
      value: 0n,
      data: iface.encodeFunctionData('changeThreshold', [newThreshold]),
    };
  }

  /**
   * Build transaction to enable a module
   */
  buildEnableModule(moduleAddress: string): TransactionData {
    const iface = new Interface([
      'function enableModule(address module)',
    ]);

    return {
      to: '', // Will be set to wallet address
      value: 0n,
      data: iface.encodeFunctionData('enableModule', [moduleAddress]),
    };
  }

  /**
   * Build transaction to disable a module
   */
  buildDisableModule(moduleAddress: string): TransactionData {
    const iface = new Interface([
      'function disableModule(address module)',
    ]);

    return {
      to: '', // Will be set to wallet address
      value: 0n,
      data: iface.encodeFunctionData('disableModule', [moduleAddress]),
    };
  }

  /**
   * Decode transaction data
   */
  decodeTransaction(data: string, abi: any[]): DecodedTransaction | null {
    if (data === '0x' || data === '') {
      return {
        method: 'transfer',
        params: [],
      };
    }

    try {
      const iface = new Interface(abi);
      const decoded = iface.parseTransaction({ data });

      if (!decoded) {
        return null;
      }

      return {
        method: decoded.name,
        params: decoded.args.map((arg, index) => ({
          name: decoded.fragment.inputs[index].name,
          type: decoded.fragment.inputs[index].type,
          value: arg,
        })),
      };
    } catch (error) {
      // Log without transaction data to avoid leaking sensitive information
      console.error('Failed to decode transaction:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  /**
   * Validate transaction data
   */
  validateTransaction(tx: TransactionData): ValidationResult {
    const errors: string[] = [];

    // Validate address
    if (!tx.to || !isAddress(tx.to)) {
      errors.push('Invalid recipient address');
    }

    // Validate value
    if (tx.value < 0n) {
      errors.push('Value cannot be negative');
    }

    // Validate data format
    if (tx.data && !isHexString(tx.data)) {
      errors.push('Invalid transaction data format');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    provider: Provider,
    from: string,
    tx: TransactionData
  ): Promise<bigint> {
    try {
      return await provider.estimateGas({
        from,
        to: tx.to,
        value: tx.value,
        data: tx.data,
      });
    } catch (error) {
      // Log without sensitive details
      console.error('Failed to estimate gas:', error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Gas estimation failed');
    }
  }

  /**
   * Format transaction for display
   */
  formatTransaction(tx: TransactionData, decoded?: DecodedTransaction | null): string {
    if (!decoded || decoded.method === 'transfer') {
      return `Transfer ${formatQuai(tx.value)} QUAI to ${tx.to}`;
    }

    const params = decoded.params
      .map((p: any) => `${p.name}: ${p.value}`)
      .join(', ');

    return `${decoded.method}(${params})`;
  }

  /**
   * Parse transaction value from string
   */
  parseValue(value: string): bigint {
    try {
      return parseQuai(value);
    } catch (error) {
      throw new Error('Invalid value format');
    }
  }

  /**
   * Format value for display
   */
  formatValue(value: bigint, decimals: number = 4): string {
    return parseFloat(formatQuai(value)).toFixed(decimals);
  }

  /**
   * Build batch transaction data
   * Note: Multicall/batch transactions are not yet supported.
   * This method only accepts a single transaction.
   *
   * @throws Error if no transactions or more than one transaction provided
   */
  buildBatchTransaction(transactions: TransactionData[]): TransactionData {
    if (transactions.length === 0) {
      throw new Error('No transactions provided');
    }

    if (transactions.length > 1) {
      throw new Error(
        `Batch transactions are not yet supported. ` +
        `Received ${transactions.length} transactions, but only 1 is allowed. ` +
        `Please submit transactions individually.`
      );
    }

    return transactions[0];
  }

  /**
   * Compute transaction hash for proposal
   */
  computeTransactionHash(
    to: string,
    value: bigint,
    data: string,
    nonce: bigint
  ): string {
    return keccak256(
      solidityPacked(
        ['address', 'uint256', 'bytes', 'uint256'],
        [to, value, data, nonce]
      )
    );
  }
}

// Singleton instance
export const transactionBuilderService = new TransactionBuilderService();
