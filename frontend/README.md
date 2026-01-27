# Quai Vault Frontend

React frontend for the Quai Network multisig wallet solution.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Quais.js** for Quai Network interaction
- **TailwindCSS** with custom vault theme
- **React Query** for data fetching and caching
- **Zustand** for state management
- **Vitest** for unit testing

## Features

- Wallet connection (Pelagus)
- Multisig wallet creation and management
- Transaction proposal, approval, and execution
- Owner management (add/remove owners, change threshold)
- Module management (Social Recovery, Daily Limits, Whitelist)
- Transaction history with decoding
- Real-time updates with polling
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
VITE_MULTISIG_IMPLEMENTATION=0x...
VITE_PROXY_FACTORY=0x...
VITE_SOCIAL_RECOVERY_MODULE=0x...
VITE_DAILY_LIMIT_MODULE=0x...
VITE_WHITELIST_MODULE=0x...
VITE_RPC_URL=https://rpc.orchard.quai.network
VITE_CHAIN_ID=9000
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
│   └── utils/          # Utility functions
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── config/             # Configuration and ABIs
└── test/               # Test setup and utilities
```

## Key Services

- **MultisigService** - Facade for all wallet operations
- **WalletService** - Wallet deployment and info
- **TransactionService** - Transaction proposal/approval/execution
- **OwnerService** - Owner management operations
- **DailyLimitModuleService** - Daily spending limits
- **WhitelistModuleService** - Address whitelisting
- **SocialRecoveryModuleService** - Guardian-based recovery

## Testing

The frontend has 330+ passing tests covering:

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
