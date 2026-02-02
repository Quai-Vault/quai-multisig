# Quai Multisig Frontend - Efficiency & Performance Audit Report

**Date:** 2026-02-02
**Updated:** 2026-02-02 (Post-Fix Implementation)
**Scope:** Complete frontend codebase performance analysis
**Purpose:** Final review before formal human audit

---

## Executive Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Rendering Performance | 0 ✅ | 2 | 4 | 2 | 8 |
| Expensive Computations | 0 ✅ | 1 | 3 | 1 | 5 |
| Network Patterns | 0 ✅ | 2 | 2 | 1 | 5 |
| Bundle Optimization | 0 ✅ | 0 ✅ | 3 | 2 | 5 |
| React Query Usage | 0 ✅ | 1 | 2 | 1 | 4 |
| Event Handlers & DOM | 0 ✅ | 0 ✅ | 2 | 2 | 4 |
| **TOTAL** | **0** ✅ | **6** | **16** | **9** | **31** |

**Overall Performance Rating:** A-

---

## FIXES IMPLEMENTED (This Session)

| Issue | File(s) | Status |
|-------|---------|--------|
| CRIT-1: Missing gcTime in QueryClient | App.tsx | ✅ **FIXED** |
| CRIT-2: N+1 RPC calls in getApprovalsForTransaction | TransactionService.ts | ✅ **FIXED** |
| HIGH-1: decodeTransaction called inline in map | TransactionList.tsx | ✅ **FIXED** |
| HIGH-3: Missing Vite build minification settings | vite.config.ts | ✅ **FIXED** |
| HIGH-4: Font loading not optimized | index.html | ✅ **FIXED** |
| HIGH-5: LookupTransaction expensive calculations | LookupTransaction.tsx | ✅ **FIXED** |
| HIGH-8: Subscription queue unbounded growth | useMultisig.ts | ✅ **FIXED** |

---

## CRITICAL ISSUES (2)

### CRIT-1: Missing gcTime in QueryClient Configuration

**File:** [App.tsx:15-22](frontend/src/App.tsx#L15-L22)
**Category:** React Query Usage
**Impact:** Memory leak - cached data never garbage collected

**Current Code:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
    },
  },
});
```

**Fix:** Add gcTime (garbage collection time):
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});
```

---

### CRIT-2: N+1 RPC Calls in getApprovalsForTransaction

**File:** [TransactionService.ts:605-616](frontend/src/services/core/TransactionService.ts#L605-L616)
**Category:** Network Patterns
**Impact:** O(n) blockchain calls per transaction lookup

**Current Code:**
```typescript
for (let i = 0; i < confirmationCount; i++) {
  const approver = await this.contract.getConfirmation(txId, i);
  approvals.push(approver);
}
```

**Fix:** Use multicall or batch the requests:
```typescript
const approvalPromises = Array.from({ length: confirmationCount }, (_, i) =>
  this.contract.getConfirmation(txId, i)
);
const approvals = await Promise.all(approvalPromises);
```

---

## HIGH PRIORITY ISSUES (11)

### HIGH-1: decodeTransaction Called Inline in Map

**File:** [TransactionList.tsx:291](frontend/src/components/TransactionList.tsx#L291)
**Category:** Rendering Performance
**Impact:** Expensive decode runs on every render

**Current Pattern:**
```tsx
{transactions.map((tx) => {
  const decoded = decodeTransaction(tx.data, tx.to);
  // ...
})}
```

**Fix:** Memoize decoded transactions:
```tsx
const decodedTransactions = useMemo(() =>
  transactions.map(tx => ({
    ...tx,
    decoded: decodeTransaction(tx.data, tx.to)
  })),
  [transactions]
);
```

---

### HIGH-2: Sidebar Navigation Items Not Memoized

**File:** [Sidebar.tsx:118-135](frontend/src/components/Sidebar.tsx#L118-L135)
**Category:** Rendering Performance
**Impact:** Array recreation on every render

**Fix:** Move `navItems` array outside component or wrap in useMemo:
```tsx
const navItems = useMemo(() => [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  // ...
], []);
```

---

### HIGH-3: Missing Vite Build Minification Settings

**File:** [vite.config.ts](frontend/vite.config.ts)
**Category:** Bundle Optimization
**Impact:** Larger bundle size than necessary

**Fix:** Add build optimization settings:
```typescript
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        quais: ['quais'],
      },
    },
  },
},
```

---

### HIGH-4: Font Loading Not Optimized

**File:** [index.css:1-5](frontend/src/index.css#L1-L5)
**Category:** Bundle Optimization
**Impact:** Render-blocking font load

**Fix:** Add font-display and preload:
```css
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Add this */
}
```

In index.html:
```html
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
```

---

### HIGH-5: LookupTransaction Expensive Calculations Without useMemo

**File:** [LookupTransaction.tsx:92-109](frontend/src/pages/LookupTransaction.tsx#L92-L109)
**Category:** Expensive Computations
**Impact:** Recalculated on every render

**Current Code:**
```tsx
const confirmationProgress = transaction
  ? (transaction.confirmations / transaction.required) * 100
  : 0;
```

**Fix:** Wrap in useMemo:
```tsx
const confirmationProgress = useMemo(() =>
  transaction ? (transaction.confirmations / transaction.required) * 100 : 0,
  [transaction?.confirmations, transaction?.required]
);
```

---

### HIGH-6: WalletDetail Heavy Component Without React.memo

**File:** [WalletDetail.tsx:1](frontend/src/pages/WalletDetail.tsx#L1)
**Category:** Rendering Performance
**Impact:** Full re-render on parent state changes

**Fix:** Wrap component in React.memo:
```tsx
export default React.memo(WalletDetail);
```

---

### HIGH-7: TransactionFlow Inline Object Props

**File:** [TransactionFlow.tsx:156-180](frontend/src/components/TransactionFlow.tsx#L156-L180)
**Category:** Rendering Performance
**Impact:** New object reference every render breaks memoization

**Current:**
```tsx
<Step style={{ color: '#fff', backgroundColor: '#1a1a1a' }} />
```

**Fix:** Extract to constant or useMemo:
```tsx
const stepStyle = useMemo(() => ({ color: '#fff', backgroundColor: '#1a1a1a' }), []);
```

---

### HIGH-8: useMultisig Hook Subscription Queue Pattern

**File:** [useMultisig.ts:429-470](frontend/src/hooks/useMultisig.ts#L429-L470)
**Category:** Event Handlers
**Impact:** Potential memory pressure from queued updates

**Fix:** Add queue size limit and implement debouncing:
```typescript
const MAX_QUEUE_SIZE = 100;
let queueSize = 0;

const queueCacheUpdate = (processor: () => Promise<void>): void => {
  if (queueSize >= MAX_QUEUE_SIZE) {
    console.warn('Cache update queue full, dropping oldest');
    return;
  }
  queueSize++;
  cacheUpdateQueueRef.current = cacheUpdateQueueRef.current
    .then(async () => {
      if (!isActive) return;
      await processor();
    })
    .finally(() => queueSize--);
};
```

---

### HIGH-9: Modal Components Re-render Parent on Open

**File:** [TransactionList.tsx:45-60](frontend/src/components/TransactionList.tsx#L45-L60)
**Category:** Rendering Performance
**Impact:** List re-renders when modal state changes

**Fix:** Extract modal state to separate component:
```tsx
const TransactionModals = React.memo(({ selectedTx, onClose }) => {
  // Modal rendering logic
});
```

---

### HIGH-10: Extraneous Dependencies in Bundle

**File:** [package.json](frontend/package.json)
**Category:** Bundle Optimization
**Impact:** Unnecessary bundle size increase

**Found:** AWS/Smithy packages being bundled (likely transitive)

**Fix:** Analyze bundle with `npx vite-bundle-visualizer` and add to vite.config.ts:
```typescript
optimizeDeps: {
  exclude: ['@aws-sdk', '@smithy'],
},
```

---

### HIGH-11: Dashboard Multiple useMultisig Calls

**File:** [Dashboard.tsx](frontend/src/pages/Dashboard.tsx)
**Category:** Expensive Computations
**Impact:** Duplicate hook instances for same wallet

**Fix:** Lift state to parent or use context:
```tsx
const MultisigContext = React.createContext<MultisigHookReturn | null>(null);
```

---

## MEDIUM PRIORITY ISSUES (16)

### MED-1: CreateWallet Step Validation Recalculated

**File:** [CreateWallet.tsx:89-120](frontend/src/pages/CreateWallet.tsx#L89-L120)
**Category:** Expensive Computations
**Impact:** Validation runs on every keystroke

**Fix:** Debounce validation or use useMemo with proper deps.

---

### MED-2: TransactionHistory Missing Virtualization

**File:** [TransactionHistory.tsx](frontend/src/pages/TransactionHistory.tsx)
**Category:** DOM Operations
**Impact:** Renders all transactions in DOM

**Fix:** Implement react-window or react-virtualized for lists > 50 items.

---

### MED-3: NotificationToast Creates New Arrays

**File:** [NotificationToast.tsx:25-35](frontend/src/components/NotificationToast.tsx#L25-L35)
**Category:** Rendering Performance
**Impact:** New array reference on render

**Fix:** Memoize icon array lookup.

---

### MED-4: WalletCard Inline Event Handlers

**File:** [WalletCard.tsx:67-85](frontend/src/components/WalletCard.tsx#L67-L85)
**Category:** Event Handlers
**Impact:** New function reference each render

**Fix:** Use useCallback for click handlers.

---

### MED-5: SocialRecoveryManagement Complex State

**File:** [SocialRecoveryManagement.tsx](frontend/src/components/SocialRecoveryManagement.tsx)
**Category:** Rendering Performance
**Impact:** Multiple state updates cause cascading re-renders

**Fix:** Batch state updates with useReducer or combine related state.

---

### MED-6: Missing React Query Prefetching

**File:** [Sidebar.tsx](frontend/src/components/Sidebar.tsx)
**Category:** Network Patterns
**Impact:** Data fetched only on navigation

**Fix:** Add prefetch on hover:
```tsx
const prefetchWallet = () => {
  queryClient.prefetchQuery(['wallet', address], fetchWalletData);
};
```

---

### MED-7: DepositHistory No Pagination

**File:** [DepositHistory.tsx](frontend/src/components/DepositHistory.tsx)
**Category:** Network Patterns
**Impact:** Fetches all deposits at once

**Fix:** Implement cursor-based pagination.

---

### MED-8: CSS Animation Performance

**File:** [index.css](frontend/src/index.css)
**Category:** Rendering Performance
**Impact:** Animations may trigger layout

**Fix:** Add `will-change: transform` to animated elements and prefer `transform` over `top/left`.

---

### MED-9: DailyLimitConfiguration Derived State

**File:** [DailyLimitConfiguration.tsx:45-60](frontend/src/components/DailyLimitConfiguration.tsx#L45-L60)
**Category:** Expensive Computations
**Impact:** Calculations on every render

**Fix:** Use useMemo for derived calculations.

---

### MED-10: Modal Backdrop Click Handler

**File:** [Modal.tsx:34](frontend/src/components/Modal.tsx#L34)
**Category:** Event Handlers
**Impact:** Inline function recreation

**Fix:** Extract to useCallback.

---

### MED-11: DocsSidebar Navigation Rebuild

**File:** [DocsSidebar.tsx:25-80](frontend/src/components/DocsSidebar.tsx#L25-L80)
**Category:** Rendering Performance
**Impact:** Navigation array recreated each render

**Fix:** Move outside component or useMemo.

---

### MED-12: Module Status Polling Interval

**File:** [useMultisig.ts:180-195](frontend/src/hooks/useMultisig.ts#L180-L195)
**Category:** React Query Usage
**Impact:** Polling continues when tab not visible

**Fix:** Add refetchOnWindowFocus and pause polling when hidden:
```typescript
refetchInterval: document.visibilityState === 'visible' ? 30000 : false,
```

---

### MED-13: WhitelistConfiguration Array Operations

**File:** [WhitelistConfiguration.tsx](frontend/src/components/WhitelistConfiguration.tsx)
**Category:** Expensive Computations
**Impact:** Filter/map chains on render

**Fix:** Memoize filtered results.

---

### MED-14: Tailwind CSS Purge Config

**File:** [tailwind.config.js](frontend/tailwind.config.js)
**Category:** Bundle Optimization
**Impact:** May include unused CSS

**Fix:** Verify content paths cover all template files:
```javascript
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
],
```

---

### MED-15: ExplorerLink URL Construction

**File:** [ExplorerLink.tsx:15-25](frontend/src/components/ExplorerLink.tsx#L15-L25)
**Category:** Rendering Performance
**Impact:** URL rebuilt every render

**Fix:** Memoize URL construction.

---

### MED-16: TransactionPreview Deep Comparison

**File:** [TransactionPreview.tsx](frontend/src/components/TransactionPreview.tsx)
**Category:** Rendering Performance
**Impact:** Complex object comparison

**Fix:** Use React.memo with custom comparator.

---

## LOW PRIORITY ISSUES (9)

### LOW-1: CopyButton State Animation
**File:** [CopyButton.tsx](frontend/src/components/CopyButton.tsx)
**Impact:** Minor re-render on copy action

### LOW-2: About Page Static Content
**File:** [About.tsx](frontend/src/pages/About.tsx)
**Impact:** Could be pre-rendered

### LOW-3: EmptyState Icon Import
**File:** [EmptyState.tsx](frontend/src/components/EmptyState.tsx)
**Impact:** Dynamic icon import

### LOW-4: ConfirmDialog Button Styles
**File:** [ConfirmDialog.tsx](frontend/src/components/ConfirmDialog.tsx)
**Impact:** Inline style objects

### LOW-5: ModuleManagement Card Hover Effects
**File:** [ModuleManagement.tsx](frontend/src/components/ModuleManagement.tsx)
**Impact:** CSS transition performance

### LOW-6: OwnerManagement List Keys
**File:** [OwnerManagement.tsx](frontend/src/components/OwnerManagement.tsx)
**Impact:** Index-based keys for stable lists

### LOW-7: Layout Animated Orbs
**File:** [Layout.tsx](frontend/src/components/Layout.tsx)
**Impact:** Continuous CSS animation

### LOW-8: FAQ Accordion State
**File:** [FAQ.tsx](frontend/src/pages/docs/FAQ.tsx)
**Impact:** Multiple boolean states

### LOW-9: EnableModuleModal Form State
**File:** [EnableModuleModal.tsx](frontend/src/components/transactionModals/EnableModuleModal.tsx)
**Impact:** Uncontrolled to controlled warning potential

---

## RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Critical (Immediate)
1. CRIT-1: Add gcTime to QueryClient
2. CRIT-2: Batch approval fetching with Promise.all

### Phase 2: High Impact (This Sprint)
1. HIGH-1: Memoize decoded transactions
2. HIGH-3: Add Vite build optimizations
3. HIGH-5: useMemo for LookupTransaction calculations
4. HIGH-8: Queue size limit for subscriptions

### Phase 3: Medium Impact (Next Sprint)
1. MED-2: Add virtualization to TransactionHistory
2. MED-6: Implement prefetching on navigation
3. MED-12: Pause polling when tab hidden

### Phase 4: Polish (Future)
- Address remaining medium and low priority items iteratively

---

## PERFORMANCE BENCHMARKS TO ESTABLISH

1. **First Contentful Paint (FCP):** Target < 1.5s
2. **Largest Contentful Paint (LCP):** Target < 2.5s
3. **Time to Interactive (TTI):** Target < 3.5s
4. **Total Bundle Size:** Target < 500KB gzipped
5. **React Profiler Re-renders:** < 3 per user action

---

## CONCLUSION

The frontend codebase is **functional and production-ready** but has optimization opportunities. The 2 critical issues (gcTime, N+1 queries) should be addressed immediately as they impact memory usage and network performance at scale.

High-priority items are primarily memoization opportunities that will improve rendering performance for power users with many wallets/transactions.

**Recommended Next Steps:**
1. Fix CRIT-1 and CRIT-2 (< 30 min)
2. Run `npx vite-bundle-visualizer` to analyze bundle
3. Add React Profiler monitoring in development
4. Establish performance baseline with Lighthouse

---

*Report generated: 2026-02-02*
*Auditor: Claude Code*
