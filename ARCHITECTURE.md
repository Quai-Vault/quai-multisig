# Quai Multisig Wallet - Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Smart Contract Architecture](#smart-contract-architecture)
3. [Proxy Pattern & Deployment](#proxy-pattern--deployment)
4. [Transaction Lifecycle](#transaction-lifecycle)
5. [Module System](#module-system)
6. [Frontend Architecture](#frontend-architecture)
7. [Security Model](#security-model)

---

## System Overview

High-level architecture showing all system components and their interactions.

```mermaid
graph TB
    subgraph "User Layer"
        User[User/Owner]
        Browser[Web Browser]
    end

    subgraph "Frontend Application"
        UI[React UI]
        Services[Service Layer]
        State[State Management<br/>Zustand + React Query]

        UI --> Services
        UI --> State
        Services --> State
    end

    subgraph "Indexer Layer"
        Supabase[Supabase<br/>Real-time Subscriptions]
        IndexerDB[(PostgreSQL<br/>Indexed Data)]

        Supabase --> IndexerDB
    end

    subgraph "Blockchain Network"
        RPC[Quai Network RPC]

        subgraph "Smart Contracts"
            Factory[ProxyFactory]
            Implementation[MultisigWallet<br/>Implementation]
            Proxy1[Wallet Proxy 1]
            Proxy2[Wallet Proxy 2]
            ProxyN[Wallet Proxy N]

            subgraph "Modules"
                DailyLimit[DailyLimitModule]
                Whitelist[WhitelistModule]
                Recovery[SocialRecoveryModule]
            end

            Factory -.creates.-> Proxy1
            Factory -.creates.-> Proxy2
            Factory -.creates.-> ProxyN

            Proxy1 --> Implementation
            Proxy2 --> Implementation
            ProxyN --> Implementation

            Proxy1 -.optional.-> DailyLimit
            Proxy1 -.optional.-> Whitelist
            Proxy1 -.optional.-> Recovery
        end
    end

    User --> Browser
    Browser --> UI
    Services -->|Reads| Supabase
    Services -->|Writes| RPC
    RPC --> Factory
    RPC --> Proxy1
    RPC --> Proxy2
    RPC --> ProxyN

    style User fill:#e1f5ff
    style Browser fill:#fff4e1
    style UI fill:#f0f0f0
    style Supabase fill:#ccffcc
    style IndexerDB fill:#ccffcc
    style Factory fill:#ffcccc
    style Implementation fill:#ccffcc
    style Proxy1 fill:#ccccff
    style Proxy2 fill:#ccccff
    style ProxyN fill:#ccccff
```

---

## Smart Contract Architecture

Detailed view of smart contract relationships and dependencies.

```mermaid
classDiagram
    class MultisigWallet {
        +address[] owners
        +uint256 threshold
        +mapping transactions
        +mapping modules
        +uint256 nonce

        +initialize(owners, threshold)
        +proposeTransaction(to, value, data)
        +approveTransaction(txHash)
        +executeTransaction(txHash)
        +addOwner(owner)
        +removeOwner(owner)
        +changeThreshold(threshold)
        +enableModule(module)
        +disableModule(module)
        +execTransactionFromModule(to, value, data)
    }

    class ProxyFactory {
        +address implementation
        +address[] deployedWallets

        +createWallet(owners, threshold, salt)
        +registerWallet(wallet)
        +getWallets()
    }

    class MultisigWalletProxy {
        +address implementation

        +constructor(impl, initData)
        +fallback()
        +receive()
    }

    class DailyLimitModule {
        +mapping dailyLimits

        +setDailyLimit(wallet, limit)
        +executeBelowLimit(wallet, to, value)
        +getRemainingLimit(wallet)
    }

    class WhitelistModule {
        +mapping whitelists
        +mapping limits

        +addToWhitelist(wallet, address, limit)
        +removeFromWhitelist(wallet, address)
        +executeWhitelistedTransaction(wallet, to, value)
    }

    class SocialRecoveryModule {
        +mapping recoveryConfigs
        +mapping recoveries

        +setupRecovery(wallet, guardians, threshold, period)
        +initiateRecovery(wallet, newOwners, newThreshold)
        +approveRecovery(wallet, recoveryHash)
        +executeRecovery(wallet, recoveryHash)
        +cancelRecovery(wallet, recoveryHash)
    }

    ProxyFactory --> MultisigWallet : deploys proxies for
    MultisigWalletProxy --> MultisigWallet : delegates to
    MultisigWallet --> DailyLimitModule : enables
    MultisigWallet --> WhitelistModule : enables
    MultisigWallet --> SocialRecoveryModule : enables

    DailyLimitModule --> MultisigWallet : calls execTransactionFromModule
    WhitelistModule --> MultisigWallet : calls execTransactionFromModule
    SocialRecoveryModule --> MultisigWallet : calls execTransactionFromModule
```

---

## Proxy Pattern & Deployment

How the proxy pattern works and the deployment process.

```mermaid
sequenceDiagram
    participant Deployer
    participant Factory as ProxyFactory
    participant Proxy as MultisigWalletProxy
    participant Impl as MultisigWallet<br/>Implementation
    participant IPFS

    Note over Deployer,IPFS: One-Time Setup
    Deployer->>IPFS: Push implementation metadata
    IPFS-->>Deployer: IPFS hash
    Deployer->>Impl: Deploy implementation
    Impl-->>Deployer: Implementation address
    Deployer->>Factory: Deploy factory(implAddress)
    Factory-->>Deployer: Factory address

    Note over Deployer,IPFS: Per-Wallet Deployment
    Deployer->>Factory: createWallet(owners, threshold, salt)
    Factory->>IPFS: Push proxy metadata
    IPFS-->>Factory: IPFS hash
    Factory->>Proxy: Deploy with CREATE2
    Note over Proxy: Stores implementation address
    Factory->>Proxy: initialize(owners, threshold)
    Proxy->>Impl: delegatecall initialize()
    Impl-->>Proxy: Initialized
    Proxy-->>Factory: Proxy address
    Factory->>Factory: Register wallet
    Factory-->>Deployer: Wallet address

    Note over Proxy,Impl: All Future Calls
    Deployer->>Proxy: Any function call
    Proxy->>Impl: delegatecall with msg.data
    Impl-->>Proxy: Return value
    Proxy-->>Deployer: Result

    Note over Factory: Benefits of Proxy Pattern
    Note over Factory: ✓ Minimal gas per wallet<br/>✓ Shared implementation<br/>✓ Deterministic addresses (CREATE2)<br/>✓ Metadata stored on IPFS
```

---

## Transaction Lifecycle

Complete flow of a multisig transaction from proposal to execution.

```mermaid
stateDiagram-v2
    [*] --> Proposed: Owner calls proposeTransaction()

    Proposed --> Approving: Owners call approveTransaction()

    Approving --> Approving: More approvals needed
    Approving --> Ready: Threshold met
    Approving --> Cancelled: Owner calls cancelTransaction()

    Ready --> Executed: Owner calls executeTransaction()
    Ready --> Cancelled: Owner calls cancelTransaction()

    Cancelled --> [*]
    Executed --> [*]

    note right of Proposed
        Transaction struct created:
        - to, value, data
        - proposer, timestamp
        - numApprovals = 0
        - executed = false
        - cancelled = false
    end note

    note right of Approving
        Each approval increments numApprovals
        Same owner cannot approve twice
        Must be current wallet owner
    end note

    note right of Ready
        numApprovals >= threshold
        Can be executed by any owner
        Can still be cancelled
    end note

    note right of Executed
        Transaction sent to destination
        State updated: executed = true
        Nonce incremented
        Cannot be re-executed
    end note

    note right of Cancelled
        State updated: cancelled = true
        Cannot be executed
        Nonce NOT incremented
        Can propose again (new hash)
    end note
```

### Transaction Flow Sequence

```mermaid
sequenceDiagram
    participant O1 as Owner 1
    participant O2 as Owner 2
    participant O3 as Owner 3
    participant W as MultisigWallet<br/>(2-of-3)
    participant Target as Target Contract

    Note over O1,Target: Phase 1: Proposal
    O1->>W: proposeTransaction(to, value, data)
    W->>W: Create transaction struct
    W->>W: txHash = hash(to, value, data, nonce)
    W->>W: transactions[txHash] = Transaction{...}
    W-->>O1: Event: TransactionProposed(txHash)

    Note over O1,Target: Phase 2: Approvals
    O1->>W: approveTransaction(txHash)
    W->>W: Check isOwner(O1) ✓
    W->>W: Check !approvals[txHash][O1] ✓
    W->>W: approvals[txHash][O1] = true
    W->>W: numApprovals++ (now 1)
    W-->>O1: Event: TransactionApproved(txHash, O1)

    O2->>W: approveTransaction(txHash)
    W->>W: Check isOwner(O2) ✓
    W->>W: Check !approvals[txHash][O2] ✓
    W->>W: approvals[txHash][O2] = true
    W->>W: numApprovals++ (now 2)
    W-->>O2: Event: TransactionApproved(txHash, O2)

    Note over W: Threshold met (2 >= 2)

    Note over O1,Target: Phase 3: Execution
    O3->>W: executeTransaction(txHash)
    W->>W: Check numApprovals >= threshold ✓
    W->>W: Check !executed && !cancelled ✓
    W->>W: executed = true
    W->>W: nonce++
    W->>Target: call(to, value, data)
    Target-->>W: Success
    W-->>O3: Event: TransactionExecuted(txHash)
```

---

## Module System

How modules extend wallet functionality while maintaining security.

```mermaid
graph TB
    subgraph "Module Architecture"
        Wallet[MultisigWallet]

        subgraph "Module Registry"
            EnabledModules[mapping modules]
        end

        subgraph "Module Actions"
            Enable[enableModule]
            Disable[disableModule]
            Execute[execTransactionFromModule]
        end

        subgraph "Installed Modules"
            Daily[DailyLimitModule]
            White[WhitelistModule]
            Social[SocialRecoveryModule]
        end

        Wallet --> EnabledModules
        Enable --> EnabledModules
        Disable --> EnabledModules

        Daily -.calls.-> Execute
        White -.calls.-> Execute
        Social -.calls.-> Execute

        Execute --> Wallet
    end

    style Wallet fill:#ffcccc
    style Daily fill:#ccffcc
    style White fill:#ccffcc
    style Social fill:#ccffcc
    style Execute fill:#ffeecc
```

### Module Integration Flow

```mermaid
sequenceDiagram
    participant Owner
    participant Wallet as MultisigWallet
    participant Module as DailyLimitModule
    participant Target as Recipient

    Note over Owner,Target: Setup Phase (Requires Multisig)
    Owner->>Wallet: proposeTransaction(to: wallet, data: enableModule(module))
    Note over Wallet: Standard multisig approval process
    Wallet->>Wallet: executeTransaction()
    Wallet->>Wallet: enableModule(module)
    Wallet->>Wallet: modules[module] = true
    Wallet-->>Owner: Module enabled

    Owner->>Module: setDailyLimit(wallet, 1 QUAI)
    Module->>Wallet: Check msg.sender == wallet
    Note over Module: Must be called via multisig
    Module->>Module: dailyLimits[wallet].limit = 1 QUAI

    Note over Owner,Target: Execution Phase (Single Owner)
    Owner->>Module: executeBelowLimit(wallet, recipient, 0.5 QUAI)
    Module->>Module: Check isOwner(owner) ✓
    Module->>Module: Check modules[address(this)] ✓
    Module->>Module: Check spent + 0.5 <= 1 QUAI ✓
    Module->>Module: spent += 0.5 QUAI
    Module->>Wallet: execTransactionFromModule(recipient, 0.5 QUAI, "")
    Wallet->>Wallet: Check modules[msg.sender] ✓
    Wallet->>Target: transfer 0.5 QUAI
    Target-->>Wallet: Success
    Wallet-->>Module: Success
    Module-->>Owner: Transaction executed

    Note over Module: Security: Configuration requires multisig<br/>Execution allowed by single owner within limits
```

### Module Security Model

```mermaid
graph TB
    subgraph "Security Boundaries"
        subgraph "Requires Multisig Approval"
            Config1[Enable/Disable Module]
            Config2[Set Daily Limit]
            Config3[Add/Remove Whitelist]
            Config4[Configure Recovery]
        end

        subgraph "Single Owner Actions"
            Exec1[Execute Below Limit]
            Exec2[Execute to Whitelisted]
            Exec3[Approve Recovery<br/>as Guardian]
        end

        subgraph "Time-Delayed Actions"
            Delayed1[Execute Recovery<br/>after delay period]
        end

        subgraph "Module Restrictions"
            Restrict1[Cannot call enableModule]
            Restrict2[Cannot call disableModule]
            Restrict3[Cannot bypass owner checks]
        end
    end

    Config1 --> Wallet[MultisigWallet]
    Config2 --> Wallet
    Config3 --> Wallet
    Config4 --> Wallet

    Exec1 --> Limits[Check Limits]
    Exec2 --> Limits
    Exec3 --> Limits

    Limits --> Wallet

    Delayed1 --> Time[Check Time Elapsed]
    Time --> Wallet

    Restrict1 -.blocked.-> X1[X]
    Restrict2 -.blocked.-> X2[X]
    Restrict3 -.blocked.-> X3[X]

    style Config1 fill:#ffcccc
    style Config2 fill:#ffcccc
    style Config3 fill:#ffcccc
    style Config4 fill:#ffcccc
    style Exec1 fill:#ccffcc
    style Exec2 fill:#ccffcc
    style Exec3 fill:#ccffcc
    style Delayed1 fill:#ffffcc
```

---

## Frontend Architecture

Service layer architecture and state management with hybrid indexer/blockchain data fetching.

```mermaid
graph TB
    subgraph "React Components"
        Dashboard[Dashboard]
        Transactions[Transactions]
        Modules[Modules]
        Settings[Settings]
    end

    subgraph "State Management"
        ReactQuery[React Query<br/>Server State]
        Zustand[Zustand<br/>Client State]
    end

    subgraph "Service Layer"
        MultisigService[MultisigService<br/>Facade Pattern]

        subgraph "Core Services"
            TxService[TransactionService]
            TxBuilder[TransactionBuilderService]
            OwnerService[OwnerService]
            WalletService[WalletService]
            BaseService[BaseService]
        end

        subgraph "Module Services"
            DailyService[DailyLimitModuleService]
            WhiteService[WhitelistModuleService]
            RecoveryService[SocialRecoveryModuleService]
        end

        subgraph "Indexer Services"
            IndexerService[IndexerService<br/>Facade]
            IndexerWallet[IndexerWalletService]
            IndexerTx[IndexerTransactionService]
            IndexerSub[IndexerSubscriptionService]
            IndexerHealth[IndexerHealthService]
        end
    end

    subgraph "Blockchain"
        Provider[JsonRpcProvider]
        Signer[Wallet/Signer]
        Contracts[Contract Instances]
    end

    subgraph "Indexer"
        Supabase[Supabase Client]
        Realtime[Real-time Subscriptions]
    end

    Dashboard --> ReactQuery
    Transactions --> ReactQuery
    Modules --> ReactQuery
    Settings --> Zustand

    ReactQuery --> MultisigService
    Zustand --> MultisigService

    MultisigService --> TxService
    MultisigService --> TxBuilder
    MultisigService --> OwnerService
    MultisigService --> WalletService
    MultisigService --> DailyService
    MultisigService --> WhiteService
    MultisigService --> RecoveryService
    MultisigService --> IndexerService

    TxService --> BaseService
    TxBuilder --> BaseService
    OwnerService --> BaseService
    WalletService --> BaseService
    DailyService --> BaseService
    WhiteService --> BaseService
    RecoveryService --> BaseService

    IndexerService --> IndexerWallet
    IndexerService --> IndexerTx
    IndexerService --> IndexerSub
    IndexerService --> IndexerHealth

    BaseService --> Provider
    BaseService --> Signer
    BaseService --> Contracts

    IndexerWallet --> Supabase
    IndexerTx --> Supabase
    IndexerSub --> Realtime
    IndexerHealth --> Supabase

    Contracts --> Provider

    style MultisigService fill:#ffcccc
    style BaseService fill:#ccffcc
    style IndexerService fill:#ccffcc
    style ReactQuery fill:#e1f5ff
    style Zustand fill:#e1f5ff
    style Supabase fill:#ffffcc
```

### Data Fetching Strategy

The frontend uses a **hybrid approach** for data fetching:

- **Reads**: Use indexer when available (fast, historical data, real-time subscriptions)
- **Writes**: Always use blockchain (transactions must go on-chain)
- **Fallback**: If indexer unavailable, fall back to blockchain polling

Real-time updates are provided via Supabase subscriptions with automatic reconnection handling. When subscriptions are unavailable, React Query polling (10-30 second intervals) provides fallback data freshness.

### Service Layer Pattern

```mermaid
classDiagram
    class MultisigService {
        <<Facade>>
        -transactionService
        -transactionBuilder
        -ownerService
        -walletService
        -dailyLimitService
        -whitelistService
        -recoveryService
        -indexerService

        +proposeTransaction()
        +approveTransaction()
        +executeTransaction()
        +deployWallet()
        +getWalletInfo()
        +enableModule()
        +All module operations delegated
    }

    class BaseService {
        <<Abstract>>
        #provider
        #signer
        #getContract()
        #getSigner()
        #waitForTransaction()
    }

    class TransactionService {
        +proposeTransaction()
        +approveTransaction()
        +revokeApproval()
        +executeTransaction()
        +cancelTransaction()
        +getTransaction()
        +getPendingTransactions()
        +getTransactionHistory()
    }

    class WalletService {
        +deployWallet()
        +getWalletInfo()
        +getWalletsForOwner()
        +isOwner()
        +isModuleEnabled()
        +getBalance()
    }

    class OwnerService {
        +addOwner()
        +removeOwner()
        +changeThreshold()
        +enableModule()
        +disableModule()
    }

    class IndexerService {
        <<Facade>>
        -walletService
        -transactionService
        -subscriptionService
        -healthService

        +isAvailable()
        +getHealth()
    }

    class IndexerWalletService {
        +getWalletsForOwner()
        +getWalletDetails()
        +getWalletOwners()
    }

    class IndexerTransactionService {
        +getPendingTransactions()
        +getTransactionHistory()
        +getConfirmationsForTransactions()
    }

    class IndexerSubscriptionService {
        +subscribeToWallet()
        +subscribeToTransactions()
        +unsubscribeAll()
    }

    class IndexerHealthService {
        +checkHealth()
        +getSyncStatus()
    }

    class DailyLimitModuleService {
        +proposeSetDailyLimit()
        +executeBelowLimit()
        +getRemainingLimit()
        +getTimeUntilReset()
    }

    class WhitelistModuleService {
        +proposeAddToWhitelist()
        +removeFromWhitelist()
        +executeWhitelistedTransaction()
        +isWhitelisted()
        +getWhitelistLimit()
    }

    class SocialRecoveryModuleService {
        +proposeSetupRecovery()
        +initiateRecovery()
        +approveRecovery()
        +executeRecovery()
        +cancelRecovery()
        +getRecoveryConfig()
        +getPendingRecoveries()
    }

    MultisigService --> TransactionService
    MultisigService --> WalletService
    MultisigService --> OwnerService
    MultisigService --> DailyLimitModuleService
    MultisigService --> WhitelistModuleService
    MultisigService --> SocialRecoveryModuleService
    MultisigService --> IndexerService

    TransactionService --|> BaseService
    WalletService --|> BaseService
    OwnerService --|> BaseService
    DailyLimitModuleService --|> BaseService
    WhitelistModuleService --|> BaseService
    SocialRecoveryModuleService --|> BaseService

    IndexerService --> IndexerWalletService
    IndexerService --> IndexerTransactionService
    IndexerService --> IndexerSubscriptionService
    IndexerService --> IndexerHealthService
```

---

## Security Model

Multi-layered security architecture.

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Layer 1: Access Control"
            L1A[Owner-Only Functions]
            L1B[Wallet-Only Functions]
            L1C[Module-Only Functions]
        end

        subgraph "Layer 2: Threshold Requirements"
            L2A[Multisig Approval<br/>Critical Operations]
            L2B[Single Owner<br/>Module Operations]
            L2C[Guardian Threshold<br/>Recovery Operations]
        end

        subgraph "Layer 3: State Protection"
            L3A[Transaction Nonce]
            L3B[Executed/Cancelled Flags]
            L3C[Double-Approval Prevention]
        end

        subgraph "Layer 4: Time Delays"
            L4A[Recovery Period]
            L4B[Daily Limit Reset]
        end

        subgraph "Layer 5: Module Restrictions"
            L5A[Cannot Enable/Disable Modules]
            L5B[Cannot Modify Owners]
            L5C[Must Be Enabled]
        end

        subgraph "Layer 6: Gas Optimization"
            L6A[Custom Errors]
            L6B[Efficient Storage]
            L6C[Minimal Proxy Pattern]
        end
    end

    L1A --> L2A
    L1B --> L2A
    L1C --> L2B

    L2A --> L3A
    L2B --> L3B
    L2C --> L4A

    L3A --> L5A
    L3B --> L5B
    L3C --> L5C

    style L1A fill:#ffcccc
    style L1B fill:#ffcccc
    style L1C fill:#ffcccc
    style L2A fill:#ffeecc
    style L2B fill:#ffeecc
    style L2C fill:#ffeecc
    style L3A fill:#ffffcc
    style L3B fill:#ffffcc
    style L3C fill:#ffffcc
```

### Security Checks Flow

```mermaid
sequenceDiagram
    participant User
    participant Wallet
    participant Module
    participant Target

    Note over User,Target: Critical Operation (Owner Management)
    User->>Wallet: addOwner(newOwner)
    Wallet->>Wallet: Check onlySelf modifier
    Note over Wallet: msg.sender must be wallet address
    alt msg.sender != address(this)
        Wallet-->>User: Revert: MustBeCalledBySelf
    else Multisig approval passed
        Wallet->>Wallet: Execute addOwner
        Wallet-->>User: Success
    end

    Note over User,Target: Module Operation
    User->>Module: executeBelowLimit(wallet, to, value)
    Module->>Wallet: Check isOwner(msg.sender)
    alt Not an owner
        Wallet-->>User: Revert: NotAnOwner
    end
    Module->>Module: Check module enabled
    alt Module not enabled
        Module-->>User: Revert: ModuleNotEnabled
    end
    Module->>Module: Check daily limit
    alt Exceeds limit
        Module-->>User: Revert: ExceedsDailyLimit
    end
    Module->>Wallet: execTransactionFromModule(to, value, data)
    Wallet->>Wallet: Check modules[msg.sender]
    alt Not enabled module
        Wallet-->>User: Revert: ModuleNotEnabled
    end
    Wallet->>Wallet: Check cannot call privileged functions
    alt Trying to call enableModule/disableModule
        Wallet-->>User: Revert: CannotCallThisFunction
    end
    Wallet->>Target: Execute transaction
    Target-->>Wallet: Success
    Wallet-->>Module: Success
    Module-->>User: Success

    Note over User,Target: Recovery Operation
    User->>Module: executeRecovery(wallet, recoveryHash)
    Module->>Module: Check recovery initiated
    Module->>Module: Check threshold met
    Module->>Module: Check time delay elapsed
    Module->>Wallet: execTransactionFromModule (owner changes)
    Wallet->>Wallet: Check allowed for recovery
    Wallet->>Wallet: Remove old owners
    Wallet->>Wallet: Add new owners
    Wallet->>Wallet: Update threshold
    Wallet-->>Module: Success
    Module-->>User: Recovery complete
```

---

## Key Design Decisions

### 1. Proxy Pattern (EIP-1967)
- **Benefit**: Minimal gas cost per wallet (~100K gas vs 2M+ gas)
- **Trade-off**: All wallets share same implementation
- **Mitigation**: Rigorous testing and auditing of implementation

### 2. Nonce-Based Transaction Hashing
- **Benefit**: Allows duplicate transactions after cancellation
- **Trade-off**: Cannot predict transaction hash before nonce known
- **Mitigation**: Frontend queries nonce before proposal

### 3. Module System with execTransactionFromModule
- **Benefit**: Flexible extension without upgrading wallets
- **Trade-off**: Modules are trusted (must be enabled via multisig)
- **Mitigation**: Each module requires explicit multisig approval

### 4. Custom Errors Instead of Strings
- **Benefit**: ~50 gas savings per revert
- **Trade-off**: Slightly less readable in raw transactions
- **Mitigation**: Frontend decodes errors, tests check error types

### 5. Social Recovery with Time Delay
- **Benefit**: Protects against compromised guardians
- **Trade-off**: Recovery takes minimum 24 hours
- **Mitigation**: Owners can cancel recovery during delay period

### 6. Daily Limit Reset vs Sliding Window
- **Benefit**: Simpler implementation, lower gas
- **Trade-off**: Can spend 2x limit at boundary (11:59 PM + 12:01 AM)
- **Mitigation**: Document behavior, users set appropriate limits

---

## Technology Stack

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Testing**: Hardhat + Chai
- **Libraries**: OpenZeppelin Contracts 5.0.0
- **Network**: Quai Network

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State**: Zustand (client state) + React Query (server state)
- **Blockchain**: quais.js (Quai-specific ethers.js fork)
- **Indexer**: Supabase (real-time subscriptions + database queries)
- **Validation**: Zod (runtime type validation)
- **Styling**: TailwindCSS
- **Testing**: Vitest + React Testing Library

### Development Tools
- **Linting**: ESLint + Solhint
- **Formatting**: Prettier
- **Type Generation**: TypeChain
- **Coverage**: Solidity Coverage
- **Gas Reporting**: Hardhat Gas Reporter

---

## Deployment Addresses

Contract addresses are managed in:
- **Root**: `.env` (for deployment scripts)
- **Frontend**: `frontend/.env` (with `VITE_` prefix)
- **Deployment Records**: `contracts/deployments/` (JSON files)

Key environment variables:
```bash
# Implementation and factory
MULTISIG_IMPLEMENTATION=0x...
PROXY_FACTORY=0x...

# Modules
SOCIAL_RECOVERY_MODULE=0x...
DAILY_LIMIT_MODULE=0x...
WHITELIST_MODULE=0x...

# Network
RPC_URL=https://rpc.cyprus1.orchard.quai.network
BLOCK_EXPLORER_URL=https://quaiscan.io

# Indexer (frontend uses VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_NETWORK_SCHEMA=testnet
VITE_INDEXER_URL=http://localhost:3001
```

---

*Updated: 2026-02-01*
