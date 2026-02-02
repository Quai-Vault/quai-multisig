# Quai Vault Frontend

React frontend for the Quai Network multisig wallet solution.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Quais.js** for Quai Network interaction
- **TailwindCSS** with custom vault theme
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Supabase** for indexer integration and real-time subscriptions
- **Zod** for runtime type validation
- **Vitest** for unit testing

## Features

- Wallet connection (Pelagus)
- Multisig wallet creation and management
- Transaction proposal, approval, and execution
- Owner management (add/remove owners, change threshold)
- Module management (Social Recovery, Daily Limits, Whitelist)
- Transaction history with decoding
- Real-time updates via Supabase subscriptions (with polling fallback)
- Indexer integration for fast queries
- Comprehensive notification system

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Pelagus wallet browser extension

### Installation

```bash
npm install
```

### Environment Configuration

Copy the environment template and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Contract addresses
VITE_MULTISIG_IMPLEMENTATION=0x...
VITE_PROXY_FACTORY=0x...
VITE_SOCIAL_RECOVERY_MODULE=0x...
VITE_DAILY_LIMIT_MODULE=0x...
VITE_WHITELIST_MODULE=0x...

# Network configuration
VITE_RPC_URL=https://rpc.orchard.quai.network
VITE_CHAIN_ID=9000

# Indexer configuration (optional - enables real-time updates)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_NETWORK_SCHEMA=testnet
VITE_INDEXER_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

Production build outputs to `dist/`

### Testing

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── modules/        # Module-specific components
│   └── ...
├── pages/              # Page components
├── services/           # Blockchain interaction services
│   ├── core/           # Core services (Wallet, Transaction, Owner)
│   ├── modules/        # Module services (DailyLimit, Whitelist, SocialRecovery)
│   ├── indexer/        # Indexer services (queries, subscriptions, health)
│   └── utils/          # Utility functions
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── config/             # Configuration and ABIs
└── test/               # Test setup and utilities
```

## Key Services

### Core Services
- **MultisigService** - Facade for all wallet operations (uses indexer when available, falls back to blockchain)
- **WalletService** - Wallet deployment and info
- **TransactionService** - Transaction proposal/approval/execution
- **OwnerService** - Owner management operations

### Module Services
- **DailyLimitModuleService** - Daily spending limits
- **WhitelistModuleService** - Address whitelisting
- **SocialRecoveryModuleService** - Guardian-based recovery

### Indexer Services
- **IndexerService** - Main indexer facade
- **IndexerWalletService** - Wallet queries from indexer
- **IndexerTransactionService** - Transaction queries with batch confirmations
- **IndexerSubscriptionService** - Real-time Supabase subscriptions with reconnection handling
- **IndexerHealthService** - Indexer health checks and sync status

## Module Configuration (H-2 Security)

Module configuration now requires **multisig approval**. The frontend uses `propose*` methods that create multisig proposals:

| Action | Method | Workflow |
|--------|--------|----------|
| Set daily limit | `proposeSetDailyLimit()` | Creates proposal → Requires approval → Executed |
| Add to whitelist | `proposeAddToWhitelist()` | Creates proposal → Requires approval → Executed |
| Setup recovery | `proposeSetupRecovery()` | Creates proposal → Requires approval → Executed |

The UI components display "Multisig Approval Required" banners and use "Propose" button text to indicate the proposal-based workflow.

**Deprecated methods** (throw errors if called):
- `setDailyLimit()` → Use `proposeSetDailyLimit()`
- `addToWhitelist()` → Use `proposeAddToWhitelist()`
- `setupRecovery()` → Use `proposeSetupRecovery()`

## Testing

The frontend has 315 passing tests covering:

- Service layer (all blockchain interactions)
- Utility functions (gas estimation, error handling)
- Core business logic

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## License

MIT License
