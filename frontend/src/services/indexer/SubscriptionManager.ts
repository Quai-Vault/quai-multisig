import { INDEXER_CONFIG } from '../../config/supabase';
import { IndexerSubscriptionService, type SubscriptionCallbacks } from './IndexerSubscriptionService';
import type { IndexerTransaction, Deposit } from '../../types/database';

export interface WalletSubscriptionCallbacks {
  onTransactionInsert?: (tx: IndexerTransaction) => void;
  onTransactionUpdate?: (tx: IndexerTransaction) => void;
  onDepositInsert?: (deposit: Deposit) => void;
  onError?: (error: Error) => void;
  /** Called when this wallet is evicted due to subscription limit */
  onEvicted?: (walletAddress: string) => void;
}

/**
 * Manages subscription limits by tracking active wallet views
 * and dynamically subscribing/unsubscribing based on what's visible
 */
export class SubscriptionManager {
  private subscriptionService: IndexerSubscriptionService;
  private activeWallets: Set<string> = new Set();
  private unsubscribeFns: Map<string, (() => void)[]> = new Map();
  private evictionCallbacks: Map<string, ((walletAddress: string) => void)> = new Map();

  constructor(subscriptionService: IndexerSubscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  /**
   * Called when user views a wallet - subscribes if under limit
   */
  activateWallet(walletAddress: string, callbacks: WalletSubscriptionCallbacks): void {
    const normalizedAddress = walletAddress.toLowerCase();

    if (this.activeWallets.has(normalizedAddress)) return;

    // Check if we're at the limit
    if (this.activeWallets.size >= INDEXER_CONFIG.MAX_SUBSCRIPTIONS) {
      // Remove oldest subscription (FIFO)
      const oldestResult = this.activeWallets.values().next();
      if (!oldestResult.done && oldestResult.value) {
        const evictedWallet = oldestResult.value;
        // Notify the evicted wallet's callback before deactivating
        const evictionCallback = this.evictionCallbacks.get(evictedWallet);
        if (evictionCallback) {
          evictionCallback(evictedWallet);
        }
        this.deactivateWallet(evictedWallet);
      }
    }

    const unsubscribers: (() => void)[] = [];

    // Subscribe to transactions
    if (callbacks.onTransactionInsert || callbacks.onTransactionUpdate) {
      const unsubTx = this.subscriptionService.subscribeToTransactions(normalizedAddress, {
        onInsert: callbacks.onTransactionInsert,
        onUpdate: callbacks.onTransactionUpdate,
        onError: callbacks.onError,
      });
      unsubscribers.push(unsubTx);
    }

    // Subscribe to deposits
    if (callbacks.onDepositInsert) {
      const unsubDeposit = this.subscriptionService.subscribeToDeposits(normalizedAddress, {
        onInsert: callbacks.onDepositInsert,
        onError: callbacks.onError,
      });
      unsubscribers.push(unsubDeposit);
    }

    this.activeWallets.add(normalizedAddress);
    this.unsubscribeFns.set(normalizedAddress, unsubscribers);
    // Store eviction callback if provided
    if (callbacks.onEvicted) {
      this.evictionCallbacks.set(normalizedAddress, callbacks.onEvicted);
    }
  }

  /**
   * Called when user navigates away from a wallet
   */
  deactivateWallet(walletAddress: string): void {
    const normalizedAddress = walletAddress.toLowerCase();
    const unsubscribers = this.unsubscribeFns.get(normalizedAddress);

    if (unsubscribers) {
      unsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch (error) {
          console.warn(`Failed to unsubscribe wallet ${normalizedAddress}:`,
            error instanceof Error ? error.message : 'Unknown error');
        }
      });
      this.unsubscribeFns.delete(normalizedAddress);
      this.evictionCallbacks.delete(normalizedAddress);
      this.activeWallets.delete(normalizedAddress);
    }
  }

  /**
   * Check if a wallet is currently subscribed
   */
  isWalletActive(walletAddress: string): boolean {
    return this.activeWallets.has(walletAddress.toLowerCase());
  }

  /**
   * Get count of active wallet subscriptions
   */
  getActiveWalletCount(): number {
    return this.activeWallets.size;
  }

  /**
   * Cleanup all subscriptions (on logout or unmount)
   */
  cleanup(): void {
    this.unsubscribeFns.forEach((unsubscribers) => {
      unsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch (error) {
          console.warn('Failed to unsubscribe during cleanup:',
            error instanceof Error ? error.message : 'Unknown error');
        }
      });
    });
    this.unsubscribeFns.clear();
    this.evictionCallbacks.clear();
    this.activeWallets.clear();
  }
}
