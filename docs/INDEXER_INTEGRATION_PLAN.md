# Indexer Frontend Integration Plan

## Overview

Integrate the Supabase-based indexer with the frontend to replace blockchain polling with efficient database queries and real-time subscriptions.

**Key Benefits:**
- ~95% reduction in unnecessary RPC requests
- Instant updates via WebSocket subscriptions (vs 10-30 second polling)
- ~100x faster historical data queries
- New features: deposit history, cross-device sync

---

## Current Architecture

- **Service Layer**: Facade pattern (`MultisigService`) delegating to specialized services
- **Data Fetching**: React Query with polling intervals (10-30 seconds)
- **State**: Zustand for client state, React Query for server/blockchain state
- **RPC**: Direct blockchain queries via `quais.js`

---

## Integration Strategy

### Hybrid Approach

| Operation Type | Data Source | Rationale |
|---------------|-------------|-----------|
| **Reads** | Indexer (primary) | Fast, historical data, real-time subscriptions |
| **Writes** | Blockchain (always) | Transactions must go on-chain for security |
| **Balance** | Blockchain | Indexer tracks deposits, not current balance |
| **Fallback** | Blockchain | If indexer unavailable, graceful degradation |

### Core Principles

1. **Optimistic Updates**: After blockchain writes, immediately update UI cache
2. **Data Validation**: Validate indexer responses with zod schemas
3. **Graceful Degradation**: Show sync status, fall back to polling when offline
4. **Security First**: Verify critical transaction data on-chain before signing

---

## Implementation Phases

### Phase 1: Setup & Configuration

**Files to create/modify:**
- `frontend/.env` - Add Supabase credentials
- `frontend/src/config/supabase.ts` - Supabase client configuration
- `frontend/src/types/database.ts` - TypeScript types for Supabase tables

**Tasks:**

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js zod
   ```

2. Add environment variables to `.env`:
   ```bash
   # Supabase connection
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Network schema (testnet or mainnet)
   VITE_NETWORK_SCHEMA=testnet

   # Indexer health check URL
   VITE_INDEXER_URL=http://localhost:3001
   ```

3. Create Supabase client with schema configuration:
   ```typescript
   // src/config/supabase.ts
   import { createClient } from '@supabase/supabase-js';

   const NETWORK_SCHEMA = import.meta.env.VITE_NETWORK_SCHEMA || 'testnet';

   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
     { db: { schema: NETWORK_SCHEMA } }
   );

   export const INDEXER_CONFIG = {
     HEALTH_URL: import.meta.env.VITE_INDEXER_URL || 'http://localhost:3001',
     SCHEMA: NETWORK_SCHEMA,
     HEALTH_CACHE_MS: 30000, // Cache health check for 30 seconds
     OPTIMISTIC_TIMEOUT_MS: 5000, // Time to wait before invalidating optimistic updates
     MAX_SUBSCRIPTIONS: 10, // Max concurrent wallet subscriptions per client
   };
   ```

   **⚠️ SECURITY REQUIREMENT: Row Level Security (RLS)**

   The Supabase anon key is **public** and embedded in frontend code. The indexer database **MUST** have:

   1. **Row Level Security (RLS) enabled** on all tables
   2. **Read-only access policy** for the anon role:
      ```sql
      -- Example RLS policy for wallets table
      CREATE POLICY "Allow public read access" ON wallets
        FOR SELECT USING (true);

      -- NO INSERT/UPDATE/DELETE policies for anon role
      ```
   3. **No write/delete permissions** for anon role
   4. **Indexer service uses a service_role key** (never exposed to frontend)

4. Add TypeScript types with zod validation:
   ```typescript
   // src/types/database.ts
   import { z } from 'zod';

   // ============ Core Tables ============

   export const WalletSchema = z.object({
     id: z.string(),
     address: z.string(),
     name: z.string().nullable(),
     threshold: z.number(),
     owner_count: z.number(),
     created_at_block: z.number(),
     created_at_tx: z.string(),
     created_at: z.string(),
     updated_at: z.string(),
   });

   export const WalletOwnerSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     owner_address: z.string(),
     added_at_block: z.number(),
     added_at_tx: z.string(),
     removed_at_block: z.number().nullable(),
     removed_at_tx: z.string().nullable(),
     is_active: z.boolean(),
     created_at: z.string(),
   });

   export const TransactionSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     tx_hash: z.string(),
     to_address: z.string(),
     value: z.string(), // BigInt as string
     data: z.string().nullable(),
     transaction_type: z.string(),
     decoded_params: z.record(z.unknown()).nullable(),
     status: z.enum(['pending', 'executed', 'cancelled']),
     confirmation_count: z.number(),
     submitted_by: z.string(),
     submitted_at_block: z.number(),
     submitted_at_tx: z.string(),
     executed_at_block: z.number().nullable(),
     executed_at_tx: z.string().nullable(),
     cancelled_at_block: z.number().nullable(),
     cancelled_at_tx: z.string().nullable(),
     created_at: z.string(),
     updated_at: z.string(),
   });

   export const ConfirmationSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     tx_hash: z.string(),
     owner_address: z.string(),
     confirmed_at_block: z.number(),
     confirmed_at_tx: z.string(),
     revoked_at_block: z.number().nullable(),
     revoked_at_tx: z.string().nullable(),
     is_active: z.boolean(),
     created_at: z.string(),
   });

   export const DepositSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     sender_address: z.string(),
     amount: z.string(), // BigInt as string
     deposited_at_block: z.number(),
     deposited_at_tx: z.string(),
     created_at: z.string(),
   });

   // ============ Module Tables ============

   export const WalletModuleSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     module_address: z.string(),
     enabled_at_block: z.number(),
     enabled_at_tx: z.string(),
     disabled_at_block: z.number().nullable(),
     disabled_at_tx: z.string().nullable(),
     is_active: z.boolean(),
     created_at: z.string(),
     updated_at: z.string(),
   });

   export const DailyLimitStateSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     daily_limit: z.string(), // BigInt as string
     spent_today: z.string(), // BigInt as string
     last_reset_day: z.string(),
     updated_at: z.string(),
   });

   export const WhitelistEntrySchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     whitelisted_address: z.string(),
     limit_amount: z.string().nullable(), // BigInt as string
     added_at_block: z.number(),
     added_at_tx: z.string().nullable(),
     removed_at_block: z.number().nullable(),
     removed_at_tx: z.string().nullable(),
     is_active: z.boolean(),
     created_at: z.string(),
   });

   // ============ Social Recovery Tables ============

   export const SocialRecoveryConfigSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     threshold: z.number(),
     recovery_period: z.number(),
     setup_at_block: z.number(),
     setup_at_tx: z.string(),
     created_at: z.string(),
     updated_at: z.string(),
   });

   export const SocialRecoveryGuardianSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     guardian_address: z.string(),
     added_at_block: z.number(),
     added_at_tx: z.string(),
     removed_at_block: z.number().nullable(),
     removed_at_tx: z.string().nullable(),
     is_active: z.boolean(),
     created_at: z.string(),
   });

   export const SocialRecoverySchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     recovery_hash: z.string(),
     new_owners: z.array(z.string()),
     new_threshold: z.number(),
     initiator_address: z.string(),
     approval_count: z.number(),
     required_threshold: z.number(),
     execution_time: z.number(),
     status: z.enum(['pending', 'executed', 'cancelled']),
     initiated_at_block: z.number(),
     initiated_at_tx: z.string(),
     executed_at_block: z.number().nullable(),
     executed_at_tx: z.string().nullable(),
     cancelled_at_block: z.number().nullable(),
     cancelled_at_tx: z.string().nullable(),
     created_at: z.string(),
     updated_at: z.string(),
   });

   export const RecoveryApprovalSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     recovery_hash: z.string(),
     guardian_address: z.string(),
     approved_at_block: z.number(),
     approved_at_tx: z.string(),
     revoked_at_block: z.number().nullable(),
     revoked_at_tx: z.string().nullable(),
     is_active: z.boolean(),
     created_at: z.string(),
   });

   // ============ Module Transaction Table ============

   export const ModuleTransactionSchema = z.object({
     id: z.string(),
     wallet_address: z.string(),
     module_type: z.string(), // 'whitelist' | 'daily_limit'
     module_address: z.string(),
     to_address: z.string(),
     value: z.string(), // BigInt as string
     remaining_limit: z.string().nullable(), // Remaining daily limit after tx
     executed_at_block: z.number(),
     executed_at_tx: z.string(),
     created_at: z.string(),
   });

   // ============ Type Exports ============

   export type Wallet = z.infer<typeof WalletSchema>;
   export type WalletOwner = z.infer<typeof WalletOwnerSchema>;
   export type IndexerTransaction = z.infer<typeof TransactionSchema>;
   export type Confirmation = z.infer<typeof ConfirmationSchema>;
   export type Deposit = z.infer<typeof DepositSchema>;
   export type WalletModule = z.infer<typeof WalletModuleSchema>;
   export type DailyLimitState = z.infer<typeof DailyLimitStateSchema>;
   export type WhitelistEntry = z.infer<typeof WhitelistEntrySchema>;
   export type SocialRecoveryConfig = z.infer<typeof SocialRecoveryConfigSchema>;
   export type SocialRecoveryGuardian = z.infer<typeof SocialRecoveryGuardianSchema>;
   export type SocialRecovery = z.infer<typeof SocialRecoverySchema>;
   export type RecoveryApproval = z.infer<typeof RecoveryApprovalSchema>;
   export type ModuleTransaction = z.infer<typeof ModuleTransactionSchema>;
   ```

   **Extended PendingTransaction type** (add to existing types):
   ```typescript
   // src/types/index.ts - extend existing type
   export interface PendingTransaction {
     hash: string;
     to: string;
     value: string;
     data: string;
     numApprovals: number;
     threshold: number;
     executed: boolean;
     cancelled: boolean;
     timestamp: number;
     proposer: string;
     approvals: { [owner: string]: boolean };
     _optimistic?: boolean; // Flag for optimistic updates (client-side only)
   }
   ```

---

### Phase 2: Indexer Service Layer

**Files to create:**
```
frontend/src/services/indexer/
├── IndexerService.ts          - Main service facade
├── IndexerWalletService.ts    - Wallet queries
├── IndexerTransactionService.ts - Transaction queries
├── IndexerModuleService.ts    - Module state queries
├── IndexerSubscriptionService.ts - Real-time subscriptions
├── IndexerHealthService.ts    - Health checks with caching
└── index.ts                   - Exports
```

**IndexerService Design:**
```typescript
// src/services/indexer/IndexerService.ts
import { IndexerWalletService } from './IndexerWalletService';
import { IndexerTransactionService } from './IndexerTransactionService';
import { IndexerModuleService } from './IndexerModuleService';
import { IndexerSubscriptionService } from './IndexerSubscriptionService';
import { IndexerHealthService } from './IndexerHealthService';

export class IndexerService {
  readonly wallet: IndexerWalletService;
  readonly transaction: IndexerTransactionService;
  readonly module: IndexerModuleService;
  readonly subscription: IndexerSubscriptionService;
  readonly health: IndexerHealthService;

  constructor() {
    this.health = new IndexerHealthService();
    this.wallet = new IndexerWalletService();
    this.transaction = new IndexerTransactionService();
    this.module = new IndexerModuleService();
    this.subscription = new IndexerSubscriptionService();
  }

  async isAvailable(): Promise<boolean> {
    return this.health.isAvailable();
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return this.health.getStatus();
  }
}

export const indexerService = new IndexerService();
```

**Health Service with Caching:**
```typescript
// src/services/indexer/IndexerHealthService.ts
import { INDEXER_CONFIG } from '../../config/supabase';

export interface HealthStatus {
  available: boolean;
  synced: boolean;
  blocksBehind: number | null;
  lastChecked: number;
}

export class IndexerHealthService {
  private cache: HealthStatus | null = null;

  async isAvailable(): Promise<boolean> {
    const status = await this.getStatus();
    return status.available;
  }

  async getStatus(): Promise<HealthStatus> {
    // Return cached result if fresh
    if (this.cache && Date.now() - this.cache.lastChecked < INDEXER_CONFIG.HEALTH_CACHE_MS) {
      return this.cache;
    }

    try {
      const response = await fetch(`${INDEXER_CONFIG.HEALTH_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      const data = await response.json();

      this.cache = {
        available: data.status === 'healthy',
        synced: !data.details?.isSyncing && (data.details?.blocksBehind ?? 0) < 10,
        blocksBehind: data.details?.blocksBehind ?? null,
        lastChecked: Date.now(),
      };
    } catch {
      this.cache = {
        available: false,
        synced: false,
        blocksBehind: null,
        lastChecked: Date.now(),
      };
    }

    return this.cache;
  }

  invalidateCache(): void {
    this.cache = null;
  }
}
```

**Wallet Service with Validation:**
```typescript
// src/services/indexer/IndexerWalletService.ts
import { supabase } from '../../config/supabase';
import { WalletSchema, type Wallet } from '../../types/database';

export class IndexerWalletService {
  async getWalletsForOwner(ownerAddress: string): Promise<Wallet[]> {
    const { data, error } = await supabase
      .from('wallet_owners')
      .select(`
        wallet_address,
        wallets (*)
      `)
      .eq('owner_address', ownerAddress.toLowerCase())
      .eq('is_active', true);

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    // Validate each wallet against schema
    return (data ?? [])
      .map(row => row.wallets)
      .filter(Boolean)
      .map(wallet => WalletSchema.parse(wallet));
  }

  async getWalletDetails(walletAddress: string): Promise<Wallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('address', walletAddress.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Indexer query failed: ${error.message}`);
    }

    return WalletSchema.parse(data);
  }

  async getWalletOwners(walletAddress: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('wallet_owners')
      .select('owner_address')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true);

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(row => row.owner_address);
  }
}
```

**Transaction Service with Pagination:**
```typescript
// src/services/indexer/IndexerTransactionService.ts
import { supabase } from '../../config/supabase';
import { TransactionSchema, ConfirmationSchema, DepositSchema } from '../../types/database';
import type { IndexerTransaction, Deposit, Confirmation } from '../../types/database';

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export class IndexerTransactionService {
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 100;

  async getPendingTransactions(walletAddress: string): Promise<IndexerTransaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(tx => TransactionSchema.parse(tx));
  }

  async getTransactionHistory(
    walletAddress: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<IndexerTransaction>> {
    const limit = Math.min(options.limit ?? this.DEFAULT_LIMIT, this.MAX_LIMIT);
    const offset = options.offset ?? 0;

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress.toLowerCase())
      .in('status', ['executed', 'cancelled'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    const transactions = (data ?? []).map(tx => TransactionSchema.parse(tx));
    const total = count ?? 0;

    return {
      data: transactions,
      total,
      hasMore: offset + transactions.length < total,
    };
  }

  /**
   * Get confirmations for a transaction by wallet address and tx_hash
   */
  async getConfirmationsByTxHash(
    walletAddress: string,
    txHash: string
  ): Promise<Confirmation[]> {
    const { data, error } = await supabase
      .from('confirmations')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('tx_hash', txHash)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(c => ConfirmationSchema.parse(c));
  }

  /**
   * Get only active (non-revoked) confirmations
   */
  async getActiveConfirmations(
    walletAddress: string,
    txHash: string
  ): Promise<Confirmation[]> {
    const { data, error } = await supabase
      .from('confirmations')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('tx_hash', txHash)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(c => ConfirmationSchema.parse(c));
  }

  async getDeposits(
    walletAddress: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Deposit>> {
    const limit = Math.min(options.limit ?? this.DEFAULT_LIMIT, this.MAX_LIMIT);
    const offset = options.offset ?? 0;

    const { data, error, count } = await supabase
      .from('deposits')
      .select('*', { count: 'exact' })
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    const deposits = (data ?? []).map(d => DepositSchema.parse(d));
    const total = count ?? 0;

    return {
      data: deposits,
      total,
      hasMore: offset + deposits.length < total,
    };
  }
}
```

**Subscription Service with Reconnection:**
```typescript
// src/services/indexer/IndexerSubscriptionService.ts
import { supabase, INDEXER_CONFIG } from '../../config/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionCallbacks<T> {
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (record: T) => void;
  onError?: (error: Error) => void;
}

export class IndexerSubscriptionService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelayMs = 1000;

  subscribeToTransactions(
    walletAddress: string,
    callbacks: SubscriptionCallbacks<Transaction>
  ): () => void {
    const channelName = `transactions:${walletAddress}`;

    const subscribe = () => {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: INDEXER_CONFIG.SCHEMA,
            table: 'transactions',
            filter: `wallet_address=eq.${walletAddress.toLowerCase()}`,
          },
          (payload) => callbacks.onInsert?.(payload.new as Transaction)
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: INDEXER_CONFIG.SCHEMA,
            table: 'transactions',
            filter: `wallet_address=eq.${walletAddress.toLowerCase()}`,
          },
          (payload) => callbacks.onUpdate?.(payload.new as Transaction)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.reconnectAttempts.set(channelName, 0);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.handleReconnect(channelName, subscribe, callbacks.onError);
          }
        });

      this.channels.set(channelName, channel);
    };

    subscribe();

    // Return unsubscribe function
    return () => {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
        this.reconnectAttempts.delete(channelName);
      }
    };
  }

  private handleReconnect(
    channelName: string,
    subscribe: () => void,
    onError?: (error: Error) => void
  ): void {
    const attempts = this.reconnectAttempts.get(channelName) ?? 0;

    if (attempts >= this.maxReconnectAttempts) {
      onError?.(new Error(`Failed to reconnect after ${attempts} attempts`));
      return;
    }

    const delay = this.reconnectDelayMs * Math.pow(2, attempts);
    this.reconnectAttempts.set(channelName, attempts + 1);

    setTimeout(() => {
      const oldChannel = this.channels.get(channelName);
      if (oldChannel) {
        supabase.removeChannel(oldChannel);
      }
      subscribe();
    }, delay);
  }

  subscribeToDeposits(
    walletAddress: string,
    callbacks: SubscriptionCallbacks<Deposit>
  ): () => void {
    // Similar implementation to subscribeToTransactions
    const channelName = `deposits:${walletAddress}`;
    // ... (same pattern as above)
    return () => { /* cleanup */ };
  }

  // Get count of active subscriptions
  getActiveSubscriptionCount(): number {
    return this.channels.size;
  }

  // Unsubscribe from all channels (cleanup)
  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.reconnectAttempts.clear();
  }
}
```

**⚠️ SUBSCRIPTION LIMITS**

Supabase has a default limit of **200 concurrent subscriptions per client**. For users with many wallets, this requires careful management:

```typescript
// src/services/indexer/SubscriptionManager.ts
import { INDEXER_CONFIG } from '../../config/supabase';
import { IndexerSubscriptionService } from './IndexerSubscriptionService';

/**
 * Manages subscription limits by tracking active wallet views
 * and dynamically subscribing/unsubscribing based on what's visible
 */
export class SubscriptionManager {
  private subscriptionService: IndexerSubscriptionService;
  private activeWallets: Set<string> = new Set();
  private unsubscribeFns: Map<string, () => void> = new Map();

  constructor(subscriptionService: IndexerSubscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  /**
   * Called when user views a wallet - subscribes if under limit
   */
  activateWallet(walletAddress: string, callbacks: SubscriptionCallbacks): void {
    if (this.activeWallets.has(walletAddress)) return;

    // Check if we're at the limit
    if (this.activeWallets.size >= INDEXER_CONFIG.MAX_SUBSCRIPTIONS) {
      // Remove oldest subscription (FIFO)
      const oldest = this.activeWallets.values().next().value;
      if (oldest) {
        this.deactivateWallet(oldest);
      }
    }

    // Subscribe to new wallet
    const unsubscribe = this.subscriptionService.subscribeToTransactions(
      walletAddress,
      callbacks
    );

    this.activeWallets.add(walletAddress);
    this.unsubscribeFns.set(walletAddress, unsubscribe);
  }

  /**
   * Called when user navigates away from a wallet
   */
  deactivateWallet(walletAddress: string): void {
    const unsubscribe = this.unsubscribeFns.get(walletAddress);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribeFns.delete(walletAddress);
      this.activeWallets.delete(walletAddress);
    }
  }

  /**
   * Cleanup all subscriptions (on logout or unmount)
   */
  cleanup(): void {
    this.unsubscribeFns.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFns.clear();
    this.activeWallets.clear();
  }
}
```

**Module Service Implementation:**
```typescript
// src/services/indexer/IndexerModuleService.ts
import { supabase } from '../../config/supabase';
import {
  WalletModuleSchema,
  DailyLimitStateSchema,
  WhitelistEntrySchema,
  SocialRecoveryConfigSchema,
  SocialRecoveryGuardianSchema,
  type WalletModule,
  type DailyLimitState,
  type WhitelistEntry,
  type SocialRecoveryConfig,
} from '../../types/database';

export class IndexerModuleService {
  /**
   * Get enabled/disabled status for all modules on a wallet
   */
  async getModuleStatuses(walletAddress: string): Promise<Record<string, boolean>> {
    const { data, error } = await supabase
      .from('wallet_modules')
      .select('module_address, is_active')
      .eq('wallet_address', walletAddress.toLowerCase());

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    const statuses: Record<string, boolean> = {};
    (data ?? []).forEach(row => {
      statuses[row.module_address] = row.is_active;
    });

    return statuses;
  }

  /**
   * Check if a specific module is enabled
   */
  async isModuleEnabled(walletAddress: string, moduleAddress: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wallet_modules')
      .select('is_active')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('module_address', moduleAddress.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return false; // Not found = not enabled
      throw new Error(`Indexer query failed: ${error.message}`);
    }

    return data?.is_active ?? false;
  }

  /**
   * Get daily limit configuration from daily_limit_state table
   */
  async getDailyLimitConfig(walletAddress: string): Promise<{
    limit: string;
    spent: string;
    lastResetDay: string;
  } | null> {
    const { data, error } = await supabase
      .from('daily_limit_state')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Indexer query failed: ${error.message}`);
    }

    const validated = DailyLimitStateSchema.parse(data);
    return {
      limit: validated.daily_limit,
      spent: validated.spent_today,
      lastResetDay: validated.last_reset_day,
    };
  }

  /**
   * Get whitelist entries from whitelist_entries table
   */
  async getWhitelistEntries(walletAddress: string): Promise<Array<{
    address: string;
    limit: string | null;
  }>> {
    const { data, error } = await supabase
      .from('whitelist_entries')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true);

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(entry => {
      const validated = WhitelistEntrySchema.parse(entry);
      return {
        address: validated.whitelisted_address,
        limit: validated.limit_amount,
      };
    });
  }

  /**
   * Get social recovery configuration from social_recovery_configs + guardians tables
   */
  async getRecoveryConfig(walletAddress: string): Promise<{
    guardians: string[];
    threshold: number;
    recoveryPeriod: number;
  } | null> {
    const [configResult, guardiansResult] = await Promise.all([
      supabase
        .from('social_recovery_configs')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single(),
      supabase
        .from('social_recovery_guardians')
        .select('guardian_address')
        .eq('wallet_address', walletAddress.toLowerCase())
        .eq('is_active', true),
    ]);

    if (configResult.error) {
      if (configResult.error.code === 'PGRST116') return null;
      throw new Error(`Indexer query failed: ${configResult.error.message}`);
    }

    const config = SocialRecoveryConfigSchema.parse(configResult.data);
    const guardians = (guardiansResult.data ?? []).map(g => g.guardian_address);

    return {
      guardians,
      threshold: config.threshold,
      recoveryPeriod: config.recovery_period,
    };
  }

  /**
   * Get pending social recoveries for a wallet
   */
  async getPendingRecoveries(walletAddress: string): Promise<Array<{
    recoveryHash: string;
    newOwners: string[];
    newThreshold: number;
    approvalCount: number;
    requiredThreshold: number;
    executionTime: number;
    status: string;
  }>> {
    const { data, error } = await supabase
      .from('social_recoveries')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('status', 'pending');

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(recovery => ({
      recoveryHash: recovery.recovery_hash,
      newOwners: recovery.new_owners,
      newThreshold: recovery.new_threshold,
      approvalCount: recovery.approval_count,
      requiredThreshold: recovery.required_threshold,
      executionTime: recovery.execution_time,
      status: recovery.status,
    }));
  }

  /**
   * Get module transaction history (whitelist/daily limit bypass transactions)
   */
  async getModuleTransactions(
    walletAddress: string,
    moduleType?: 'whitelist' | 'daily_limit'
  ): Promise<Array<{
    moduleType: string;
    toAddress: string;
    value: string;
    remainingLimit: string | null;
    executedAtBlock: number;
    executedAtTx: string;
    createdAt: string;
  }>> {
    let query = supabase
      .from('module_transactions')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (moduleType) {
      query = query.eq('module_type', moduleType);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Indexer query failed: ${error.message}`);

    return (data ?? []).map(tx => ({
      moduleType: tx.module_type,
      toAddress: tx.to_address,
      value: tx.value,
      remainingLimit: tx.remaining_limit,
      executedAtBlock: tx.executed_at_block,
      executedAtTx: tx.executed_at_tx,
      createdAt: tx.created_at,
    }));
  }
}
```

---

### Phase 3: Data Source Abstraction

**Files to modify:**
- `frontend/src/services/MultisigService.ts` - Add indexer integration

**Strategy:**
Create a transparent data source layer that:
1. Tries indexer first
2. Falls back to blockchain if indexer unavailable
3. Converts indexer response format to existing types

```typescript
// In MultisigService.ts - add to class
import { indexerService } from './indexer';

export class MultisigService {
  private indexer = indexerService;

  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    // Try indexer first
    if (await this.indexer.isAvailable()) {
      try {
        const [wallet, owners] = await Promise.all([
          this.indexer.wallet.getWalletDetails(walletAddress),
          this.indexer.wallet.getWalletOwners(walletAddress),
        ]);

        if (wallet) {
          // Get balance from blockchain (indexer doesn't track this)
          const balance = await this.walletService.getBalance(walletAddress);

          return {
            address: wallet.address,
            owners,
            threshold: wallet.threshold,
            balance: balance.toString(),
          };
        }
      } catch (error) {
        console.warn('Indexer query failed, falling back to blockchain:', error);
      }
    }

    // Fallback to blockchain
    return this.walletService.getWalletInfo(walletAddress);
  }

  async getPendingTransactions(walletAddress: string): Promise<PendingTransaction[]> {
    if (await this.indexer.isAvailable()) {
      try {
        // Fetch wallet threshold and transactions in parallel
        const [wallet, txs] = await Promise.all([
          this.indexer.wallet.getWalletDetails(walletAddress),
          this.indexer.transaction.getPendingTransactions(walletAddress),
        ]);

        if (!wallet) {
          throw new Error('Wallet not found in indexer');
        }

        // Convert each transaction with its confirmations
        const converted = await Promise.all(
          txs.map(async (tx) => {
            const confirmations = await this.indexer.transaction.getConfirmationsByTxHash(
              walletAddress,
              tx.tx_hash
            );
            return this.convertIndexerTransaction(tx, wallet.threshold, confirmations);
          })
        );

        return converted;
      } catch (error) {
        console.warn('Indexer query failed, falling back to blockchain:', error);
      }
    }

    return this.transactionService.getPendingTransactions(walletAddress);
  }

  // Convert indexer format to existing frontend types
  // NOTE: threshold must be passed from wallet since transactions don't store it
  private convertIndexerTransaction(
    tx: IndexerTransaction,
    walletThreshold: number,
    confirmations: Confirmation[]
  ): PendingTransaction {
    // Build approvals map from ACTIVE confirmations only
    const approvals: { [owner: string]: boolean } = {};
    confirmations.filter(c => c.is_active).forEach(c => {
      approvals[c.owner_address.toLowerCase()] = true;
    });

    return {
      hash: tx.tx_hash,
      to: tx.to_address,
      value: tx.value,
      data: tx.data ?? '0x',
      numApprovals: tx.confirmation_count,
      threshold: walletThreshold, // From wallet, not transaction
      executed: tx.status === 'executed',
      cancelled: tx.status === 'cancelled',
      timestamp: new Date(tx.created_at).getTime() / 1000,
      proposer: tx.submitted_by,
      approvals,
    };
  }
}
```

**Transaction Converter Utility:**
```typescript
// src/services/utils/TransactionConverter.ts
import type { IndexerTransaction, Confirmation } from '../../types/database';
import type { PendingTransaction } from '../../types';

/**
 * Converts indexer transaction format to frontend PendingTransaction format
 * Used for consistent data shape across indexer and blockchain sources
 *
 * @param tx - Transaction from indexer
 * @param walletThreshold - Threshold from wallet (transactions don't store this)
 * @param confirmations - Active confirmations for this transaction
 */
export function convertIndexerTransaction(
  tx: IndexerTransaction,
  walletThreshold: number,
  confirmations: Confirmation[] = []
): PendingTransaction {
  // Only count active (non-revoked) confirmations
  const activeConfirmations = confirmations.filter(c => c.is_active);

  const approvals: { [owner: string]: boolean } = {};
  activeConfirmations.forEach(c => {
    approvals[c.owner_address.toLowerCase()] = true;
  });

  return {
    hash: tx.tx_hash,
    to: tx.to_address,
    value: tx.value,
    data: tx.data ?? '0x',
    numApprovals: tx.confirmation_count,
    threshold: walletThreshold,
    executed: tx.status === 'executed',
    cancelled: tx.status === 'cancelled',
    timestamp: new Date(tx.created_at).getTime() / 1000,
    proposer: tx.submitted_by,
    approvals,
  };
}

/**
 * Converts a list of transactions with their confirmations
 * Fetches wallet threshold and confirmations for each transaction
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
```

**Read operations to migrate:**

| Method | Current Source | New Source | Notes |
|--------|----------------|------------|-------|
| `getWalletInfo()` | Blockchain | Indexer + Blockchain (balance) | Balance stays on-chain |
| `getWalletsForOwner()` | Blockchain | Indexer | Much faster |
| `getPendingTransactions()` | Blockchain events | Indexer | Instant |
| `getTransactionHistory()` | Blockchain events | Indexer | Pagination enabled |
| `isModuleEnabled()` | Blockchain | Indexer | Single query |
| `getRecoveryConfig()` | Blockchain | Indexer | Includes guardians |
| `getDeposits()` | N/A | Indexer | New feature! |

**Write operations (keep on blockchain):**
- `deployWallet()`, `proposeTransaction()`, `approveTransaction()`, `executeTransaction()`, etc.

---

### Phase 4: React Query + Real-time Integration

**Files to create/modify:**
- `frontend/src/hooks/useMultisig.ts` - Replace polling with subscriptions
- `frontend/src/hooks/useIndexerConnection.ts` - Connection state management
- `frontend/src/hooks/useOptimisticUpdates.ts` - Optimistic update helpers

**Connection State Hook:**
```typescript
// src/hooks/useIndexerConnection.ts
import { useQuery } from '@tanstack/react-query';
import { indexerService } from '../services/indexer';

export function useIndexerConnection() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['indexerHealth'],
    queryFn: () => indexerService.getHealthStatus(),
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 10000,
  });

  return {
    isConnected: health?.available ?? false,
    isSynced: health?.synced ?? false,
    blocksBehind: health?.blocksBehind ?? null,
    isLoading,
  };
}
```

**Optimistic Updates Pattern:**
```typescript
// src/hooks/useOptimisticUpdates.ts
import { useQueryClient } from '@tanstack/react-query';

export function useOptimisticUpdates(walletAddress: string) {
  const queryClient = useQueryClient();

  const addOptimisticTransaction = (tx: Partial<PendingTransaction>) => {
    queryClient.setQueryData(
      ['pendingTransactions', walletAddress],
      (old: PendingTransaction[] = []) => [
        { ...tx, _optimistic: true },
        ...old,
      ]
    );
  };

  const updateOptimisticApproval = (txHash: string, approver: string) => {
    queryClient.setQueryData(
      ['pendingTransactions', walletAddress],
      (old: PendingTransaction[] = []) =>
        old.map((tx) =>
          tx.hash === txHash
            ? {
                ...tx,
                numApprovals: tx.numApprovals + 1,
                approvals: { ...tx.approvals, [approver]: true },
                _optimistic: true,
              }
            : tx
        )
    );
  };

  const removeOptimisticFlag = () => {
    // Called after indexer confirms the update
    queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
  };

  return { addOptimisticTransaction, updateOptimisticApproval, removeOptimisticFlag };
}
```

**Updated useMultisig Hook:**
```typescript
// In useMultisig.ts - key changes

export function useMultisig(walletAddress?: string) {
  const queryClient = useQueryClient();
  const { isConnected: isIndexerConnected } = useIndexerConnection();
  const { addOptimisticTransaction, updateOptimisticApproval, removeOptimisticFlag } =
    useOptimisticUpdates(walletAddress ?? '');

  // Transactions query - no polling if subscribed
  const { data: pendingTransactions } = useQuery({
    queryKey: ['pendingTransactions', walletAddress],
    queryFn: () => multisigService.getPendingTransactions(walletAddress!),
    enabled: !!walletAddress,
    // Only poll if indexer not connected
    refetchInterval: isIndexerConnected ? false : (isPageVisible ? 10000 : false),
  });

  // Real-time subscription
  useEffect(() => {
    if (!walletAddress || !isIndexerConnected) return;

    // Get wallet threshold for transaction conversion
    const walletThreshold = walletInfo?.threshold ?? 1;

    const unsubscribe = indexerService.subscription.subscribeToTransactions(
      walletAddress,
      {
        onInsert: async (tx) => {
          // Fetch confirmations for new transaction
          const confirmations = await indexerService.transaction.getActiveConfirmations(
            walletAddress,
            tx.tx_hash
          );

          queryClient.setQueryData(
            ['pendingTransactions', walletAddress],
            (old: PendingTransaction[] = []) => {
              // Remove optimistic version if present
              const filtered = old.filter(t => !t._optimistic || t.hash !== tx.tx_hash);
              return [convertIndexerTransaction(tx, walletThreshold, confirmations), ...filtered];
            }
          );
        },
        onUpdate: async (tx) => {
          // Fetch updated confirmations
          const confirmations = await indexerService.transaction.getActiveConfirmations(
            walletAddress,
            tx.tx_hash
          );

          queryClient.setQueryData(
            ['pendingTransactions', walletAddress],
            (old: PendingTransaction[] = []) =>
              old.map(t => t.hash === tx.tx_hash
                ? convertIndexerTransaction(tx, walletThreshold, confirmations)
                : t
              )
          );
        },
        onError: (error) => {
          console.error('Subscription error:', error);
          // Enable polling as fallback
          queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
        },
      }
    );

    return unsubscribe;
  }, [walletAddress, isIndexerConnected, queryClient, walletInfo?.threshold]);

  // Approve mutation with optimistic update
  const approveTransaction = useMutation({
    mutationFn: async ({ txHash }: { txHash: string }) => {
      const signerAddress = await multisigService.getSignerAddress();

      // Optimistic update
      updateOptimisticApproval(txHash, signerAddress);

      // Actual blockchain call
      return multisigService.approveTransaction(walletAddress!, txHash);
    },
    onSuccess: () => {
      // Wait for indexer to catch up, then refresh
      setTimeout(removeOptimisticFlag, 3000);
    },
    onError: () => {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
    },
  });

  // ... rest of hook
}
```

---

### Phase 5: Sync Status UI

**Files to create:**
- `frontend/src/components/SyncStatusBadge.tsx`
- Add to `frontend/src/components/Layout.tsx`

**SyncStatusBadge Component:**
```typescript
// src/components/SyncStatusBadge.tsx
import { useIndexerConnection } from '../hooks/useIndexerConnection';

export function SyncStatusBadge() {
  const { isConnected, isSynced, blocksBehind, isLoading } = useIndexerConnection();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-dark-500">
        <div className="w-2 h-2 rounded-full bg-dark-500 animate-pulse" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-yellow-400" title="Using blockchain directly (slower updates)">
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <span>Direct Mode</span>
      </div>
    );
  }

  if (!isSynced && blocksBehind !== null) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-yellow-400" title={`Indexer is ${blocksBehind} blocks behind`}>
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <span>Syncing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-green-400" title="Real-time updates enabled">
      <div className="w-2 h-2 rounded-full bg-green-400" />
      <span>Live</span>
    </div>
  );
}
```

**Add to Layout.tsx header:**
```tsx
// In the header, near wallet connection
<div className="flex items-center gap-4">
  <SyncStatusBadge />
  {/* Existing wallet connection UI */}
</div>
```

---

### Phase 6: Deposit History (New Feature)

**Files to create:**
- `frontend/src/components/DepositHistory.tsx`

**Modify:**
- `frontend/src/pages/WalletDetail.tsx` - Add deposits section

**DepositHistory Component:**
```typescript
// src/components/DepositHistory.tsx
import { useQuery } from '@tanstack/react-query';
import { indexerService } from '../services/indexer';
import { formatEther } from 'quais';
import { formatBlockExplorerLink } from '../utils/blockExplorer';

interface DepositHistoryProps {
  walletAddress: string;
}

export function DepositHistory({ walletAddress }: DepositHistoryProps) {
  const { isConnected } = useIndexerConnection();

  const { data: deposits, isLoading } = useQuery({
    queryKey: ['deposits', walletAddress],
    queryFn: () => indexerService.transaction.getDeposits(walletAddress),
    enabled: !!walletAddress && isConnected,
  });

  // Real-time subscription for new deposits
  useEffect(() => {
    if (!walletAddress || !isConnected) return;

    return indexerService.subscription.subscribeToDeposits(walletAddress, {
      onInsert: (deposit) => {
        queryClient.setQueryData(
          ['deposits', walletAddress],
          (old: Deposit[] = []) => [deposit, ...old]
        );

        // Show notification
        notificationManager.add({
          message: `Received ${formatEther(deposit.amount)} QUAI`,
          type: 'success',
        });
      },
    });
  }, [walletAddress, isConnected]);

  if (!isConnected) {
    return (
      <div className="text-sm text-dark-500 italic">
        Deposit history requires indexer connection
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!deposits?.length) {
    return (
      <div className="text-sm text-dark-500">
        No deposits yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {deposits.map((deposit) => (
        <div key={deposit.id} className="flex justify-between items-center p-3 bg-vault-dark-4 rounded">
          <div>
            <div className="text-sm font-medium text-dark-200">
              +{formatEther(deposit.amount)} QUAI
            </div>
            <div className="text-xs text-dark-500">
              From: {deposit.sender_address.slice(0, 8)}...{deposit.sender_address.slice(-6)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-dark-500">
              {new Date(deposit.created_at).toLocaleDateString()}
            </div>
            <a
              href={formatBlockExplorerLink('tx', deposit.deposited_at_tx)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-400 hover:text-primary-300"
            >
              View tx
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### Phase 7: Security Enhancements

**On-chain Verification for Critical Actions:**

```typescript
// src/services/utils/TransactionVerifier.ts

import { multisigService } from '../MultisigService';

export async function verifyTransactionOnChain(
  walletAddress: string,
  indexerTx: IndexerTransaction
): Promise<{ verified: boolean; discrepancies: string[] }> {
  const discrepancies: string[] = [];

  try {
    const onChainTx = await multisigService.getTransactionFromChain(
      walletAddress,
      indexerTx.tx_hash
    );

    if (onChainTx.to.toLowerCase() !== indexerTx.to_address.toLowerCase()) {
      discrepancies.push(`Recipient mismatch: ${onChainTx.to} vs ${indexerTx.to_address}`);
    }

    if (onChainTx.value.toString() !== indexerTx.value) {
      discrepancies.push(`Value mismatch: ${onChainTx.value} vs ${indexerTx.value}`);
    }

    if (onChainTx.data !== (indexerTx.data ?? '0x')) {
      discrepancies.push('Transaction data mismatch');
    }

    return { verified: discrepancies.length === 0, discrepancies };
  } catch (error) {
    return { verified: false, discrepancies: ['Failed to verify on-chain'] };
  }
}
```

**Add verify button to transaction details:**
```tsx
// In transaction detail view
const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');

const handleVerify = async () => {
  setVerificationStatus('verifying');
  const result = await verifyTransactionOnChain(walletAddress, transaction);
  setVerificationStatus(result.verified ? 'verified' : 'failed');
  if (!result.verified) {
    setError(`Verification failed: ${result.discrepancies.join(', ')}`);
  }
};

// In JSX
<button onClick={handleVerify} disabled={verificationStatus === 'verifying'}>
  {verificationStatus === 'verified' ? '✓ Verified' : 'Verify On-Chain'}
</button>
```

---

## File Structure After Implementation

```
frontend/src/
├── config/
│   ├── contracts.ts (existing)
│   └── supabase.ts (new)
├── services/
│   ├── indexer/
│   │   ├── IndexerService.ts          # Main facade
│   │   ├── IndexerWalletService.ts    # Wallet queries
│   │   ├── IndexerTransactionService.ts # Transaction queries + pagination
│   │   ├── IndexerModuleService.ts    # Module status + config
│   │   ├── IndexerSubscriptionService.ts # Real-time subscriptions
│   │   ├── IndexerHealthService.ts    # Health checks with caching
│   │   ├── SubscriptionManager.ts     # Subscription limit management
│   │   └── index.ts                   # Exports
│   ├── utils/
│   │   ├── TransactionVerifier.ts (new) # On-chain verification
│   │   ├── TransactionConverter.ts (new) # Type conversion utilities
│   │   └── ... (existing)
│   └── MultisigService.ts (modified)
├── hooks/
│   ├── useMultisig.ts (modified)
│   ├── useIndexerConnection.ts (new)  # Connection state
│   ├── useOptimisticUpdates.ts (new)  # Optimistic update helpers
│   ├── usePagination.ts (new)         # Pagination state management
│   └── ... (existing)
├── components/
│   ├── SyncStatusBadge.tsx (new)      # Status indicator
│   ├── DepositHistory.tsx (new)       # Deposit list with real-time
│   ├── TransactionHistoryPaginated.tsx (new) # Paginated history
│   └── ... (existing)
└── types/
    ├── database.ts (new)              # Zod schemas + types
    └── index.ts (modified)            # Add _optimistic flag
```

---

## Verification Checklist

### Unit Tests
- [ ] IndexerHealthService caches health status correctly
- [ ] IndexerWalletService validates responses with zod
- [ ] IndexerSubscriptionService handles reconnection
- [ ] Optimistic updates work correctly

### Integration Tests
- [ ] Deploy wallet → appears in indexer within 5 seconds
- [ ] Propose transaction → pending tx shows in indexer
- [ ] Approve transaction → confirmation count updates
- [ ] Execute transaction → status changes to executed
- [ ] Revoke approval → confirmation count decreases

### Fallback Tests
- [ ] Disable indexer → app falls back to blockchain polling
- [ ] Re-enable indexer → app switches back to subscriptions
- [ ] Partial indexer failure → specific queries fall back

### Real-time Tests
- [ ] Open two browsers → changes sync in real-time
- [ ] New deposit → notification appears immediately
- [ ] Close and reopen → no duplicate notifications

### Build & Test Suite
- [ ] `npm run build` completes without errors
- [ ] `npm test` passes (all 315+ tests)
- [ ] No TypeScript errors

---

## Estimated Scope

| Phase | New Files | Modified Files | Complexity |
|-------|-----------|----------------|------------|
| 1. Setup | 2 | 1 | Low |
| 2. Indexer Services | 8 | 0 | Medium |
| 3. Data Abstraction | 1 | 1 | Medium |
| 4. React Query + Realtime | 3 | 1 | High |
| 5. Sync Status UI | 1 | 1 | Low |
| 6. Deposits | 2 | 1 | Low |
| 7. Security | 1 | 1 | Low |

**Total: ~18 new files, ~6 modified files**

### New Files Breakdown

| File | Purpose |
|------|---------|
| `config/supabase.ts` | Supabase client + config constants |
| `types/database.ts` | Zod schemas for all 13 indexer table types |
| `services/indexer/IndexerService.ts` | Main facade |
| `services/indexer/IndexerWalletService.ts` | Wallet queries |
| `services/indexer/IndexerTransactionService.ts` | Transaction queries + pagination |
| `services/indexer/IndexerModuleService.ts` | Module status + config |
| `services/indexer/IndexerSubscriptionService.ts` | Real-time subscriptions |
| `services/indexer/IndexerHealthService.ts` | Health checks with caching |
| `services/indexer/SubscriptionManager.ts` | Subscription limit management |
| `services/indexer/index.ts` | Barrel exports |
| `services/utils/TransactionVerifier.ts` | On-chain verification |
| `services/utils/TransactionConverter.ts` | Type conversion utilities |
| `hooks/useIndexerConnection.ts` | Connection state hook |
| `hooks/useOptimisticUpdates.ts` | Optimistic update helpers |
| `hooks/usePagination.ts` | Pagination state management |
| `components/SyncStatusBadge.tsx` | Status indicator UI |
| `components/DepositHistory.tsx` | Deposit list component |
| `components/TransactionHistoryPaginated.tsx` | Paginated history view |

---

## Dependencies

```bash
npm install @supabase/supabase-js zod
```

---

## Environment Variables

```bash
# Supabase connection
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Network schema (testnet or mainnet)
VITE_NETWORK_SCHEMA=testnet

# Indexer health check URL
VITE_INDEXER_URL=http://localhost:3001
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Indexer data tampering | On-chain verification for critical transactions before signing |
| Subscription disconnection | Automatic reconnection with exponential backoff (max 5 attempts) |
| Data freshness mismatch | Optimistic updates + configurable invalidation timeout |
| Type mismatches | Zod schema validation on all responses |
| Rate limiting | Health check caching (30s), SubscriptionManager for limit control |
| Balance accuracy | Always fetch balance from blockchain |
| Public anon key | RLS policies required on Supabase (read-only for anon role) |
| Too many subscriptions | SubscriptionManager with FIFO eviction (max 10 per client) |
| Network partitioning | Graceful fallback to blockchain polling with "Direct Mode" UI |
| Stale optimistic data | Automatic invalidation after configurable timeout (5s default) |

---

## Pagination Hook

```typescript
// src/hooks/usePagination.ts
import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialLimit?: number;
  initialOffset?: number;
}

export interface UsePaginationResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  page: number;
  limit: number;
  loadMore: () => void;
  reset: () => void;
  setPage: (page: number) => void;
}

export function usePagination<T>(
  fetchFn: (options: { limit: number; offset: number }) => Promise<{
    data: T[];
    total: number;
    hasMore: boolean;
  }>,
  options: UsePaginationOptions = {}
) {
  const { initialLimit = 20, initialOffset = 0 } = options;

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPageState] = useState(0);
  const limit = initialLimit;

  const loadPage = useCallback(async (pageNum: number, append = false) => {
    setIsLoading(true);
    try {
      const result = await fetchFn({
        limit,
        offset: pageNum * limit,
      });

      setData(prev => append ? [...prev, ...result.data] : result.data);
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPageState(pageNum);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, limit]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(page + 1, true);
    }
  }, [isLoading, hasMore, page, loadPage]);

  const reset = useCallback(() => {
    setData([]);
    setTotal(0);
    setHasMore(true);
    setPageState(0);
    loadPage(0);
  }, [loadPage]);

  const setPage = useCallback((newPage: number) => {
    loadPage(newPage);
  }, [loadPage]);

  return {
    data,
    total,
    hasMore,
    isLoading,
    page,
    limit,
    loadMore,
    reset,
    setPage,
  };
}
