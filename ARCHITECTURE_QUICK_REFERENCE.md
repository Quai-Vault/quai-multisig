# Architecture Quick Reference

Visual guide for understanding the Quai Multisig Wallet system at a glance.

## 🏗️ System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                            │
│  👤 Wallet Owners  │  👥 Guardians  │  🌐 Web Browser       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │ Transactions │  │   Modules    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                  ↓                   ↓             │
│  ┌─────────────────────────────────────────────────┐        │
│  │        MultisigService (Facade)                 │        │
│  │  • TransactionService   • WalletService         │        │
│  │  • OwnerService         • IndexerService        │        │
│  │  • DailyLimitModuleService                      │        │
│  │  • WhitelistModuleService                       │        │
│  │  • SocialRecoveryModuleService                  │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                       ↓                  ↓
┌─────────────────────────────────────────────────────────────┐
│                      INDEXER LAYER (Optional)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Supabase   │  │   Real-time  │  │  PostgreSQL  │      │
│  │    Client    │→ │ Subscriptions│→ │   Database   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│       ↑                                                      │
│  Reads: Fast indexed queries, Real-time updates              │
│  Falls back to blockchain if unavailable                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   QUAI NETWORK (Blockchain)                  │
│  ┌────────────────────────────────────────────────┐         │
│  │           ProxyFactory (Singleton)             │         │
│  │  Creates →  🔹 Wallet Proxy 1                  │         │
│  │             🔹 Wallet Proxy 2                  │         │
│  │             🔹 Wallet Proxy N                  │         │
│  └────────────────────────────────────────────────┘         │
│                      ↓ (all point to)                        │
│  ┌────────────────────────────────────────────────┐         │
│  │    MultisigWallet Implementation (Singleton)   │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │              Optional Modules                  │         │
│  │  • DailyLimitModule     (spending limits)      │         │
│  │  • WhitelistModule      (trusted addresses)    │         │
│  │  • SocialRecoveryModule (account recovery)     │         │
│  └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Transaction Flow (The Heart of the System)

```
┌─────────┐
│ PROPOSE │  Owner 1 creates transaction
└────┬────┘  • Specify: to, value, data
     │       • Gets unique txHash
     │       • State: numApprovals = 0
     ↓
┌─────────┐
│ APPROVE │  Owners vote (need threshold approvals)
└────┬────┘  • Owner 1: ✓ (numApprovals = 1)
     │       • Owner 2: ✓ (numApprovals = 2)
     │       • Threshold met! (2 of 3)
     ↓
┌─────────┐
│ EXECUTE │  Any owner can execute
└────┬────┘  • Check threshold ✓
     │       • Call target contract
     │       • Mark as executed
     │       • Increment nonce
     ↓
┌─────────┐
│  DONE   │  Transaction complete
└─────────┘  • Cannot execute again
             • Nonce prevents replay
```

## 🛡️ Security Layers

```
Layer 1: ACCESS CONTROL
├─ Owner-Only      → isOwner() check
├─ Wallet-Only     → msg.sender == address(this)
└─ Module-Only     → modules[msg.sender] == true

Layer 2: THRESHOLD
├─ Critical Ops    → Require multisig (proposal + threshold approvals)
├─ Module Ops      → Single owner (within limits)
└─ Recovery Ops    → Guardian threshold + time delay

Layer 3: STATE PROTECTION
├─ Nonce           → Prevents transaction replay
├─ Flags           → executed/cancelled prevent re-execution
└─ Approvals       → Cannot approve twice

Layer 4: MODULE RESTRICTIONS
├─ Cannot enable/disable modules
├─ Cannot modify owners via modules
└─ Owner management only via recovery
```

## 📦 Proxy Pattern Benefits

```
Traditional Deployment:          Proxy Pattern:
┌──────────────┐                 ┌──────────────┐
│  Wallet #1   │ 2M gas          │  Proxy #1    │ 100K gas
│  (Full Code) │                 │  (Minimal)   │
└──────────────┘                 └──────┬───────┘
                                        │ delegates to
┌──────────────┐                        ↓
│  Wallet #2   │ 2M gas          ┌──────────────┐
│  (Full Code) │                 │Implementation│ 2M gas (once)
└──────────────┘                 │  (Shared)    │
                                 └──────┬───────┘
┌──────────────┐                        ↑
│  Wallet #3   │ 2M gas                 │ delegates to
│  (Full Code) │                 ┌──────┴───────┐
└──────────────┘                 │  Proxy #2    │ 100K gas
                                 └──────────────┘
Total: 6M gas                    Total: 2.2M gas
                                 (90% savings for 3 wallets!)
```

## 🔌 Module System

```
┌─────────────────────────────────────────────────┐
│             MultisigWallet                      │
│  ┌──────────────────────────────┐               │
│  │ mapping(address => bool)     │               │
│  │ modules                      │               │
│  └──────────────────────────────┘               │
│                                                  │
│  ┌──────────────────────────────┐               │
│  │ execTransactionFromModule()  │◄──────────────┼── Module calls this
│  │  • Check modules[msg.sender] │               │
│  │  • Prevent privileged calls  │               │
│  │  • Execute transaction       │               │
│  └──────────────────────────────┘               │
└─────────────────────────────────────────────────┘
         ↑                ↑                ↑
         │                │                │
    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐
    │ Daily   │     │Whitelist│     │ Social  │
    │ Limit   │     │ Module  │     │Recovery │
    └─────────┘     └─────────┘     └─────────┘
         │                │                │
    Spend limit     Trusted addrs    Account recovery
    per 24 hours    no multisig      if keys lost
```

## 💾 State Management (Frontend)

```
React Components
    ↓
┌────────────────────────────────────┐
│        State Management            │
│  React Query   │   Zustand         │
│  (server state)│   (client state)  │
└────────────────────────────────────┘
    ↓
MultisigService (Facade)
    ↓
┌────────────────────────────────────┐
│         Specialized Services       │
├────────────────┬───────────────────┤
│ Core Services  │ Indexer Services  │
├────────────────┼───────────────────┤
│ TransactionSvc │ IndexerService    │
│ WalletService  │ IndexerWalletSvc  │
│ OwnerService   │ IndexerTxSvc      │
│ TxBuilderSvc   │ IndexerSubSvc     │
├────────────────┼───────────────────┤
│ Module Services│ IndexerHealthSvc  │
├────────────────┴───────────────────┤
│ DailyLimitModuleService            │
│ WhitelistModuleService             │
│ SocialRecoveryModuleService        │
└────────────────────────────────────┘
    ↓                   ↓
BaseService         Supabase Client
    ↓                   ↓
Quai Network RPC    PostgreSQL (Indexed Data)
```

### Data Flow Strategy
- **Reads**: IndexerService (fast, cached) → Fallback to blockchain
- **Writes**: Always via blockchain (TransactionService, etc.)
- **Real-time**: Supabase subscriptions → Fallback to polling

## 📊 Data Flow Example: Send QUAI

```
1. USER ACTION
   └─ User enters: to="0xabc...", amount="1.5 QUAI"

2. FRONTEND
   ├─ UI validates input
   ├─ MultisigService.proposeTransaction()
   └─ Converts 1.5 QUAI → wei (parseQuai)

3. BLOCKCHAIN (Proposal)
   ├─ MultisigWallet.proposeTransaction(to, value, "0x")
   ├─ txHash = hash(to, value, data, nonce)
   ├─ Store: transactions[txHash] = {..., numApprovals: 0}
   └─ Event: TransactionProposed(txHash)

4. FRONTEND (Real-time/Polling)
   └─ Supabase subscription detects new tx → Update UI
   └─ (Fallback: Polling if subscription unavailable)

5. USER ACTION (Approvals)
   ├─ Owner 1: Approve ✓
   └─ Owner 2: Approve ✓ (threshold met!)

6. BLOCKCHAIN (Approvals)
   ├─ approvals[txHash][owner1] = true, numApprovals = 1
   ├─ approvals[txHash][owner2] = true, numApprovals = 2
   └─ Events: TransactionApproved(txHash, owner)

7. USER ACTION (Execute)
   └─ Any owner clicks "Execute"

8. BLOCKCHAIN (Execution)
   ├─ Check numApprovals >= threshold ✓
   ├─ Check !executed && !cancelled ✓
   ├─ executed = true
   ├─ nonce++
   ├─ Transfer 1.5 QUAI to recipient
   └─ Event: TransactionExecuted(txHash)

9. FRONTEND
   └─ Update UI: Transaction complete ✓
```

## 🗂️ Project Structure

```
quai-multisig/
├─ contracts/
│  ├─ contracts/
│  │  ├─ MultisigWallet.sol          (Core logic)
│  │  ├─ MultisigWalletProxy.sol     (EIP-1967 proxy)
│  │  ├─ ProxyFactory.sol            (Wallet factory)
│  │  └─ modules/
│  │     ├─ DailyLimitModule.sol
│  │     ├─ WhitelistModule.sol
│  │     └─ SocialRecoveryModule.sol
│  ├─ test/                          (Contract tests)
│  ├─ scripts/                       (Deploy & utilities)
│  └─ deployments/                   (Deployment records)
│
├─ frontend/
│  ├─ src/
│  │  ├─ components/                 (React components)
│  │  ├─ services/                   (Blockchain interaction)
│  │  │  ├─ MultisigService.ts       (Main facade)
│  │  │  ├─ core/                    (Core services)
│  │  │  │  ├─ TransactionService.ts
│  │  │  │  ├─ WalletService.ts
│  │  │  │  └─ OwnerService.ts
│  │  │  ├─ modules/                 (Module services)
│  │  │  │  ├─ DailyLimitModuleService.ts
│  │  │  │  ├─ WhitelistModuleService.ts
│  │  │  │  └─ SocialRecoveryModuleService.ts
│  │  │  └─ indexer/                 (Indexer services)
│  │  │     ├─ IndexerService.ts
│  │  │     ├─ IndexerWalletService.ts
│  │  │     ├─ IndexerTransactionService.ts
│  │  │     ├─ IndexerSubscriptionService.ts
│  │  │     └─ IndexerHealthService.ts
│  │  ├─ stores/                     (Zustand state)
│  │  ├─ hooks/                      (React Query hooks)
│  │  ├─ utils/                      (Utility functions)
│  │  └─ config/                     (Contract addresses, ABIs)
│  └─ test/                          (Frontend tests - 315 passing)
│
└─ docs/
   ├─ ARCHITECTURE.md                (This file - full details)
   └─ ARCHITECTURE_QUICK_REFERENCE.md (Visual guide)
```

## 📝 Common Operations Cheat Sheet

### Deploy New Wallet
```typescript
const walletAddress = await multisigService.deployWallet(
  [owner1, owner2, owner3],  // owners
  2                           // threshold (2-of-3)
);
```

### Propose Transaction
```typescript
const txHash = await multisigService.proposeTransaction(
  walletAddress,
  recipientAddress,
  ethers.parseEther("1.0"),  // 1 QUAI
  "0x"                        // empty data
);
```

### Approve & Execute
```typescript
// Each owner approves
await multisigService.approveTransaction(walletAddress, txHash);

// Any owner executes (after threshold met)
await multisigService.executeTransaction(walletAddress, txHash);
```

### Enable Module
```typescript
// Via multisig transaction
await multisigService.enableModule(
  walletAddress,
  moduleAddress
);
```

### Set Daily Limit
```typescript
// Via multisig transaction
await multisigService.setDailyLimit(
  walletAddress,
  ethers.parseEther("10")  // 10 QUAI per day
);
```

### Execute Below Limit
```typescript
// Single owner can execute
await multisigService.executeBelowLimit(
  walletAddress,
  recipientAddress,
  ethers.parseEther("5")   // 5 QUAI (below limit)
);
```

## 🔗 Related Documentation

- **[Full Architecture Documentation](ARCHITECTURE.md)** - Detailed diagrams and explanations
- **[JSDoc Template Guide](frontend/JSDOC_TEMPLATE.md)** - Documentation standards
- **[Script Consolidation Report](SCRIPT_CONSOLIDATION.md)** - Utility scripts review
- **[Security Analysis](SECURITY_ANALYSIS.md)** - Security audit findings

---

*Quick reference for developers - see ARCHITECTURE.md for comprehensive details*
