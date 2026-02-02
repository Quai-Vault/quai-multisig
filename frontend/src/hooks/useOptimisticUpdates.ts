import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAddress } from 'quais';
import type { PendingTransaction } from '../types';
import { INDEXER_CONFIG } from '../config/supabase';

// Track pending cleanup timeouts by transaction hash
type TimeoutMap = Map<string, ReturnType<typeof setTimeout>>;

/**
 * Hook for managing optimistic updates to transaction data
 *
 * Provides functions to optimistically update the React Query cache
 * when transactions are proposed, approved, or executed, before the
 * indexer catches up.
 *
 * @param walletAddress - The wallet address to manage updates for
 */
export function useOptimisticUpdates(walletAddress: string) {
  const queryClient = useQueryClient();
  const pendingTimeoutsRef = useRef<TimeoutMap>(new Map());

  // Clean up all pending timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      pendingTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      pendingTimeoutsRef.current.clear();
    };
  }, []);

  /**
   * Add an optimistic transaction to the pending list
   * Uses checksummed addresses for consistency with TransactionConverter
   */
  const addOptimisticTransaction = useCallback(
    (tx: Partial<PendingTransaction> & { hash: string }) => {
      // Checksum addresses for consistency
      const checksummedTo = tx.to ? getAddress(tx.to) : '';
      const checksummedProposer = tx.proposer ? getAddress(tx.proposer) : '';
      const checksummedApprovals: { [owner: string]: boolean } = {};
      if (tx.approvals) {
        Object.entries(tx.approvals).forEach(([addr, approved]) => {
          checksummedApprovals[getAddress(addr)] = approved;
        });
      }

      queryClient.setQueryData<PendingTransaction[]>(
        ['pendingTransactions', walletAddress],
        (old = []) => [
          {
            hash: tx.hash,
            to: checksummedTo,
            value: tx.value ?? '0',
            data: tx.data ?? '0x',
            numApprovals: tx.numApprovals ?? 1,
            threshold: tx.threshold ?? 1,
            executed: false,
            cancelled: false,
            timestamp: tx.timestamp ?? Date.now() / 1000,
            proposer: checksummedProposer,
            approvals: checksummedApprovals,
            _optimistic: true,
          },
          ...old,
        ]
      );
    },
    [queryClient, walletAddress]
  );

  /**
   * Update a transaction with an optimistic approval
   * Uses checksummed addresses for consistency with TransactionConverter
   */
  const updateOptimisticApproval = useCallback(
    (txHash: string, approver: string) => {
      const checksummedApprover = getAddress(approver);
      queryClient.setQueryData<PendingTransaction[]>(
        ['pendingTransactions', walletAddress],
        (old = []) =>
          old.map((tx) =>
            tx.hash === txHash
              ? {
                  ...tx,
                  numApprovals: tx.numApprovals + 1,
                  approvals: { ...tx.approvals, [checksummedApprover]: true },
                  _optimistic: true,
                }
              : tx
          )
      );
    },
    [queryClient, walletAddress]
  );

  /**
   * Update a transaction with an optimistic revocation
   * Uses checksummed addresses for consistency with TransactionConverter
   */
  const updateOptimisticRevocation = useCallback(
    (txHash: string, revoker: string) => {
      const checksummedRevoker = getAddress(revoker);
      queryClient.setQueryData<PendingTransaction[]>(
        ['pendingTransactions', walletAddress],
        (old = []) =>
          old.map((tx) =>
            tx.hash === txHash
              ? {
                  ...tx,
                  numApprovals: Math.max(0, tx.numApprovals - 1),
                  approvals: Object.fromEntries(
                    Object.entries(tx.approvals).filter(
                      ([addr]) => addr !== checksummedRevoker
                    )
                  ),
                  _optimistic: true,
                }
              : tx
          )
      );
    },
    [queryClient, walletAddress]
  );

  /**
   * Mark a transaction as optimistically executed
   */
  const markOptimisticExecuted = useCallback(
    (txHash: string) => {
      queryClient.setQueryData<PendingTransaction[]>(
        ['pendingTransactions', walletAddress],
        (old = []) => old.filter((tx) => tx.hash !== txHash)
      );

      // Also add to executed transactions cache if it exists
      queryClient.setQueryData<PendingTransaction[]>(
        ['executedTransactions', walletAddress],
        (old = []) => {
          const pendingTx = queryClient
            .getQueryData<PendingTransaction[]>(['pendingTransactions', walletAddress])
            ?.find((tx) => tx.hash === txHash);

          if (pendingTx) {
            return [{ ...pendingTx, executed: true, _optimistic: true }, ...old];
          }
          return old;
        }
      );
    },
    [queryClient, walletAddress]
  );

  /**
   * Mark a transaction as optimistically cancelled
   */
  const markOptimisticCancelled = useCallback(
    (txHash: string) => {
      queryClient.setQueryData<PendingTransaction[]>(
        ['pendingTransactions', walletAddress],
        (old = []) => old.filter((tx) => tx.hash !== txHash)
      );
    },
    [queryClient, walletAddress]
  );

  /**
   * Schedule cleanup for a specific transaction's optimistic update
   * The timeout will be cancelled if real data arrives via subscription before it fires
   */
  const scheduleOptimisticCleanup = useCallback(
    (txHash: string) => {
      // Clear any existing timeout for this transaction
      const existingTimeout = pendingTimeoutsRef.current.get(txHash);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Schedule new cleanup
      const timeout = setTimeout(() => {
        pendingTimeoutsRef.current.delete(txHash);
        // Only invalidate if there are still optimistic entries in the cache
        const pendingTxs = queryClient.getQueryData<PendingTransaction[]>([
          'pendingTransactions',
          walletAddress,
        ]);
        const hasOptimistic = pendingTxs?.some((tx) => tx._optimistic && tx.hash === txHash);
        if (hasOptimistic) {
          queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
        }
      }, INDEXER_CONFIG.OPTIMISTIC_TIMEOUT_MS);

      pendingTimeoutsRef.current.set(txHash, timeout);
    },
    [queryClient, walletAddress]
  );

  /**
   * Cancel pending cleanup for a transaction (call when real data arrives)
   */
  const cancelOptimisticCleanup = useCallback((txHash: string) => {
    const timeout = pendingTimeoutsRef.current.get(txHash);
    if (timeout) {
      clearTimeout(timeout);
      pendingTimeoutsRef.current.delete(txHash);
    }
  }, []);

  /**
   * @deprecated Use scheduleOptimisticCleanup instead for per-transaction cleanup
   * Legacy function that invalidates all transaction queries after a delay
   */
  const removeOptimisticFlag = useCallback(() => {
    // Invalidate after a delay to allow indexer to catch up
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['executedTransactions', walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['cancelledTransactions', walletAddress] });
    }, INDEXER_CONFIG.OPTIMISTIC_TIMEOUT_MS);
  }, [queryClient, walletAddress]);

  /**
   * Immediately refresh all transaction data (used on error)
   */
  const refreshTransactions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
    queryClient.invalidateQueries({ queryKey: ['executedTransactions', walletAddress] });
    queryClient.invalidateQueries({ queryKey: ['cancelledTransactions', walletAddress] });
  }, [queryClient, walletAddress]);

  return {
    addOptimisticTransaction,
    updateOptimisticApproval,
    updateOptimisticRevocation,
    markOptimisticExecuted,
    markOptimisticCancelled,
    scheduleOptimisticCleanup,
    cancelOptimisticCleanup,
    removeOptimisticFlag, // Deprecated, kept for backwards compatibility
    refreshTransactions,
  };
}
