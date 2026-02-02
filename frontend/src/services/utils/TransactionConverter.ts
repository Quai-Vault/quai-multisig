import { getAddress } from 'quais';
import type { IndexerTransaction, Confirmation } from '../../types/database';
import type { PendingTransaction } from '../../types';

/**
 * Converts indexer transaction format to frontend PendingTransaction format
 * Used for consistent data shape across indexer and blockchain sources
 *
 * Indexer stores addresses in lowercase, but we return checksummed addresses
 * for display and blockchain compatibility.
 *
 * @param tx - Transaction from indexer
 * @param walletThreshold - Threshold from wallet (transactions don't store this)
 * @param confirmations - Confirmations for this transaction (optional)
 */
export function convertIndexerTransaction(
  tx: IndexerTransaction,
  walletThreshold: number,
  confirmations: Confirmation[] = []
): PendingTransaction {
  // Only count active (non-revoked) confirmations
  const activeConfirmations = confirmations.filter((c) => c.is_active);

  // Use checksummed addresses for display and comparison
  const approvals: { [owner: string]: boolean } = {};
  activeConfirmations.forEach((c) => {
    approvals[getAddress(c.owner_address)] = true;
  });

  return {
    hash: tx.tx_hash,
    to: getAddress(tx.to_address),
    value: tx.value,
    data: tx.data ?? '0x',
    numApprovals: tx.confirmation_count,
    threshold: walletThreshold,
    executed: tx.status === 'executed',
    cancelled: tx.status === 'cancelled',
    timestamp: new Date(tx.created_at).getTime() / 1000,
    proposer: getAddress(tx.submitted_by),
    approvals,
  };
}

/**
 * Converts a list of transactions with their confirmations
 *
 * @param transactions - Transactions from indexer
 * @param walletThreshold - Threshold from wallet
 * @param getConfirmations - Function to fetch confirmations for a transaction
 */
export async function convertIndexerTransactions(
  transactions: IndexerTransaction[],
  walletThreshold: number,
  getConfirmations: (txHash: string) => Promise<Confirmation[]>
): Promise<PendingTransaction[]> {
  return Promise.all(
    transactions.map(async (tx) => {
      const confirmations = await getConfirmations(tx.tx_hash);
      return convertIndexerTransaction(tx, walletThreshold, confirmations);
    })
  );
}
