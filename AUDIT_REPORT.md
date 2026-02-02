# Pre-Audit Security & Code Quality Review

**Project:** Quai Multisig Wallet Frontend
**Date:** February 2, 2026
**Reviewed by:** Claude Opus 4.5

---

## Executive Summary

This review examined the frontend codebase for security vulnerabilities, stability issues, code quality, scalability concerns, and efficiency optimizations. The codebase demonstrates solid architectural patterns with a well-structured service layer, proper input validation at most entry points, and comprehensive Zod schema validation for indexer data.

**Overall Assessment:** The codebase is well-architected but has several issues that should be addressed before production deployment.

### Severity Summary

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 2 | Runtime errors, potential data loss |
| **High** | 6 | Security risks, significant bugs |
| **Medium** | 12 | Stability concerns, technical debt |
| **Low** | 8 | Code quality, minor optimizations |

---

## Critical Issues

### C-1: Undefined Method Call in TransactionPreview.tsx

**Location:** `frontend/src/components/TransactionPreview.tsx:46`

```typescript
const wallet = multisigService.getWalletContract(walletAddress);
```

**Issue:** `MultisigService` does not expose the `getWalletContract()` method (it's protected in `BaseService`). This will throw a runtime error when users try to preview a transaction.

**Impact:** Feature completely broken, poor user experience

**Recommendation:** Either expose a public method in MultisigService for gas estimation, or use an alternative approach like:
```typescript
// Option 1: Add public method to MultisigService
public async estimateProposalGas(walletAddress: string, to: string, value: bigint, data: string): Promise<bigint>

// Option 2: Remove gas estimation from preview (graceful degradation)
```

---

### C-2: Race Conditions in Real-time Subscription Processing

**Location:** `frontend/src/hooks/useMultisig.ts:393-420`

**Issue:** Transaction subscription events process asynchronously without proper sequencing. Multiple subscription events for the same transaction can execute concurrently, causing:
- Out-of-order state updates
- Incorrect transaction approval counts
- Lost state updates

**Impact:** Users may see incorrect approval counts, leading to premature execution attempts or missed threshold confirmations.

**Recommendation:** Implement a global transaction processing queue with proper sequencing:
```typescript
// Use a single queue for all transactions, not per-hash
const processingQueue = new Map<string, Promise<void>>();
const processInOrder = async (key: string, fn: () => Promise<void>) => {
  const prev = processingQueue.get(key) ?? Promise.resolve();
  const next = prev.then(fn);
  processingQueue.set(key, next);
  return next;
};
```

---

## High Severity Issues

### H-1: Memory Leak - Global Notification Tracking Maps

**Location:** `frontend/src/hooks/useMultisig.ts:22-44`

```typescript
// Global tracking - grows indefinitely
const lastNotifiedBalances = new Map<string, string>();
const notifiedExecutedTxs = new Map<string, Set<string>>();
const notifiedCancelledTxs = new Map<string, Set<string>>();
const notifiedReadyTxs = new Map<string, Set<string>>();
const notifiedProposedTxs = new Map<string, Set<string>>();
const notifiedApprovals = new Map<string, Set<string>>();
```

**Issue:** These module-level Maps never get cleaned up properly. Users switching between 50+ wallets will accumulate entries indefinitely.

**Impact:** Memory grows unbounded in long-running sessions; potential for duplicate notifications when revisiting wallets.

**Recommendation:** Implement wallet-scoped cleanup with periodic purging:
```typescript
// Add cleanup on wallet switch
const cleanupWalletTracking = (walletAddress: string) => {
  lastNotifiedBalances.delete(walletAddress);
  notifiedExecutedTxs.delete(walletAddress);
  // ... etc
};

// Add periodic cleanup for inactive wallets (e.g., 5 minutes of no activity)
```

---

### H-2: Hardcoded Gas Limit for Self-Calls

**Location:** `frontend/src/services/core/TransactionService.ts:417-418`

```typescript
const txOptions: Record<string, any> = { gasLimit: 200000n };
```

**Issue:** Self-calls (owner management, module operations) use a hardcoded 200k gas limit because "gas estimation is unreliable." Complex operations could exceed this limit.

**Impact:** Owner management or module configuration transactions may fail silently or with confusing errors.

**Recommendation:** Implement try-catch with progressive gas increase:
```typescript
const gasLimits = [200000n, 400000n, 800000n];
for (const limit of gasLimits) {
  try {
    const tx = await wallet.proposeTransaction(to, value, data, { gasLimit: limit });
    return tx;
  } catch (e) {
    if (!isOutOfGasError(e)) throw e;
    // Try next limit
  }
}
throw new Error('Transaction exceeds maximum gas limit');
```

---

### H-3: Optimistic Update Collision - Time-Based Cleanup

**Location:** `frontend/src/hooks/useOptimisticUpdates.ts:160`

```typescript
setTimeout(() => {
  queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
}, INDEXER_CONFIG.OPTIMISTIC_TIMEOUT_MS); // 5 seconds
```

**Issue:** Optimistic update cleanup is time-based (5 seconds), but indexer may not have caught up. During this window:
- Both optimistic and real data may exist simultaneously
- Transaction counts may be incorrect
- User interactions may fail

**Impact:** Duplicate transactions visible, incorrect counts, confusing UX during high-latency scenarios.

**Recommendation:** Event-based cleanup triggered by subscription confirmation:
```typescript
// Listen for indexer confirmation before removing optimistic flag
const onIndexerConfirm = (tx: IndexerTransaction) => {
  queryClient.setQueryData<PendingTransaction[]>(
    ['pendingTransactions', walletAddress],
    (old = []) => old.filter(t => !t._optimistic || t.hash !== tx.tx_hash)
  );
};
```

---

### H-4: Indexer Health Check Stale Time

**Location:** `frontend/src/services/MultisigService.ts` (isIndexerAvailable)

**Issue:** Indexer health is cached for 30 seconds. If the indexer becomes unavailable, polling doesn't restart for up to 30+ seconds.

**Impact:** UI appears frozen during indexer outages; transactions don't update.

**Recommendation:** Implement immediate health recheck on subscription error and reduce stale time:
```typescript
// On subscription error, immediately invalidate health cache
queryClient.invalidateQueries({ queryKey: ['indexerHealth'] });

// Reduce health check interval during outages (exponential backoff)
```

---

### H-5: Bundle Size Warning

**Location:** Build output

```
dist/assets/index-D12b4kY-.js         749.66 kB │ gzip: 154.32 kB
dist/assets/quais-DoiHT00z.js         472.80 kB │ gzip: 129.88 kB
```

**Issue:** Main bundle exceeds 500KB. Initial page load will be slow, especially on mobile.

**Impact:** Poor performance on slower networks; affects SEO and user experience.

**Recommendation:** Implement code splitting:
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateWallet = lazy(() => import('./pages/CreateWallet'));

// Separate vendor chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'quais': ['quais'],
        'query': ['@tanstack/react-query'],
      }
    }
  }
}
```

---

### H-6: Over-Invalidation of Query Cache

**Location:** `frontend/src/hooks/useMultisig.ts` (multiple mutations)

```typescript
// Examples of non-specific invalidation
queryClient.invalidateQueries({ queryKey: ['pendingTransactions'] }); // ALL wallets
queryClient.invalidateQueries({ queryKey: ['walletInfo'] }); // ALL wallets
```

**Issue:** Many mutations invalidate all wallets instead of specific ones. With 50+ wallets, this causes:
- Cascading refetches across all wallets
- API rate limiting risk
- Slow UI responsiveness

**Recommendation:** Always include wallet address in invalidation:
```typescript
// Before
queryClient.invalidateQueries({ queryKey: ['pendingTransactions'] });

// After
queryClient.invalidateQueries({ queryKey: ['pendingTransactions', walletAddress] });
```

---

## Medium Severity Issues

### M-1: String-Based Error Detection

**Location:** `frontend/src/services/core/TransactionService.ts:374-375`

```typescript
if (error.message?.includes('already exists') || error.message?.includes('already executed')) {
  throw error;
}
```

**Issue:** Error handling relies on string matching which is brittle and could break with library updates.

**Recommendation:** Use error codes or types instead of string matching.

---

### M-2: Silent Indexer Failures

**Location:** Multiple service files

**Issue:** Indexer failures are caught and silently fall back to blockchain. While this is good for UX, it makes debugging difficult.

**Recommendation:** Add structured logging for monitoring:
```typescript
} catch (error) {
  logger.warn('Indexer fallback triggered', { walletAddress, error: error.message });
  // Continue with blockchain fallback
}
```

---

### M-3: Address Normalization Inconsistency

**Issue:** Addresses are sometimes checksummed, sometimes lowercase, depending on context.

**Recommendation:** Create a centralized utility:
```typescript
// utils/addressUtils.ts
export function normalizeAddress(addr: string) {
  const checksummed = quais.getAddress(addr);
  return { checksummed, lowercase: checksummed.toLowerCase() };
}
```

---

### M-4: Theme Listener Memory Leak

**Location:** `frontend/src/store/themeStore.ts:74-84`

```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', handler);
// NO CLEANUP FUNCTION RETURNED
```

**Recommendation:** Return cleanup function:
```typescript
initializeTheme: () => {
  // ... setup code ...
  return () => mediaQuery.removeEventListener('change', handler);
}
```

---

### M-5: No Validation for Contract Call Data

**Location:** `frontend/src/services/TransactionBuilderService.ts`

**Issue:** `buildContractCall()` doesn't validate:
- Function name exists in ABI
- Arguments match function signature
- ABI is valid

**Recommendation:** Add validation with try-catch:
```typescript
buildContractCall(...) {
  try {
    const iface = new quais.Interface(abi);
    if (!iface.getFunction(functionName)) {
      throw new Error(`Function ${functionName} not found in ABI`);
    }
    // ... rest of implementation
  } catch (e) {
    throw new Error(`Invalid contract call: ${e.message}`);
  }
}
```

---

### M-6: Inconsistent Zod Error Handling

**Location:** `frontend/src/services/indexer/IndexerWalletService.ts:32-38`

```typescript
try {
  return WalletSchema.parse(wallet);
} catch {
  return null;  // Silently ignores validation errors
}
```

**Recommendation:** Use `safeParse()` consistently:
```typescript
const result = WalletSchema.safeParse(wallet);
if (!result.success) {
  logger.warn('Invalid wallet schema', { errors: result.error.issues });
  return null;
}
return result.data;
```

---

### M-7: No Subscription Error Backoff

**Location:** `frontend/src/hooks/useMultisig.ts:459-463`

**Issue:** Subscription errors immediately invalidate queries without backoff.

**Recommendation:** Implement exponential backoff for reconnection.

---

### M-8: Page Visibility + Indexer State Machine Complexity

**Issue:** Complex interaction between 4 variables (isPageVisible, isIndexerConnected, refetchInterval, subscriptions) with potential race conditions.

**Recommendation:** Consolidate into single state machine with clear transitions.

---

### M-9: Incomplete TODO in TransactionBuilderService

**Location:** `frontend/src/services/TransactionBuilderService.ts:231`

```typescript
// TODO: Implement multicall pattern
```

**Issue:** `buildBatchTransaction()` only returns first transaction.

**Recommendation:** Complete implementation or remove placeholder method.

---

### M-10: No Environment Validation

**Location:** Application startup

**Issue:** App doesn't validate required environment variables at startup. Empty contract addresses cause runtime errors.

**Recommendation:** Add validation at app initialization:
```typescript
function validateConfig() {
  const required = ['VITE_PROXY_FACTORY', 'VITE_MULTISIG_IMPLEMENTATION'];
  const missing = required.filter(key => !import.meta.env[key]);
  if (missing.length) throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}
```

---

### M-11: Duplicate formatAddress Function

**Locations:**
- `frontend/src/components/TransactionList.tsx:22`
- `frontend/src/utils/transactionDecoder.ts:14`

**Recommendation:** Extract to shared utility in `utils/formatters.ts`.

---

### M-12: WalletStore Doesn't Clear Old Data

**Issue:** When a wallet is removed from the list, associated pending transactions remain in memory.

**Recommendation:** Clear associated query data when wallet is removed.

---

## Low Severity Issues

### L-1: Console Statements (77 total)

**Issue:** 77 console.log/warn/error statements remain in codebase. Some are appropriate (diagnostics.ts, contractVerification.ts), but many should be removed for production.

**Recommendation:** Remove or replace with proper logging in:
- Component files (TransactionPreview, WalletCard, etc.)
- Hook files (useMultisig)
- Service files where errors are already handled

---

### L-2: Any Type Usage

Multiple files use `any` types which reduce type safety:
- `WalletConnectionService.ts:176` - `ethereum?: any`
- `TransactionBuilderService.ts` - `any[]` for ABI and args
- Various components

**Recommendation:** Replace with proper types where possible.

---

### L-3: Deprecated Functions Still Present

**Location:** `frontend/src/services/MultisigService.ts`

Several deprecated functions remain with `@deprecated` tags. While they properly throw errors, they add code bloat.

**Recommendation:** Remove after verifying no external callers.

---

### L-4: CSS Color Inconsistencies

**Issue:** Some colors are defined in index.css custom properties, others hardcoded inline.

**Recommendation:** Consolidate all colors to Tailwind config or CSS custom properties.

---

### L-5: Missing Error Boundaries

**Issue:** No React Error Boundaries to catch component-level errors gracefully.

**Recommendation:** Add error boundaries around major sections:
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <WalletDetail />
</ErrorBoundary>
```

---

### L-6: Accessibility Gaps

**Issue:** Some interactive elements lack proper ARIA labels.

**Recommendation:** Add `aria-label` to icon buttons and interactive elements.

---

### L-7: No Loading State Debouncing

**Issue:** Fast state changes cause loading spinners to flash briefly.

**Recommendation:** Add minimum display time for loading states (150-300ms).

---

### L-8: Transaction Verification Not Integrated

**Location:** `frontend/src/services/utils/TransactionVerifier.ts`

**Issue:** `verifyTransactionOnChain()` exists but isn't called before critical operations.

**Recommendation:** Integrate verification before approval/execution for high-value transactions.

---

## Security Findings Summary

### Positive Findings

1. **Address Validation:** Proper use of `quais.isAddress()` and `quais.getAddress()` at entry points
2. **Non-Custodial:** No private keys handled in frontend code
3. **Transaction Hash Validation:** Proper 66-character validation with 0x prefix enforcement
4. **Signer Guards:** `requireSigner()` properly guards write operations
5. **Zod Schema Validation:** All indexer data validated against schemas
6. **Ownership Checks:** Transaction operations verify caller is wallet owner
7. **Module Security (H-2 fix):** Module configuration requires multisig approval
8. **.env Not Tracked:** Environment files properly gitignored

### Areas of Concern

1. **Gas Estimation Bypass:** Self-calls skip gas estimation with hardcoded limit
2. **Error String Matching:** Fragile error detection pattern
3. **Race Conditions:** Subscription processing not properly sequenced
4. **Memory Growth:** Global tracking maps grow unbounded

---

## Performance Recommendations

1. **Code Splitting:** Implement route-based lazy loading
2. **Query Specificity:** Always include wallet address in query keys
3. **Debounce Refetches:** Prevent cascade of invalidations
4. **Subscription Batching:** Batch subscription updates before state changes
5. **Virtual Scrolling:** Consider virtualization for 50+ owner/wallet lists

---

## Recommended Action Items (Priority Order)

### Immediate (Before Production)

1. Fix C-1: TransactionPreview.tsx undefined method
2. Fix H-2: Hardcoded gas limit for self-calls
3. Fix H-3: Time-based optimistic cleanup
4. Add M-10: Environment validation at startup

### Short Term (1-2 Sprints)

5. Fix C-2: Race conditions in subscriptions
6. Fix H-1: Memory leak in notification tracking
7. Fix H-6: Over-invalidation of query cache
8. Implement H-5: Code splitting

### Medium Term (Future Sprints)

9. Add L-5: Error boundaries
10. Fix M-8: State machine consolidation
11. Complete M-9: Batch transaction implementation
12. Add L-8: Transaction verification integration

---

## Appendix: Files Reviewed

- **Services:** 26 TypeScript files (MultisigService, TransactionService, WalletService, IndexerServices, etc.)
- **Hooks:** 6 files (useMultisig, useWallet, useOptimisticUpdates, etc.)
- **Components:** 40+ TSX files
- **Utils:** 8 utility files
- **Types:** 2 type definition files
- **Config:** 3 configuration files

---

*This report was generated as part of a pre-audit review. A formal audit by a third-party security firm is recommended before mainnet deployment.*
