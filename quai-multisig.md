# Quai Network Multisig Implementation Specification

## Project Overview

A Gnosis Safe-inspired multisig wallet solution for Quai Network's account-based (EVM) layer. This implementation prioritizes decentralization, with all core functionality working directly via RPC without backend dependencies.

### Key Characteristics
- **Target Network**: Quai Network (account-based/EVM layer only, not UTXO/Qi)
- **Current State**: Single shard deployment
- **Future-Ready**: Upgradeable proxy pattern for multi-shard support
- **SDK**: Quais.js for blockchain interaction
- **Architecture**: Decentralized-first (backend optional for performance only)

---

## Architecture Overview

### Core Principle
**Everything works without a backend.** All essential functionality is available through direct RPC calls. Backend services are optional performance enhancements.

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Static Site - Can run on IPFS)                  │
│  - Wallet creation & management                            │
│  - Transaction proposal/approval/execution                 │
│  - Direct RPC queries via Quais.js                         │
│  - Local storage for user preferences                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Quais.js SDK Layer                                         │
│  - Handles sharded address space                           │
│  - Transaction routing                                      │
│  - Shard-aware RPC calls                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Smart Contracts (Current Single Shard)                    │
│  - MultisigWallet (Implementation)                          │
│  - MultisigWalletProxy (Per-instance)                       │
│  - ProxyFactory (Wallet deployment)                         │
│  - Modules (Recovery, Limits, etc.)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Optional Backend Services (Performance Enhancement)        │
│  - Event Indexer (faster queries)                          │
│  - WebSocket Server (real-time notifications)              │
│  - Can be self-hosted by users                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Architecture

### 1. MultisigWallet (Implementation Contract)

The core logic contract containing all multisig functionality. Deployed once and used by all proxies.

**State Variables:**
```solidity
mapping(address => bool) public isOwner;
address[] public owners;
uint256 public threshold;
uint256 public nonce;
mapping(bytes32 => Transaction) public transactions;
mapping(bytes32 => mapping(address => bool)) public approvals;
mapping(address => bool) public modules;
```

**Transaction Structure:**
```solidity
struct Transaction {
    address to;
    uint256 value;
    bytes data;
    bool executed;
    bool cancelled;
    uint256 numApprovals;
    uint256 timestamp;
    address proposer; // Track who proposed the transaction
}
```

**Core Functions:**
- `initialize(address[] memory _owners, uint256 _threshold)` - Initialize wallet
- `proposeTransaction(address to, uint256 value, bytes memory data)` - Propose new transaction
- `approveTransaction(bytes32 txHash)` - Approve pending transaction
- `executeTransaction(bytes32 txHash)` - Execute transaction after threshold met
- `revokeApproval(bytes32 txHash)` - Revoke previous approval
- `cancelTransaction(bytes32 txHash)` - Cancel a pending transaction (only proposer or if threshold not met)
- `addOwner(address owner)` - Add new owner (requires multisig)
- `removeOwner(address owner)` - Remove owner (requires multisig)
- `changeThreshold(uint256 _threshold)` - Change approval threshold (requires multisig)
- `getTransaction(bytes32 txHash)` - Retrieve transaction details by hash

**Module Support:**
- `enableModule(address module)` - Enable extension module
- `disableModule(address module)` - Disable extension module
- `execTransactionFromModule(address to, uint256 value, bytes memory data)` - Allow modules to execute

**Events:**
```solidity
event TransactionProposed(bytes32 indexed txHash, address indexed proposer, address to, uint256 value);
event TransactionApproved(bytes32 indexed txHash, address indexed approver);
event TransactionExecuted(bytes32 indexed txHash);
event ApprovalRevoked(bytes32 indexed txHash, address indexed owner);
event OwnerAdded(address indexed owner);
event OwnerRemoved(address indexed owner);
event ThresholdChanged(uint256 threshold);
event ModuleEnabled(address indexed module);
event ModuleDisabled(address indexed module);
```

**Security Features:**
- ReentrancyGuard on execution functions
- Checks-Effects-Interactions pattern
- Owner-only functions
- Threshold validation
- Nonce for replay protection

### 2. MultisigWalletProxy (Per-Instance Contract)

Minimal proxy using delegate call pattern. One deployed per wallet instance.

**State Variables:**
```solidity
address public implementation;
address public admin;
```

**Functions:**
- `fallback()` - Delegate all calls to implementation
- `receive()` - Accept ETH/Quai transfers
- `upgradeTo(address newImplementation)` - Upgrade implementation (admin only)

**Deployment Pattern:**
Uses minimal proxy pattern (EIP-1167) for gas-efficient deployment.

### 3. ProxyFactory

Factory contract for deploying new multisig wallets with deterministic addresses.

**Functions:**
- `createWallet(address[] memory owners, uint256 threshold, bytes32 salt)` - Deploy new wallet
- `computeAddress(bytes32 salt, address deployer)` - Compute address before deployment
- `getWallets()` - Get all deployed wallets

**Events:**
```solidity
event WalletCreated(address indexed wallet, address[] owners, uint256 threshold, address creator);
```

**Features:**
- CREATE2 for deterministic addresses
- Wallet registry tracking
- Initialization in single transaction

### 4. Module System

Extensible module architecture for additional features.

#### SocialRecoveryModule
**Purpose:** Allow wallet recovery through guardian consensus

```solidity
struct RecoveryConfig {
    address[] guardians;
    uint256 threshold;
    uint256 recoveryPeriod; // Time delay before execution
}

struct Recovery {
    address[] newOwners;
    uint256 newThreshold;
    uint256 approvalCount;
    uint256 executionTime;
    bool executed;
    mapping(address => bool) approvals;
}
```

**Functions:**
- `setupRecovery(address[] guardians, uint256 threshold, uint256 period)`
- `initiateRecovery(address[] newOwners, uint256 newThreshold)`
- `approveRecovery(address wallet, bytes32 recoveryHash)`
- `executeRecovery(address wallet, bytes32 recoveryHash)`
- `cancelRecovery(bytes32 recoveryHash)`

#### DailyLimitModule
**Purpose:** Set daily spending limits for automatic small transactions

```solidity
struct DailyLimit {
    uint256 limit;
    uint256 spent;
    uint256 lastReset;
}
```

**Functions:**
- `setDailyLimit(uint256 limit)`
- `executeBelowLimit(address to, uint256 value)`
- `resetDailyLimit()`

#### WhitelistModule
**Purpose:** Pre-approved addresses that can be sent to without full approval

```solidity
mapping(address => bool) public whitelist;
```

**Functions:**
- `addToWhitelist(address addr)`
- `removeFromWhitelist(address addr)`
- `executeToWhitelist(address to, uint256 value, bytes data)`

---

## Frontend Architecture

### Technology Stack
- **Framework:** React 18+ with TypeScript
- **Blockchain SDK:** Quais.js (Quai's official SDK)
- **Styling:** TailwindCSS
- **State Management:** Zustand or Redux Toolkit
- **Data Fetching:** React Query (TanStack Query)
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Zod validation
- **Wallet Connection:** Custom Quais.js integration
- **Build Tool:** Vite

### Core Services

#### 1. MultisigService
Handles all multisig operations with automatic RPC/backend fallback.

```typescript
class MultisigService {
  private provider: quais.providers.JsonRpcProvider;
  private backendAvailable: boolean;
  
  // Wallet Operations
  async createWallet(owners: string[], threshold: number, salt: string): Promise<string>;
  async getPendingTransactions(walletAddress: string): Promise<Transaction[]>;
  async getTransactionHistory(walletAddress: string): Promise<Event[]>;
  async getOwners(walletAddress: string): Promise<{owners: string[], threshold: number}>;
  async getMyWallets(userAddress: string): Promise<string[]>;
  
  // Transaction Operations
  async proposeTransaction(walletAddress: string, to: string, value: BigNumber, data: string): Promise<string>;
  async approveTransaction(walletAddress: string, txHash: string): Promise<void>;
  async executeTransaction(walletAddress: string, txHash: string): Promise<void>;
  async revokeApproval(walletAddress: string, txHash: string): Promise<void>;
  
  // Owner Management
  async addOwner(walletAddress: string, newOwner: string): Promise<void>;
  async removeOwner(walletAddress: string, owner: string): Promise<void>;
  async changeThreshold(walletAddress: string, newThreshold: number): Promise<void>;
  
  // Real-time Updates
  subscribeToUpdates(walletAddress: string, callback: (event: any) => void): () => void;
  
  // Private helpers
  private async getPendingTransactionsFromRPC(walletAddress: string): Promise<Transaction[]>;
  private async subscribeViaWebSocket(walletAddress: string, callback: Function): () => void;
  private async subscribeViaPolling(walletAddress: string, callback: Function): () => void;
}
```

#### 2. WalletConnectionService
Manages wallet connections and signing.

```typescript
class WalletConnectionService {
  async connect(): Promise<string>; // Returns connected address
  async disconnect(): Promise<void>;
  async signMessage(message: string): Promise<string>;
  async signTransactionHash(txHash: string): Promise<string>;
  getConnectedAddress(): string | null;
  getSigner(): quais.Signer;
  isConnected(): boolean;
}
```

#### 3. TransactionBuilderService
Constructs and validates transactions.

```typescript
class TransactionBuilderService {
  // Build transaction data
  buildTransferData(to: string, value: BigNumber): TransactionData;
  buildERC20Transfer(tokenAddress: string, to: string, amount: BigNumber): TransactionData;
  buildContractCall(contractAddress: string, abi: any[], method: string, params: any[]): TransactionData;
  buildBatchTransaction(transactions: TransactionData[]): TransactionData;
  
  // Validation
  validateTransaction(tx: TransactionData): ValidationResult;
  estimateGas(tx: TransactionData): Promise<BigNumber>;
  
  // Utilities
  encodeTransactionData(method: string, params: any[]): string;
  decodeTransactionData(data: string): DecodedTransaction;
}
```

### Key React Components

#### Pages
- `DashboardPage` - Overview of all wallets
- `WalletDetailPage` - Single wallet management
- `CreateWalletPage` - New wallet creation flow
- `TransactionProposalPage` - Propose new transaction
- `SettingsPage` - User preferences and configurations

#### Components
- `WalletCard` - Display wallet summary
- `TransactionList` - List pending/executed transactions
- `TransactionItem` - Single transaction details
- `ApprovalProgress` - Visual approval progress (X of Y approvals)
- `OwnerList` - Display and manage owners
- `TransactionBuilder` - Form for building transactions
- `SignatureCollector` - Collect and display approvals
- `ModuleManager` - Enable/disable modules
- `NetworkSelector` - Switch between networks (future multi-shard)

#### Hooks
```typescript
// Wallet hooks
useWallets(ownerAddress: string)
useWalletDetails(walletAddress: string)
usePendingTransactions(walletAddress: string)
useTransactionHistory(walletAddress: string)

// Transaction hooks
useTransaction(walletAddress: string, txHash: string)
useApprovals(walletAddress: string, txHash: string)
useTransactionExecution(walletAddress: string, txHash: string)

// Real-time hooks
useRealtimeUpdates(walletAddress: string)

// Wallet connection
useWalletConnection()
```

### State Management

```typescript
// Store structure (Zustand)
interface AppState {
  // Wallet connection
  connectedAddress: string | null;
  signer: quais.Signer | null;
  
  // Selected wallet
  selectedWallet: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  preferences: {
    backendEnabled: boolean;
    refreshInterval: number;
    theme: 'light' | 'dark';
  };
  
  // Actions
  setConnectedAddress: (address: string) => void;
  setSelectedWallet: (address: string) => void;
  setError: (error: string) => void;
  updatePreferences: (prefs: Partial<Preferences>) => void;
}
```

### Data Flow Example

#### Transaction Proposal Flow
```
1. User fills TransactionBuilder form
   → Validates inputs
   → Estimates gas
   
2. User clicks "Propose"
   → TransactionBuilderService encodes data
   → WalletConnectionService signs proposal
   → MultisigService.proposeTransaction() called
   
3. MultisigService logic
   → Constructs transaction via Quais.js
   → Submits to MultisigWallet contract
   → Waits for confirmation
   → Returns transaction hash
   
4. Frontend updates
   → useTransaction hook invalidates cache
   → TransactionList re-fetches pending transactions
   → Real-time subscription notifies other owners
   
5. Other owners see notification
   → TransactionItem shows pending approval
   → ApprovalProgress shows 1/N approvals
```

---

## Backend Architecture (Optional)

### Purpose
Optional performance enhancement layer. All functionality works without it.

### Components

#### 1. Event Indexer Service

**Purpose:** Cache blockchain events for faster queries

**Tech Stack:**
- Node.js + TypeScript
- PostgreSQL (hosted) or SQLite (self-hosted)
- Quais.js for RPC connection
- Express for REST API

**Database Schema:**
```sql
-- Wallets
CREATE TABLE wallets (
  address VARCHAR(42) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  factory_address VARCHAR(42) NOT NULL,
  created_by VARCHAR(42) NOT NULL,
  threshold INTEGER NOT NULL,
  INDEX idx_creator (created_by)
);

-- Events (denormalized for fast queries)
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  block_number INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  data JSONB NOT NULL,
  INDEX idx_wallet (wallet_address),
  INDEX idx_block (block_number),
  INDEX idx_type (event_type),
  INDEX idx_tx (tx_hash)
);

-- Transactions cache
CREATE TABLE transactions (
  tx_hash VARCHAR(66) PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  value NUMERIC NOT NULL,
  data TEXT,
  executed BOOLEAN DEFAULT false,
  approval_count INTEGER DEFAULT 0,
  threshold INTEGER NOT NULL,
  proposed_by VARCHAR(42) NOT NULL,
  proposed_at TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  INDEX idx_wallet_pending (wallet_address, executed)
);

-- Owners cache
CREATE TABLE owners (
  wallet_address VARCHAR(42) NOT NULL,
  owner_address VARCHAR(42) NOT NULL,
  added_at TIMESTAMP NOT NULL,
  removed_at TIMESTAMP,
  PRIMARY KEY (wallet_address, owner_address),
  INDEX idx_owner (owner_address, removed_at)
);

-- Indexer state
CREATE TABLE indexer_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_indexed_block INTEGER NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  CHECK (id = 1)
);
```

**Core Service Implementation:**
```typescript
class IndexerService {
  private provider: quais.providers.JsonRpcProvider;
  private db: Database;
  private lastIndexedBlock: number;
  
  async start(): Promise<void>;
  async catchUp(): Promise<void>;
  async indexBlock(blockNumber: number): Promise<void>;
  async indexWalletEvents(walletAddress: string, fromBlock: number, toBlock: number): Promise<void>;
  async processEvent(walletAddress: string, event: Event): Promise<void>;
  
  // Event processors
  private async cacheTransaction(walletAddress: string, eventArgs: any): Promise<void>;
  private async updateTransactionApprovals(txHash: string): Promise<void>;
  private async markTransactionExecuted(txHash: string): Promise<void>;
  private async addOwner(walletAddress: string, owner: string): Promise<void>;
  private async removeOwner(walletAddress: string, owner: string): Promise<void>;
}
```

**REST API Endpoints:**
```typescript
// GET /api/wallets/:ownerAddress
// Returns all wallets where address is an owner
Response: { wallets: WalletInfo[] }

// GET /api/wallets/:address/pending
// Returns pending transactions for a wallet
Response: { transactions: Transaction[] }

// GET /api/wallets/:address/history
// Returns transaction history
Query: { limit?: number, offset?: number, eventType?: string }
Response: { events: Event[], total: number }

// GET /api/wallets/:address/owners
// Returns current owners and threshold
Response: { owners: string[], threshold: number }

// GET /api/health
// Health check endpoint
Response: { 
  status: 'ok' | 'degraded',
  lastIndexedBlock: number,
  currentBlock: number,
  blocksBehind: number
}

// GET /api/stats
// Platform statistics
Response: {
  totalWallets: number,
  totalTransactions: number,
  activeWallets: number
}
```

#### 2. WebSocket Notification Service

**Purpose:** Real-time push notifications for wallet events

**Implementation:**
```typescript
class NotificationService {
  private wss: WebSocketServer;
  private provider: quais.providers.JsonRpcProvider;
  private subscriptions: Map<string, Set<WebSocket>>;
  
  constructor(rpcUrl: string, port: number);
  
  // Connection handling
  private handleConnection(ws: WebSocket): void;
  private handleMessage(ws: WebSocket, message: any): void;
  
  // Subscription management
  subscribe(ws: WebSocket, walletAddress: string): void;
  unsubscribe(ws: WebSocket, walletAddress: string): void;
  
  // Event watching
  private async watchWallet(walletAddress: string): Promise<void>;
  private broadcast(walletAddress: string, message: any): void;
}
```

**WebSocket Message Protocol:**
```typescript
// Client -> Server
interface SubscribeMessage {
  type: 'SUBSCRIBE';
  walletAddress: string;
}

interface UnsubscribeMessage {
  type: 'UNSUBSCRIBE';
  walletAddress: string;
}

// Server -> Client
interface NotificationMessage {
  type: 'TRANSACTION_PROPOSED' | 'TRANSACTION_APPROVED' | 'TRANSACTION_EXECUTED' 
       | 'OWNER_ADDED' | 'OWNER_REMOVED' | 'THRESHOLD_CHANGED';
  walletAddress: string;
  txHash?: string;
  data: any;
  timestamp: number;
}

interface StatusMessage {
  type: 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'ERROR';
  walletAddress?: string;
  message?: string;
}
```

### Self-Hosting Setup

**Docker Compose Configuration:**
```yaml
version: '3.8'

services:
  indexer:
    build: ./backend
    environment:
      - NODE_ENV=production
      - QUAI_RPC_URL=${QUAI_RPC_URL:-https://rpc.quai.network}
      - DATABASE_URL=postgresql://postgres:password@db:5432/multisig
      - INDEXER_START_BLOCK=${START_BLOCK:-0}
      - API_PORT=3000
      - WS_PORT=8080
    ports:
      - "3000:3000"
      - "8080:8080"
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=multisig
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:
```

**Environment Variables:**
```env
# Required
QUAI_RPC_URL=https://rpc.quai.network
DATABASE_URL=postgresql://user:pass@localhost:5432/multisig

# Optional
INDEXER_START_BLOCK=0
API_PORT=3000
WS_PORT=8080
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
ENABLE_CORS=true
CORS_ORIGIN=*
```

---

## Quais.js Integration Guide

### Installation
```bash
npm install quais
```

### Provider Setup
```typescript
import { quais } from 'quais';

// Initialize provider (handles sharding automatically)
const provider = new quais.providers.JsonRpcProvider(
  'https://rpc.quai.network'
);

// For multiple networks
const providers = {
  mainnet: new quais.providers.JsonRpcProvider('https://rpc.quai.network'),
  testnet: new quais.providers.JsonRpcProvider('https://rpc.testnet.quai.network'),
  local: new quais.providers.JsonRpcProvider('http://localhost:8545')
};
```

### Wallet Connection
```typescript
// Connect wallet
async function connectWallet(): Promise<string> {
  // Browser wallet injection (similar to MetaMask)
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  }
  throw new Error('No wallet found');
}

// Create signer
const signer = provider.getSigner();
const address = await signer.getAddress();
```

### Contract Interaction
```typescript
// Load contract
const multisig = new quais.Contract(
  WALLET_ADDRESS,
  MULTISIG_ABI,
  signer
);

// Read operations (no gas)
const owners = await multisig.getOwners();
const threshold = await multisig.threshold();
const isOwner = await multisig.isOwner(address);

// Write operations (requires gas)
const tx = await multisig.proposeTransaction(
  toAddress,
  value,
  data,
  { gasLimit: 500000 }
);
await tx.wait(); // Wait for confirmation

// Listen to events
multisig.on('TransactionProposed', (txHash, proposer, event) => {
  console.log('New transaction proposed:', txHash);
});

// Query past events
const filter = multisig.filters.TransactionProposed();
const events = await multisig.queryFilter(filter, fromBlock, toBlock);
```

### Transaction Building
```typescript
// Simple transfer
const tx = await multisig.proposeTransaction(
  recipientAddress,
  quais.utils.parseEther('1.0'),
  '0x',
  { gasLimit: 300000 }
);

// ERC-20 transfer
const erc20Interface = new quais.utils.Interface([
  'function transfer(address to, uint256 amount) returns (bool)'
]);
const data = erc20Interface.encodeFunctionData('transfer', [
  recipientAddress,
  amount
]);
const tx = await multisig.proposeTransaction(
  tokenAddress,
  0,
  data,
  { gasLimit: 500000 }
);

// Contract interaction
const targetInterface = new quais.utils.Interface(TARGET_ABI);
const data = targetInterface.encodeFunctionData('someMethod', [
  param1,
  param2
]);
const tx = await multisig.proposeTransaction(
  targetContract,
  0,
  data,
  { gasLimit: 800000 }
);
```

### Gas Estimation
```typescript
// Estimate gas for transaction
async function estimateTransactionGas(
  to: string,
  value: BigNumber,
  data: string
): Promise<BigNumber> {
  try {
    const gasEstimate = await multisig.estimateGas.proposeTransaction(
      to,
      value,
      data
    );
    // Add 20% buffer
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    // Fallback to default
    return quais.BigNumber.from(500000);
  }
}
```

### Event Listening Patterns
```typescript
// One-time event listener
async function waitForApproval(txHash: string): Promise<void> {
  return new Promise((resolve) => {
    multisig.once(
      multisig.filters.TransactionApproved(txHash),
      (txHash, approver) => {
        console.log(`Approved by ${approver}`);
        resolve();
      }
    );
  });
}

// Continuous listening with cleanup
function subscribeToEvents(walletAddress: string): () => void {
  const multisig = new quais.Contract(walletAddress, ABI, provider);
  
  const onProposed = (txHash: string, proposer: string) => {
    console.log('Transaction proposed:', txHash);
  };
  
  const onApproved = (txHash: string, approver: string) => {
    console.log('Transaction approved:', txHash);
  };
  
  multisig.on('TransactionProposed', onProposed);
  multisig.on('TransactionApproved', onApproved);
  
  // Return cleanup function
  return () => {
    multisig.off('TransactionProposed', onProposed);
    multisig.off('TransactionApproved', onApproved);
  };
}
```

### Error Handling
```typescript
async function safeContractCall<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Parse error
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds for transaction');
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new Error('Transaction would fail - check parameters');
    } else if (error.message.includes('user rejected')) {
      throw new Error('Transaction rejected by user');
    }
    
    // Try to parse revert reason
    if (error.reason) {
      throw new Error(`Contract error: ${error.reason}`);
    }
    
    throw error;
  }
}
```

---

## Development Phases

### Phase 1: MVP (2-3 months)
**Goal:** Working multisig on single shard

**Smart Contracts:**
- [ ] MultisigWallet implementation
- [ ] MultisigWalletProxy
- [ ] ProxyFactory
- [ ] Comprehensive test suite (Hardhat/Foundry)
- [ ] Deployment scripts
- [ ] Gas optimization
- [ ] Security audit preparation

**Frontend:**
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Quais.js integration
- [ ] Wallet connection flow
- [ ] Create wallet UI
- [ ] Transaction proposal interface
- [ ] Transaction approval interface
- [ ] Transaction execution interface
- [ ] Owner management UI
- [ ] Basic transaction history
- [ ] Responsive design

**Testing:**
- [ ] Unit tests for all contracts
- [ ] Integration tests
- [ ] E2E tests for critical flows
- [ ] Gas benchmarks
- [ ] Security testing

**Documentation:**
- [ ] User guide
- [ ] Developer documentation
- [ ] API documentation
- [ ] Deployment guide

**Deliverable:** Functional multisig wallet on Quai testnet

### Phase 2: Enhanced Features (1-2 months)
**Goal:** Feature-complete production platform

**Smart Contracts:**
- [ ] SocialRecoveryModule
- [ ] DailyLimitModule
- [ ] WhitelistModule
- [ ] Module registry
- [ ] Additional security features

**Frontend:**
- [ ] Module configuration UI
- [ ] Social recovery setup
- [ ] Daily limit management
- [ ] Address whitelist management
- [ ] Batch transaction builder
- [ ] ERC-20 token support
- [ ] Token balance display
- [ ] Transaction simulator
- [ ] Address book
- [ ] Export/import functionality

**Backend (Optional):**
- [ ] Event indexer service
- [ ] WebSocket notification service
- [ ] REST API
- [ ] Docker setup
- [ ] Self-hosting documentation

**Testing:**
- [ ] Module integration tests
- [ ] Load testing
- [ ] Security audit

**Deliverable:** Production-ready platform with advanced features

### Phase 3: Polish & Optimization (1-2 months)
**Goal:** Professional, audited, optimized platform

**Smart Contracts:**
- [ ] Professional security audit
- [ ] Gas optimization improvements
- [ ] Emergency procedures
- [ ] Upgrade mechanisms tested

**Frontend:**
- [ ] Mobile app (React Native)
- [ ] Hardware wallet support
- [ ] WalletConnect integration
- [ ] Advanced transaction builder
- [ ] Analytics dashboard
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)

**Infrastructure:**
- [ ] CI/CD pipeline
- [ ] Monitoring and alerting
- [ ] Error tracking (Sentry)
- [ ] Analytics (Mixpanel/Amplitude)
- [ ] Documentation site
- [ ] API documentation (OpenAPI)

**Community:**
- [ ] Bug bounty program
- [ ] Community governance
- [ ] Educational content
- [ ] Video tutorials
- [ ] Developer SDK

**Deliverable:** Production launch

### Phase 4: Multi-Shard Support (2-3 months)
**Timeline:** When Quai enables additional shards

**Smart Contracts:**
- [ ] Cross-shard coordinator design
- [ ] Multi-shard wallet implementation
- [ ] State synchronization mechanisms
- [ ] Migration tools

**Frontend:**
- [ ] Shard selection UI
- [ ] Cross-shard transaction flow
- [ ] Shard balance aggregation
- [ ] Migration wizard

**Backend:**
- [ ] Multi-shard indexing
- [ ] Cross-shard event correlation
- [ ] Enhanced analytics

**Deliverable:** Multi-shard compatible system

---

## Security Considerations

### Smart Contract Security

**1. Access Control**
```solidity
// Owner-only functions
modifier onlyOwner() {
    require(isOwner[msg.sender], "Not an owner");
    _;
}

// Self-only functions (internal multisig calls)
modifier onlySelf() {
    require(msg.sender == address(this), "Only self");
    _;
}

// Module-only functions
modifier onlyModule() {
    require(modules[msg.sender], "Not an authorized module");
    _;
}
```

**2. Reentrancy Protection**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MultisigWallet is ReentrancyGuard {
    function executeTransaction(bytes32 txHash) 
        external 
        onlyOwner 
        nonReentrant 
    {
        // ... execution logic
    }
}
```

**3. Signature Verification**
```solidity
// Use EIP-712 for structured data signing
bytes32 private constant DOMAIN_TYPEHASH = keccak256(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
);

bytes32 private constant TRANSACTION_TYPEHASH = keccak256(
    "Transaction(address to,uint256 value,bytes data,uint256 nonce)"
);

function getTransactionHash(
    address to,
    uint256 value,
    bytes memory data
) public view returns (bytes32) {
    return keccak256(abi.encode(
        TRANSACTION_TYPEHASH,
        to,
        value,
        keccak256(data),
        nonce
    ));
}
```

**4. Checks-Effects-Interactions Pattern**
```solidity
function executeTransaction(bytes32 txHash) external onlyOwner {
    Transaction storage transaction = transactions[txHash];
    
    // Checks
    require(!transaction.executed, "Already executed");
    require(transaction.numApprovals >= threshold, "Not enough approvals");
    
    // Effects
    transaction.executed = true;
    nonce++;
    
    // Interactions
    (bool success, ) = transaction.to.call{value: transaction.value}(
        transaction.data
    );
    require(success, "Transaction failed");
    
    emit TransactionExecuted(txHash);
}
```

**5. Integer Overflow Protection**
```solidity
// Use Solidity 0.8.0+ for automatic overflow checks
pragma solidity ^0.8.0;

// Or use SafeMath for older versions
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
```

### Frontend Security

**1. Input Validation**
```typescript
import { z } from 'zod';

const addressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const valueSchema = z.string().regex(/^\d+(\.\d+)?$/);

function validateTransactionInput(input: any) {
  const schema = z.object({
    to: addressSchema,
    value: valueSchema,
    data: z.string().regex(/^0x[a-fA-F0-9]*$/)
  });
  
  return schema.parse(input);
}
```

**2. Transaction Simulation**
```typescript
// Simulate transaction before execution
async function simulateTransaction(
  to: string,
  value: BigNumber,
  data: string
): Promise<SimulationResult> {
  try {
    // Use eth_call to simulate
    await provider.call({
      from: walletAddress,
      to,
      value,
      data
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**3. Secure Key Management**
```typescript
// Never store private keys in frontend
// Use wallet providers (MetaMask, etc.)
// For backend services, use secure key management

// Environment-based configuration
const SENSITIVE_CONFIG = {
  rpcUrl: process.env.VITE_RPC_URL,
  // Never include private keys in env
};
```

**4. XSS Prevention**
```typescript
// Always sanitize user input
import DOMPurify from 'dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

// Use parameterized queries for any backend
// React automatically escapes JSX
```

### Operational Security

**1. Upgrade Safety**
- Time-locked upgrades (24-48 hours)
- Multi-signature approval for upgrades
- Comprehensive upgrade testing
- Rollback procedures

**2. Emergency Procedures**
```solidity
// Emergency pause functionality
contract MultisigWallet is Pausable {
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function executeTransaction(bytes32 txHash) 
        external 
        onlyOwner 
        whenNotPaused 
    {
        // ... execution logic
    }
}
```

**3. Monitoring & Alerts**
- Monitor all contract events
- Alert on unusual activity
- Track failed transactions
- Gas price monitoring

**4. Audit Checklist**
- [ ] Professional smart contract audit
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Code review process
- [ ] Formal verification (optional)

---

## Testing Strategy

### Smart Contract Tests

**Unit Tests (Hardhat/Foundry):**
```typescript
describe('MultisigWallet', () => {
  describe('Initialization', () => {
    it('should initialize with correct owners and threshold');
    it('should reject invalid threshold (0 or > owner count)');
    it('should reject duplicate owners');
    it('should reject zero address as owner');
  });
  
  describe('Transaction Proposal', () => {
    it('should allow owner to propose transaction');
    it('should reject non-owner proposal');
    it('should emit TransactionProposed event');
    it('should generate correct transaction hash');
  });
  
  describe('Transaction Approval', () => {
    it('should allow owner to approve transaction');
    it('should prevent duplicate approvals');
    it('should track approval count correctly');
    it('should emit TransactionApproved event');
  });
  
  describe('Transaction Execution', () => {
    it('should execute transaction after threshold met');
    it('should reject execution before threshold');
    it('should prevent double execution');
    it('should handle failed execution gracefully');
    it('should increment nonce after execution');
  });
  
  describe('Owner Management', () => {
    it('should add new owner through multisig');
    it('should remove owner through multisig');
    it('should update threshold through multisig');
    it('should prevent invalid threshold changes');
  });
  
  describe('Security', () => {
    it('should prevent reentrancy attacks');
    it('should verify signatures correctly');
    it('should prevent replay attacks');
    it('should handle ETH transfers correctly');
  });
});
```

**Integration Tests:**
```typescript
describe('MultisigWallet Integration', () => {
  it('should create wallet via factory');
  it('should complete full transaction lifecycle');
  it('should interact with ERC-20 tokens');
  it('should work with modules');
  it('should handle batch transactions');
  it('should support social recovery flow');
});
```

**Gas Tests:**
```typescript
describe('Gas Optimization', () => {
  it('should deploy wallet under X gas');
  it('should propose transaction under Y gas');
  it('should approve transaction under Z gas');
  it('should execute transaction under W gas');
});
```

### Frontend Tests

**Component Tests (React Testing Library):**
```typescript
describe('TransactionList', () => {
  it('should render pending transactions');
  it('should show approval progress');
  it('should allow approving transaction');
  it('should handle empty state');
  it('should handle loading state');
  it('should handle error state');
});
```

**Integration Tests (Cypress/Playwright):**
```typescript
describe('Multisig Flow', () => {
  it('should create new wallet', () => {
    cy.visit('/create');
    cy.fillWalletForm();
    cy.submit();
    cy.url().should('include', '/wallet/');
  });
  
  it('should propose transaction', () => {
    cy.connectWallet();
    cy.visit('/wallet/0x123.../propose');
    cy.fillTransactionForm();
    cy.submit();
    cy.contains('Transaction Proposed');
  });
  
  it('should approve and execute transaction', () => {
    cy.connectWallet(owner2);
    cy.approveTransaction(txHash);
    cy.connectWallet(owner3);
    cy.approveTransaction(txHash);
    cy.executeTransaction(txHash);
    cy.contains('Transaction Executed');
  });
});
```

**E2E Tests:**
- Full wallet creation flow
- Complete transaction lifecycle
- Owner management scenarios
- Module integration
- Error handling

---

## Deployment Guide

### Contract Deployment

**1. Environment Setup**
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your values
```

**Environment Variables:**
```env
# Network
QUAI_RPC_URL=https://rpc.quai.network
QUAI_CHAIN_ID=1

# Deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_api_key_here

# Contract addresses (after deployment)
MULTISIG_IMPLEMENTATION=
PROXY_FACTORY=
```

**2. Deployment Script**
```typescript
// scripts/deploy.ts
import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying contracts...');
  
  // Deploy implementation
  const MultisigWallet = await ethers.getContractFactory('MultisigWallet');
  const implementation = await MultisigWallet.deploy();
  await implementation.deployed();
  console.log('Implementation deployed to:', implementation.address);
  
  // Deploy factory
  const ProxyFactory = await ethers.getContractFactory('ProxyFactory');
  const factory = await ProxyFactory.deploy(implementation.address);
  await factory.deployed();
  console.log('Factory deployed to:', factory.address);
  
  // Verify contracts (if applicable)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log('Waiting for block confirmations...');
    await implementation.deployTransaction.wait(5);
    await factory.deployTransaction.wait(5);
    
    console.log('Verifying contracts...');
    await hre.run('verify:verify', {
      address: implementation.address,
      constructorArguments: [],
    });
    await hre.run('verify:verify', {
      address: factory.address,
      constructorArguments: [implementation.address],
    });
  }
  
  console.log('Deployment complete!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

**3. Run Deployment**
```bash
# Test deployment (local)
npx hardhat run scripts/deploy.ts --network localhost

# Testnet deployment
npx hardhat run scripts/deploy.ts --network quai-testnet

# Mainnet deployment
npx hardhat run scripts/deploy.ts --network quai-mainnet
```

### Frontend Deployment

**1. Build Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'quais': ['quais'],
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
});
```

**2. Environment Configuration**
```env
# .env.production
VITE_QUAI_RPC_URL=https://rpc.quai.network
VITE_CHAIN_ID=1
VITE_FACTORY_ADDRESS=0x...
VITE_IMPLEMENTATION_ADDRESS=0x...
VITE_BACKEND_API_URL=https://api.yourdomain.com
VITE_WEBSOCKET_URL=wss://ws.yourdomain.com
```

**3. Build and Deploy**
```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to hosting (examples)

# Vercel
vercel --prod

# Netlify
netlify deploy --prod

# IPFS (decentralized)
ipfs add -r dist/

# Traditional hosting (AWS S3, etc.)
aws s3 sync dist/ s3://your-bucket-name --delete
```

### Backend Deployment (Optional)

**1. Docker Build**
```bash
# Build image
docker build -t quai-multisig-backend .

# Run locally
docker-compose up -d

# Push to registry
docker tag quai-multisig-backend your-registry/quai-multisig-backend
docker push your-registry/quai-multisig-backend
```

**2. Cloud Deployment (Example: AWS)**
```bash
# Deploy to ECS/Fargate
aws ecs create-cluster --cluster-name quai-multisig
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster quai-multisig --service-name indexer ...

# Or deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

**3. Database Setup**
```bash
# Initialize database
psql -h your-db-host -U your-db-user -d multisig -f init.sql

# Run migrations
npm run migrate

# Create database backup
pg_dump -h your-db-host -U your-db-user multisig > backup.sql
```

---

## Configuration Files

### Hardhat Config
```typescript
// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    'quai-testnet': {
      url: process.env.QUAI_TESTNET_RPC_URL || '',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 12000,
    },
    'quai-mainnet': {
      url: process.env.QUAI_MAINNET_RPC_URL || '',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 9000,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};

export default config;
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "compile": "hardhat compile",
    "test:contracts": "hardhat test",
    "deploy:local": "hardhat run scripts/deploy.ts --network localhost",
    "deploy:testnet": "hardhat run scripts/deploy.ts --network quai-testnet",
    "deploy:mainnet": "hardhat run scripts/deploy.ts --network quai-mainnet",
    "backend:dev": "cd backend && npm run dev",
    "backend:build": "cd backend && npm run build",
    "backend:start": "cd backend && npm start"
  }
}
```

---

## Resources & References

### Official Documentation
- [Quai Network Docs](https://docs.quai.network)
- [Quais.js Documentation](https://docs.quai.network/develop/apis/quaisjs)
- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

### Similar Projects
- [Gnosis Safe](https://github.com/safe-global/safe-contracts) - Reference implementation
- [Ambire Wallet](https://github.com/AmbireTech/wallet) - Account abstraction wallet
- [Argent Contracts](https://github.com/argentlabs/argent-contracts) - Smart wallet implementation

### Security Resources
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Solidity Security Considerations](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [Trail of Bits Security Guidelines](https://github.com/crytic/building-secure-contracts)

### Development Tools
- [Hardhat](https://hardhat.org) - Development environment
- [Foundry](https://github.com/foundry-rs/foundry) - Testing framework
- [Slither](https://github.com/crytic/slither) - Static analysis
- [Mythril](https://github.com/ConsenSys/mythril) - Security analysis

---

## Getting Started Checklist

### Initial Setup
- [ ] Clone/create repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up development environment
- [ ] Configure environment variables
- [ ] Set up Quai node access or RPC endpoint
- [ ] Initialize Hardhat project
- [ ] Set up frontend with Vite + React + TypeScript

### Smart Contract Development
- [ ] Implement MultisigWallet core contract
- [ ] Implement MultisigWalletProxy
- [ ] Implement ProxyFactory
- [ ] Write comprehensive tests
- [ ] Test on local network
- [ ] Deploy to testnet
- [ ] Audit contracts

### Frontend Development
- [ ] Set up project structure
- [ ] Integrate Quais.js
- [ ] Implement wallet connection
- [ ] Build wallet creation flow
- [ ] Build transaction management UI
- [ ] Implement approval workflow
- [ ] Add owner management
- [ ] Test on testnet

### Backend Development (Optional)
- [ ] Set up Node.js + TypeScript project
- [ ] Implement event indexer
- [ ] Create REST API
- [ ] Implement WebSocket service
- [ ] Set up database
- [ ] Create Docker configuration
- [ ] Write documentation for self-hosting

### Testing & Quality
- [ ] Unit tests for contracts (>90% coverage)
- [ ] Integration tests
- [ ] E2E tests for critical flows
- [ ] Security testing
- [ ] Performance testing
- [ ] Accessibility testing

### Documentation
- [ ] User guide
- [ ] Developer documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] Self-hosting guide
- [ ] Video tutorials

### Launch Preparation
- [ ] Security audit
- [ ] Bug bounty program
- [ ] Community testing
- [ ] Legal review
- [ ] Marketing materials
- [ ] Support infrastructure

---

## Next Steps

1. **Set up development environment**
   - Install Quai node or get RPC access
   - Initialize project with Hardhat
   - Set up React frontend

2. **Start with smart contracts**
   - Implement MultisigWallet core
   - Write tests as you go
   - Deploy to local network

3. **Build frontend prototype**
   - Basic wallet connection
   - Simple transaction flow
   - Test with local contracts

4. **Iterate and expand**
   - Add features incrementally
   - Test thoroughly at each stage
   - Gather feedback from community

5. **Prepare for production**
   - Security audit
   - Performance optimization
   - Documentation
   - Launch!

---

## Support & Community

### Getting Help
- Quai Network Discord
- Quai Network Telegram
- GitHub Issues
- Stack Overflow (tag: quai-network)

### Contributing
Contributions are welcome! Please follow the contribution guidelines and submit PRs for review.

### License
MIT License - See LICENSE file for details

---

*This specification is a living document and will be updated as the project evolves.*