import { useCallback, useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletStore } from '../store/walletStore';
import { multisigService } from '../services/MultisigService';
import { notificationManager } from '../components/NotificationContainer';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import { INDEXER_CONFIG } from '../config/supabase';
import { indexerService } from '../services/indexer';
import { convertIndexerTransaction } from '../services/utils/TransactionConverter';
import { useIndexerConnection } from './useIndexerConnection';
import type { DeploymentConfig, TransactionData, PendingTransaction } from '../types';
import { formatQuai } from 'quais';

// Polling intervals (in milliseconds)
const POLLING_INTERVALS = {
  WALLET_INFO: 15000,        // 15 seconds - balance and owner info
  PENDING_TXS: 10000,        // 10 seconds - pending transactions (most critical)
  TRANSACTION_HISTORY: 30000, // 30 seconds - executed/cancelled transactions
  USER_WALLETS: 20000,       // 20 seconds - wallet list
} as const;

// Maximum number of wallets to track in memory (LRU eviction after this limit)
// Prevents memory leaks in long-running sessions
const MAX_TRACKED_WALLETS = 50;

/**
 * Simple LRU Map that evicts oldest entries when max size is exceeded
 * Uses Map's insertion order for LRU behavior (oldest entries are first)
 */
class LRUMap<K, V> extends Map<K, V> {
  constructor(private maxSize: number) {
    super();
  }

  set(key: K, value: V): this {
    // If key exists, delete and re-add to update access order
    if (this.has(key)) {
      this.delete(key);
    }
    super.set(key, value);

    // Evict oldest entries if over limit
    while (this.size > this.maxSize) {
      const oldestKey = this.keys().next().value;
      if (oldestKey !== undefined) {
        this.delete(oldestKey);
      }
    }
    return this;
  }

  get(key: K): V | undefined {
    const value = super.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.delete(key);
      super.set(key, value);
    }
    return value;
  }
}

// Global tracking of last notified balances (shared across all hook instances)
// This prevents duplicate notifications when multiple components use the same wallet
// Uses LRU eviction to prevent memory leaks
const lastNotifiedBalances = new LRUMap<string, string>(MAX_TRACKED_WALLETS);

// Global tracking of notified transaction states per wallet (executed, cancelled, ready to execute)
// Using LRU Maps keyed by wallet address for proper cleanup
const notifiedExecutedTxs = new LRUMap<string, Set<string>>(MAX_TRACKED_WALLETS);
const notifiedCancelledTxs = new LRUMap<string, Set<string>>(MAX_TRACKED_WALLETS);
const notifiedReadyTxs = new LRUMap<string, Set<string>>(MAX_TRACKED_WALLETS);
const notifiedProposedTxs = new LRUMap<string, Set<string>>(MAX_TRACKED_WALLETS);

// Global tracking of notified approvals (to detect when someone else approves)
// Using 2-level structure: walletAddress -> Map<txHash, Set<approvers>>
// This prevents unbounded growth from composite keys
const notifiedApprovals = new LRUMap<string, Map<string, Set<string>>>(MAX_TRACKED_WALLETS);

// Maximum number of transactions to keep in cache per wallet
const MAX_CACHE_TRANSACTIONS = 500;

// Global tracking of notified wallet changes (owners, threshold)
const lastNotifiedOwners = new LRUMap<string, string>(MAX_TRACKED_WALLETS);
const lastNotifiedThresholds = new LRUMap<string, number>(MAX_TRACKED_WALLETS);

// Global tracking of notified module status changes
const lastNotifiedModuleStatus = new LRUMap<string, Record<string, boolean>>(MAX_TRACKED_WALLETS);

// Track which wallets are being watched by active hook instances (for cleanup)
// This one doesn't need LRU since it's cleaned up when hooks unmount
const activeWalletSubscriptions = new Map<string, number>();

/**
 * Clean up global state for a wallet when no longer needed
 */
function cleanupWalletState(walletAddress: string): void {
  const normalizedAddress = walletAddress.toLowerCase();
  lastNotifiedBalances.delete(normalizedAddress);
  lastNotifiedOwners.delete(normalizedAddress);
  lastNotifiedThresholds.delete(normalizedAddress);
  lastNotifiedModuleStatus.delete(normalizedAddress);
  notifiedExecutedTxs.delete(normalizedAddress);
  notifiedCancelledTxs.delete(normalizedAddress);
  notifiedReadyTxs.delete(normalizedAddress);
  notifiedProposedTxs.delete(normalizedAddress);

  // notifiedApprovals uses 2-level structure, just delete the wallet entry
  notifiedApprovals.delete(normalizedAddress);
}

// Module address to name mapping
const MODULE_NAMES: Record<string, string> = {
  [CONTRACT_ADDRESSES.SOCIAL_RECOVERY_MODULE]: 'Social Recovery',
  [CONTRACT_ADDRESSES.DAILY_LIMIT_MODULE]: 'Daily Limit',
  [CONTRACT_ADDRESSES.WHITELIST_MODULE]: 'Whitelist',
};

/**
 * Hook to detect if the page is visible (not hidden/minimized)
 */
function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

export function useMultisig(walletAddress?: string) {
  const queryClient = useQueryClient();
  const isPageVisible = usePageVisibility();
  const { isConnected: isIndexerConnected } = useIndexerConnection();
  const {
    address: connectedAddress,
    setError,
    setLoading,
    setWalletInfo,
    setPendingTransactions,
  } = useWalletStore();

  // Track previous balances for each wallet (using ref to persist across renders)
  const prevBalancesRef = useRef<Map<string, string>>(new Map());

  // Track previous pending transactions state (for approval changes)
  const prevPendingTxsRef = useRef<Map<string, Map<string, PendingTransaction>>>(new Map()); // walletAddress -> Map<txHash, tx>

  // Track previous wallet info (for owner/threshold changes)
  const prevWalletInfoRef = useRef<Map<string, { owners: string[]; threshold: number }>>(new Map());

  // Global processing queue for ALL subscription cache updates (prevents race conditions)
  // Using a single queue ensures setQueryData calls don't interleave across different transactions
  const cacheUpdateQueueRef = useRef<Promise<void>>(Promise.resolve());
  // Track queue size to prevent unbounded growth during high-frequency updates
  const cacheUpdateQueueSizeRef = useRef<number>(0);
  const MAX_QUEUE_SIZE = 50;

  // Track active subscription count for cleanup
  useEffect(() => {
    if (!walletAddress) return;
    const normalizedAddress = walletAddress.toLowerCase();

    // Increment subscription count
    activeWalletSubscriptions.set(
      normalizedAddress,
      (activeWalletSubscriptions.get(normalizedAddress) ?? 0) + 1
    );

    return () => {
      // Decrement subscription count on unmount
      const count = activeWalletSubscriptions.get(normalizedAddress) ?? 1;
      if (count <= 1) {
        activeWalletSubscriptions.delete(normalizedAddress);
        // Clean up global state when no hooks are watching this wallet
        cleanupWalletState(normalizedAddress);
      } else {
        activeWalletSubscriptions.set(normalizedAddress, count - 1);
      }
    };
  }, [walletAddress]);

  // Get wallet info
  const {
    data: walletInfo,
    isLoading: isLoadingInfo,
    refetch: refetchWalletInfo,
    isRefetching: isRefetchingWalletInfo,
  } = useQuery({
    queryKey: ['walletInfo', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const info = await multisigService.getWalletInfo(walletAddress);
      setWalletInfo(walletAddress, info);
      return info;
    },
    enabled: !!walletAddress && isPageVisible,
    refetchInterval: isPageVisible ? POLLING_INTERVALS.WALLET_INFO : false,
  });

  // Track wallet info changes for notifications (balance, owners, threshold)
  useEffect(() => {
    if (walletInfo && walletAddress) {
      const prevInfo = prevWalletInfoRef.current.get(walletAddress);
      
      // Track balance changes
      const currentBalance = walletInfo.balance;
      const prevBalance = prevBalancesRef.current.get(walletAddress);
      const lastNotifiedBalance = lastNotifiedBalances.get(walletAddress);
      
      if (prevBalance && currentBalance) {
        const prevBigInt = BigInt(prevBalance);
        const currentBigInt = BigInt(currentBalance);
        const lastNotifiedBigInt = lastNotifiedBalance ? BigInt(lastNotifiedBalance) : null;
        
        const hasIncreased = currentBigInt > prevBigInt;
        const alreadyNotified = lastNotifiedBigInt !== null && currentBigInt === lastNotifiedBigInt;
        
        if (hasIncreased && !alreadyNotified) {
          const increase = currentBigInt - prevBigInt;
          const increaseFormatted = parseFloat(formatQuai(increase)).toFixed(4);
          const totalFormatted = parseFloat(formatQuai(currentBigInt)).toFixed(4);
          
          lastNotifiedBalances.set(walletAddress, currentBalance);
          
          notificationManager.add({
            message: `💰 Vault received ${increaseFormatted} QUAI! New balance: ${totalFormatted} QUAI`,
            type: 'success',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Vault Received Funds', {
              body: `Received ${increaseFormatted} QUAI. New balance: ${totalFormatted} QUAI`,
              icon: '/vite.svg',
              tag: `${walletAddress}-${currentBalance}`,
            });
          }
        }
      }
      
      prevBalancesRef.current.set(walletAddress, currentBalance);
      
      // Track owner changes
      if (prevInfo) {
        const prevOwners = prevInfo.owners.map(o => o.toLowerCase()).sort();
        const currentOwners = walletInfo.owners.map(o => o.toLowerCase()).sort();

        // Use Set comparison instead of JSON.stringify for better performance
        const prevOwnersSet = new Set(prevOwners);
        const currentOwnersSet = new Set(currentOwners);
        const ownersChanged = prevOwners.length !== currentOwners.length ||
          prevOwners.some(o => !currentOwnersSet.has(o));

        // Use joined string for notification dedup (sorted, so consistent)
        const currentOwnersKey = currentOwners.join(',');
        const lastNotifiedOwnersKey = lastNotifiedOwners.get(walletAddress);

        if (ownersChanged && currentOwnersKey !== lastNotifiedOwnersKey) {
          const addedOwners = currentOwners.filter(addr => !prevOwnersSet.has(addr));
          const removedOwners = prevOwners.filter(addr => !currentOwnersSet.has(addr));
          
          if (addedOwners.length > 0) {
            addedOwners.forEach((owner) => {
              const ownerShort = `${owner.slice(0, 6)}...${owner.slice(-4)}`;
              notificationManager.add({
                message: `👤 Owner added: ${ownerShort}`,
                type: 'success',
              });
            });
          }
          
          if (removedOwners.length > 0) {
            removedOwners.forEach((owner) => {
              const ownerShort = `${owner.slice(0, 6)}...${owner.slice(-4)}`;
              notificationManager.add({
                message: `👤 Owner removed: ${ownerShort}`,
                type: 'warning',
              });
            });
          }
          
          lastNotifiedOwners.set(walletAddress, currentOwnersKey);
        }
        
        // Track threshold changes
        const prevThreshold = prevInfo.threshold;
        const currentThreshold = walletInfo.threshold;
        const lastNotifiedThreshold = lastNotifiedThresholds.get(walletAddress);
        
        if (prevThreshold !== currentThreshold && currentThreshold !== lastNotifiedThreshold) {
          notificationManager.add({
            message: `⚙️ Threshold changed: ${prevThreshold} → ${currentThreshold}`,
            type: 'info',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Threshold Changed', {
              body: `Approval threshold changed from ${prevThreshold} to ${currentThreshold}`,
              icon: '/vite.svg',
              tag: `threshold-${walletAddress}-${currentThreshold}`,
            });
          }
          
          lastNotifiedThresholds.set(walletAddress, currentThreshold);
        }
      }
      
      // Update stored wallet info
      prevWalletInfoRef.current.set(walletAddress, {
        owners: walletInfo.owners,
        threshold: walletInfo.threshold,
      });
    }
  }, [walletInfo, walletAddress]);

  // Query module statuses to track changes
  const {
    data: moduleStatuses,
  } = useQuery({
    queryKey: ['moduleStatus', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const moduleAddresses = [
        CONTRACT_ADDRESSES.SOCIAL_RECOVERY_MODULE,
        CONTRACT_ADDRESSES.DAILY_LIMIT_MODULE,
        CONTRACT_ADDRESSES.WHITELIST_MODULE,
      ].filter(Boolean) as string[];

      // Use Promise.all for parallel queries instead of sequential
      const results = await Promise.all(
        moduleAddresses.map(async (moduleAddress) => {
          try {
            const isEnabled = await multisigService.isModuleEnabled(walletAddress, moduleAddress);
            return { moduleAddress, isEnabled };
          } catch (error) {
            console.warn(`Failed to check status for module ${moduleAddress}:`,
              error instanceof Error ? error.message : 'Unknown error');
            return { moduleAddress, isEnabled: false };
          }
        })
      );

      const statuses: Record<string, boolean> = {};
      results.forEach(({ moduleAddress, isEnabled }) => {
        statuses[moduleAddress] = isEnabled;
      });
      return statuses;
    },
    enabled: !!walletAddress && isPageVisible,
    refetchInterval: isPageVisible ? POLLING_INTERVALS.WALLET_INFO : false,
  });

  // Track module status changes for notifications
  useEffect(() => {
    if (!moduleStatuses || !walletAddress) return;

    const prevStatuses = lastNotifiedModuleStatus.get(walletAddress) || {};
    const currentStatuses = moduleStatuses;

    // Check each module for status changes
    for (const [moduleAddress, isEnabled] of Object.entries(currentStatuses)) {
      const prevEnabled = prevStatuses[moduleAddress];
      const moduleName = MODULE_NAMES[moduleAddress] || 'Unknown Module';

      // Only notify if status actually changed (not on first load)
      if (prevEnabled !== undefined && prevEnabled !== isEnabled) {
        if (isEnabled) {
          notificationManager.add({
            message: `✅ ${moduleName} module enabled`,
            type: 'success',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`${moduleName} Module Enabled`, {
              body: `The ${moduleName} module has been enabled for this vault`,
              icon: '/vite.svg',
            });
          }
        } else {
          notificationManager.add({
            message: `✅ ${moduleName} module disabled`,
            type: 'success',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`${moduleName} Module Disabled`, {
              body: `The ${moduleName} module has been disabled for this vault`,
              icon: '/vite.svg',
            });
          }
        }
      }
    }

    // Update last notified status
    lastNotifiedModuleStatus.set(walletAddress, { ...currentStatuses });
  }, [moduleStatuses, walletAddress]);

  // Get pending transactions
  const {
    data: pendingTransactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
    isRefetching: isRefetchingPending,
  } = useQuery({
    queryKey: ['pendingTransactions', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const txs = await multisigService.getPendingTransactions(walletAddress);
      setPendingTransactions(walletAddress, txs);
      return txs;
    },
    enabled: !!walletAddress && isPageVisible,
    // Only poll if indexer not connected (subscriptions handle updates when connected)
    refetchInterval: isPageVisible && !isIndexerConnected ? POLLING_INTERVALS.PENDING_TXS : false,
  });

  // Real-time subscriptions when indexer is connected
  useEffect(() => {
    if (!walletAddress || !isIndexerConnected || !INDEXER_CONFIG.ENABLED) return;

    // Track if effect is still active (prevents race conditions on unmount)
    let isActive = true;

    // Helper to queue ALL cache updates sequentially (prevents race conditions)
    // Using a single global queue ensures setQueryData calls don't interleave
    // across different transactions affecting the same query cache
    const queueCacheUpdate = (processor: () => Promise<void>): void => {
      // Prevent unbounded queue growth during high-frequency updates
      if (cacheUpdateQueueSizeRef.current >= MAX_QUEUE_SIZE) {
        console.warn('Cache update queue full, dropping update');
        return;
      }

      cacheUpdateQueueSizeRef.current++;
      cacheUpdateQueueRef.current = cacheUpdateQueueRef.current
        .catch(() => {}) // Ignore errors from previous processing
        .then(async () => {
          // Check if effect is still active before processing
          if (!isActive) return;
          await processor();
        })
        .catch((error) => {
          console.warn('Cache update failed:', error instanceof Error ? error.message : 'Unknown error');
        })
        .finally(() => {
          cacheUpdateQueueSizeRef.current--;
        });
    };

    // Subscribe to transaction updates
    const unsubscribeTx = indexerService.subscription.subscribeToTransactions(walletAddress, {
      onInsert: (tx) => {
        queueCacheUpdate(async () => {
          // Get wallet threshold for conversion
          const wallet = await indexerService.wallet.getWalletDetails(walletAddress);
          if (!wallet || !isActive) return;

          const confirmations = await indexerService.transaction.getActiveConfirmations(
            walletAddress,
            tx.tx_hash
          );
          if (!isActive) return;

          const converted = convertIndexerTransaction(tx, wallet.threshold, confirmations);

          queryClient.setQueryData<PendingTransaction[]>(
            ['pendingTransactions', walletAddress],
            (old = []) => {
              // Remove any optimistic version first
              const filtered = old.filter(
                (t) => !t._optimistic || t.hash !== tx.tx_hash
              );
              // Limit cache size to prevent unbounded growth
              return [converted, ...filtered].slice(0, MAX_CACHE_TRANSACTIONS);
            }
          );
        });
      },
      onUpdate: (tx) => {
        queueCacheUpdate(async () => {
          const wallet = await indexerService.wallet.getWalletDetails(walletAddress);
          if (!wallet || !isActive) return;

          const confirmations = await indexerService.transaction.getActiveConfirmations(
            walletAddress,
            tx.tx_hash
          );
          if (!isActive) return;

          const converted = convertIndexerTransaction(tx, wallet.threshold, confirmations);

          if (tx.status === 'executed' || tx.status === 'cancelled') {
            // Remove from pending
            queryClient.setQueryData<PendingTransaction[]>(
              ['pendingTransactions', walletAddress],
              (old = []) => old.filter((t) => t.hash !== tx.tx_hash)
            );

            // Add to appropriate history
            const historyKey = tx.status === 'executed' ? 'executedTransactions' : 'cancelledTransactions';
            queryClient.setQueryData<PendingTransaction[]>(
              [historyKey, walletAddress],
              // Limit cache size to prevent unbounded growth
              (old = []) => [converted, ...old].slice(0, MAX_CACHE_TRANSACTIONS)
            );
          } else {
            // Update in pending
            queryClient.setQueryData<PendingTransaction[]>(
              ['pendingTransactions', walletAddress],
              (old = []) => old.map((t) => (t.hash === tx.tx_hash ? converted : t))
            );
          }
        });
      },
      onError: (error) => {
        if (!isActive) return;
        console.error('Transaction subscription error:', error instanceof Error ? error.message : 'Unknown error');
        // Invalidate indexer health cache to trigger immediate re-check
        multisigService.invalidateIndexerCache();
        // Refresh data as fallback
        queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
      },
      onReconnect: () => {
        if (!isActive) return;
        // Refresh all transaction data after reconnection to catch any missed events
        queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
        queryClient.invalidateQueries({ queryKey: ['executedTransactions', walletAddress] });
        queryClient.invalidateQueries({ queryKey: ['cancelledTransactions', walletAddress] });
      },
    });

    // Subscribe to deposit updates (for balance notifications)
    const unsubscribeDeposit = indexerService.subscription.subscribeToDeposits(walletAddress, {
      onInsert: (deposit) => {
        if (!isActive) return;
        const amount = parseFloat(formatQuai(deposit.amount)).toFixed(4);
        const senderShort = `${deposit.sender_address.slice(0, 6)}...${deposit.sender_address.slice(-4)}`;

        notificationManager.add({
          message: `💰 Received ${amount} QUAI from ${senderShort}`,
          type: 'success',
        });

        // Refresh wallet info to update balance
        queryClient.invalidateQueries({ queryKey: ['walletInfo', walletAddress] });
      },
      onReconnect: () => {
        if (!isActive) return;
        // Refresh wallet info after reconnection to catch any missed deposits
        queryClient.invalidateQueries({ queryKey: ['walletInfo', walletAddress] });
      },
    });

    return () => {
      // Mark effect as inactive to prevent in-flight operations from updating state
      isActive = false;
      unsubscribeTx();
      unsubscribeDeposit();
    };
  }, [walletAddress, isIndexerConnected, queryClient]);

  // Track pending transactions for notifications (new transactions, approvals, ready to execute)
  useEffect(() => {
    if (!pendingTransactions || !walletAddress) return;
    
    const prevTxsMap = prevPendingTxsRef.current.get(walletAddress) || new Map();
    const currentTxsMap = new Map<string, PendingTransaction>();
    
    // Process current transactions
    pendingTransactions.forEach((tx) => {
      const txHashLower = tx.hash.toLowerCase();
      currentTxsMap.set(txHashLower, tx);
      const prevTx = prevTxsMap.get(txHashLower);
      
      if (!prevTx) {
        // New transaction detected (only notify if we had previous transactions and haven't already notified)
        const walletProposedSet = notifiedProposedTxs.get(walletAddress.toLowerCase()) ?? new Set();
        if (prevTxsMap.size > 0 && !walletProposedSet.has(txHashLower)) {
          walletProposedSet.add(txHashLower);
          notifiedProposedTxs.set(walletAddress.toLowerCase(), walletProposedSet);
          notificationManager.add({
            message: `📝 New transaction proposed: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`,
            type: 'info',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('New Transaction Proposed', {
              body: `Transaction ${tx.hash.slice(0, 10)}... requires approval`,
              icon: '/vite.svg',
              tag: tx.hash,
            });
          }
        }
      } else {
        // Existing transaction - check for changes
        
        // Check if transaction is now ready to execute
        const wasReady = prevTx.numApprovals >= prevTx.threshold;
        const isReady = tx.numApprovals >= tx.threshold;
        const walletReadySet = notifiedReadyTxs.get(walletAddress.toLowerCase()) ?? new Set();
        if (!wasReady && isReady && !walletReadySet.has(txHashLower)) {
          walletReadySet.add(txHashLower);
          notifiedReadyTxs.set(walletAddress.toLowerCase(), walletReadySet);
          notificationManager.add({
            message: `✅ Transaction ready to execute! ${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`,
            type: 'success',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Transaction Ready to Execute', {
              body: `Transaction ${tx.hash.slice(0, 10)}... has reached the threshold`,
              icon: '/vite.svg',
              tag: `ready-${tx.hash}`,
            });
          }
        }
        
        // Check for new approvals (someone else approved)
        if (connectedAddress) {
          const prevApprovals = Object.keys(prevTx.approvals).filter(addr => prevTx.approvals[addr.toLowerCase()]);
          const currentApprovals = Object.keys(tx.approvals).filter(addr => tx.approvals[addr.toLowerCase()]);
          
          // Find new approvers (not the connected user)
          const newApprovers = currentApprovals.filter(
            addr => !prevApprovals.includes(addr) && addr.toLowerCase() !== connectedAddress.toLowerCase()
          );
          
          if (newApprovers.length > 0) {
            // Use 2-level structure: wallet -> txHash -> Set<approvers>
            const normalizedWallet = walletAddress.toLowerCase();
            let walletApprovals = notifiedApprovals.get(normalizedWallet);
            if (!walletApprovals) {
              walletApprovals = new Map<string, Set<string>>();
              notifiedApprovals.set(normalizedWallet, walletApprovals);
            }
            const notifiedSet = walletApprovals.get(txHashLower) ?? new Set<string>();

            newApprovers.forEach((approver) => {
              if (!notifiedSet.has(approver.toLowerCase())) {
                notifiedSet.add(approver.toLowerCase());
                const approverShort = `${approver.slice(0, 6)}...${approver.slice(-4)}`;
                notificationManager.add({
                  message: `👍 ${approverShort} approved transaction ${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`,
                  type: 'info',
                });

                if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                  new Notification('Transaction Approved', {
                    body: `${approverShort} approved transaction ${tx.hash.slice(0, 10)}...`,
                    icon: '/vite.svg',
                    tag: `approval-${tx.hash}-${approver}`,
                  });
                }
              }
            });

            walletApprovals.set(txHashLower, notifiedSet);
          }
          
          // Check for revoked approvals
          const revokedApprovers = prevApprovals.filter(
            addr => !currentApprovals.includes(addr) && addr.toLowerCase() !== connectedAddress.toLowerCase()
          );
          
          if (revokedApprovers.length > 0) {
            revokedApprovers.forEach((revoker) => {
              const revokerShort = `${revoker.slice(0, 6)}...${revoker.slice(-4)}`;
              notificationManager.add({
                message: `👎 ${revokerShort} revoked approval for transaction ${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`,
                type: 'warning',
              });
            });
          }
        }
      }
    });
    
    // Update stored state
    prevPendingTxsRef.current.set(walletAddress, currentTxsMap);
  }, [pendingTransactions, walletAddress, connectedAddress]);

  // Get executed transactions (history)
  const {
    data: executedTransactions,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = useQuery({
    queryKey: ['executedTransactions', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const txs = await multisigService.getExecutedTransactions(walletAddress);
      return txs;
    },
    enabled: !!walletAddress && isPageVisible,
    refetchInterval: isPageVisible ? POLLING_INTERVALS.TRANSACTION_HISTORY : false,
  });

  // Track executed transactions for notifications
  useEffect(() => {
    if (!executedTransactions || !walletAddress) return;

    const normalizedWallet = walletAddress.toLowerCase();
    const walletExecutedSet = notifiedExecutedTxs.get(normalizedWallet) ?? new Set();

    executedTransactions.forEach((tx) => {
      const txHashLower = tx.hash.toLowerCase();
      if (!walletExecutedSet.has(txHashLower)) {
        walletExecutedSet.add(txHashLower);

        // Only notify if this was a pending transaction we were tracking
        const wasPending = prevPendingTxsRef.current.get(walletAddress)?.has(txHashLower);
        if (wasPending) {
          notificationManager.add({
            message: `✅ Transaction executed: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`,
            type: 'success',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Transaction Executed', {
              body: `Transaction ${tx.hash.slice(0, 10)}... has been executed`,
              icon: '/vite.svg',
              tag: `executed-${tx.hash}`,
            });
          }
        }
      }
    });

    notifiedExecutedTxs.set(normalizedWallet, walletExecutedSet);
  }, [executedTransactions, walletAddress]);

  // Get cancelled transactions
  const {
    data: cancelledTransactions,
    isLoading: isLoadingCancelled,
    refetch: refetchCancelled,
    isRefetching: isRefetchingCancelled,
  } = useQuery({
    queryKey: ['cancelledTransactions', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      const txs = await multisigService.getCancelledTransactions(walletAddress);
      return txs;
    },
    enabled: !!walletAddress && isPageVisible,
    refetchInterval: isPageVisible ? POLLING_INTERVALS.TRANSACTION_HISTORY : false,
  });

  // Track cancelled transactions for notifications
  useEffect(() => {
    if (!cancelledTransactions || !walletAddress) return;

    const normalizedWallet = walletAddress.toLowerCase();
    const walletCancelledSet = notifiedCancelledTxs.get(normalizedWallet) ?? new Set();

    cancelledTransactions.forEach((tx) => {
      const txHashLower = tx.hash.toLowerCase();
      if (!walletCancelledSet.has(txHashLower)) {
        walletCancelledSet.add(txHashLower);

        // Only notify if this was a pending transaction we were tracking
        const wasPending = prevPendingTxsRef.current.get(walletAddress)?.has(txHashLower);
        if (wasPending) {
          notificationManager.add({
            message: `❌ Transaction cancelled: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`,
            type: 'warning',
          });

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Transaction Cancelled', {
              body: `Transaction ${tx.hash.slice(0, 10)}... has been cancelled`,
              icon: '/vite.svg',
              tag: `cancelled-${tx.hash}`,
            });
          }
        }
      }
    });

    notifiedCancelledTxs.set(normalizedWallet, walletCancelledSet);
  }, [cancelledTransactions, walletAddress]);

  // Get wallets for connected address
  const {
    data: userWallets,
    isLoading: isLoadingWallets,
    refetch: refetchUserWallets,
    isRefetching: isRefetchingWallets,
  } = useQuery({
    queryKey: ['userWallets', connectedAddress],
    queryFn: async () => {
      if (!connectedAddress) return [];
      return await multisigService.getWalletsForOwner(connectedAddress);
    },
    enabled: !!connectedAddress && isPageVisible,
    refetchInterval: isPageVisible ? POLLING_INTERVALS.USER_WALLETS : false,
  });

  // Deploy wallet mutation
  const deployWallet = useMutation({
    mutationFn: async (config: DeploymentConfig) => {
      setLoading(true);
      return await multisigService.wallet.deployWallet(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWallets'] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to deploy wallet');
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Propose transaction mutation
  const proposeTransaction = useMutation({
    mutationFn: async (tx: TransactionData & { walletAddress: string }) => {
      return await multisigService.proposeTransaction(
        tx.walletAddress,
        tx.to,
        tx.value,
        tx.data
      );
    },
    onSuccess: (txHash, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      // Mark this transaction as already notified to prevent duplicate notifications from polling
      if (txHash) {
        const normalizedWallet = variables.walletAddress.toLowerCase();
        const walletProposedSet = notifiedProposedTxs.get(normalizedWallet) ?? new Set();
        walletProposedSet.add(txHash.toLowerCase());
        notifiedProposedTxs.set(normalizedWallet, walletProposedSet);
      }
      // Show success notification when you propose a transaction
      notificationManager.add({
        message: `Transaction proposed successfully! Hash: ${txHash?.slice(0, 10)}...${txHash?.slice(-6)}`,
        type: 'success',
      });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to propose transaction');
      // Show error notification
      notificationManager.add({
        message: `Failed to propose transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    },
  });

  // Approve transaction mutation
  const approveTransaction = useMutation({
    mutationFn: async ({ walletAddress, txHash }: { walletAddress: string; txHash: string }) => {
      return await multisigService.approveTransaction(walletAddress, txHash);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to approve transaction');
    },
  });

  // Revoke approval mutation
  const revokeApproval = useMutation({
    mutationFn: async ({ walletAddress, txHash }: { walletAddress: string; txHash: string }) => {
      return await multisigService.revokeApproval(walletAddress, txHash);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to revoke approval');
    },
  });

  // Execute transaction mutation
  const executeTransaction = useMutation({
    mutationFn: async ({ walletAddress, txHash }: { walletAddress: string; txHash: string }) => {
      return await multisigService.executeTransaction(walletAddress, txHash);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['walletInfo', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['executedTransactions', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to execute transaction');
    },
  });

  // Cancel transaction mutation
  const cancelTransaction = useMutation({
    mutationFn: async ({ walletAddress, txHash }: { walletAddress: string; txHash: string }) => {
      return await multisigService.cancelTransaction(walletAddress, txHash);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['cancelledTransactions', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to cancel transaction');
    },
  });

  // Add owner mutation (proposes transaction)
  const addOwner = useMutation({
    mutationFn: async ({ walletAddress, newOwner }: { walletAddress: string; newOwner: string }) => {
      return await multisigService.owner.addOwner(walletAddress, newOwner);
    },
    onSuccess: (txHash, variables) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['walletInfo', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      // Also manually refetch after a short delay to ensure the transaction appears
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      }, 2000);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to add owner');
    },
  });

  // Remove owner mutation (proposes transaction)
  const removeOwner = useMutation({
    mutationFn: async ({ walletAddress, owner }: { walletAddress: string; owner: string }) => {
      return await multisigService.owner.removeOwner(walletAddress, owner);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['walletInfo', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to remove owner');
    },
  });

  // Change threshold mutation (proposes transaction)
  const changeThreshold = useMutation({
    mutationFn: async ({ walletAddress, newThreshold }: { walletAddress: string; newThreshold: number }) => {
      return await multisigService.owner.changeThreshold(walletAddress, newThreshold);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['walletInfo', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to change threshold');
    },
  });

  // Enable module mutation (proposes transaction)
  const enableModule = useMutation({
    mutationFn: async ({ walletAddress, moduleAddress }: { walletAddress: string; moduleAddress: string }) => {
      return await multisigService.owner.enableModule(walletAddress, moduleAddress);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['moduleStatus', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to enable module');
    },
  });

  // Disable module mutation (proposes transaction)
  const disableModule = useMutation({
    mutationFn: async ({ walletAddress, moduleAddress }: { walletAddress: string; moduleAddress: string }) => {
      return await multisigService.owner.disableModule(walletAddress, moduleAddress);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['moduleStatus', variables.walletAddress] });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to disable module');
    },
  });

  // Execute transaction via whitelist (bypasses approval requirement)
  const executeToWhitelist = useMutation({
    mutationFn: async (tx: TransactionData & { walletAddress: string }) => {
      return await multisigService.whitelist.executeToWhitelist(
        tx.walletAddress,
        tx.to,
        tx.value,
        tx.data
      );
    },
    onSuccess: (txHash, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['walletInfo', variables.walletAddress] });
      notificationManager.add({
        message: `✅ Transaction executed via whitelist! Hash: ${txHash?.slice(0, 10)}...${txHash?.slice(-6)}`,
        type: 'success',
      });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to execute transaction via whitelist');
      notificationManager.add({
        message: `Failed to execute via whitelist: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    },
  });

  // Execute transaction via daily limit (bypasses approval requirement)
  // Note: This is ONLY enforced in the frontend. Users can bypass this by interacting with the multisig directly.
  const executeBelowLimit = useMutation({
    mutationFn: async (tx: TransactionData & { walletAddress: string }) => {
      return await multisigService.dailyLimit.executeBelowLimit(
        tx.walletAddress,
        tx.to,
        tx.value
      );
    },
    onSuccess: (txHash, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['walletInfo', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['dailyLimit', variables.walletAddress] });
      queryClient.invalidateQueries({ queryKey: ['remainingLimit', variables.walletAddress] });
      notificationManager.add({
        message: `✅ Transaction executed via daily limit! Hash: ${txHash?.slice(0, 10)}...${txHash?.slice(-6)}`,
        type: 'success',
      });
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to execute transaction via daily limit');
      notificationManager.add({
        message: `Failed to execute via daily limit: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    },
  });

  const refresh = useCallback(() => {
    refetchWalletInfo();
    refetchTransactions();
    refetchUserWallets();
    refetchCancelled();
  }, [refetchWalletInfo, refetchTransactions, refetchUserWallets, refetchCancelled]);

  return {
    // Data
    walletInfo,
    pendingTransactions,
    executedTransactions,
    cancelledTransactions,
    userWallets,

    // Loading states
    isLoading: isLoadingInfo || isLoadingTransactions || isLoadingHistory || isLoadingCancelled || isLoadingWallets,
    isLoadingInfo,
    isLoadingTransactions,
    isLoadingHistory,
    isLoadingCancelled,
    isLoadingWallets,

    // Refreshing states (for visual indicators)
    isRefetchingWalletInfo,
    isRefetchingPending,
    isRefetchingHistory,
    isRefetchingCancelled,
    isRefetchingWallets,

    // Mutations
    deployWallet: deployWallet.mutate,
    deployWalletAsync: deployWallet.mutateAsync,
    proposeTransaction: proposeTransaction.mutate,
    proposeTransactionAsync: proposeTransaction.mutateAsync,
    approveTransaction: approveTransaction.mutate,
    approveTransactionAsync: approveTransaction.mutateAsync,
    revokeApproval: revokeApproval.mutate,
    revokeApprovalAsync: revokeApproval.mutateAsync,
    executeTransaction: executeTransaction.mutate,
    executeTransactionAsync: executeTransaction.mutateAsync,
    cancelTransaction: cancelTransaction.mutate,
    cancelTransactionAsync: cancelTransaction.mutateAsync,
    addOwner: addOwner.mutate,
    addOwnerAsync: addOwner.mutateAsync,
    removeOwner: removeOwner.mutate,
    removeOwnerAsync: removeOwner.mutateAsync,
    changeThreshold: changeThreshold.mutate,
    changeThresholdAsync: changeThreshold.mutateAsync,
    enableModule: enableModule.mutate,
    enableModuleAsync: enableModule.mutateAsync,
    disableModule: disableModule.mutate,
    disableModuleAsync: disableModule.mutateAsync,
    executeToWhitelist: executeToWhitelist.mutate,
    executeToWhitelistAsync: executeToWhitelist.mutateAsync,
    executeBelowLimit: executeBelowLimit.mutate,
    executeBelowLimitAsync: executeBelowLimit.mutateAsync,

    // Mutation states
    isDeploying: deployWallet.isPending,
    isProposing: proposeTransaction.isPending,
    isApproving: approveTransaction.isPending,
    isRevoking: revokeApproval.isPending,
    isExecuting: executeTransaction.isPending,
    isCancelling: cancelTransaction.isPending,
    isAddingOwner: addOwner.isPending,
    isRemovingOwner: removeOwner.isPending,
    isChangingThreshold: changeThreshold.isPending,
    isExecutingViaWhitelist: executeToWhitelist.isPending,
    isExecutingViaDailyLimit: executeBelowLimit.isPending,

    // Utilities
    refresh,
    refreshTransactions: refetchTransactions,
    refreshHistory: refetchHistory,
    refreshCancelled: refetchCancelled,
  };
}
