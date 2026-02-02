# Quai Network Multisig Wallet

A Gnosis Safe-inspired multisig wallet solution for Quai Network's account-based (EVM) layer.

## Project Structure

```
quai-multisig/
├── contracts/          # Smart contracts (Hardhat)
├── frontend/          # React frontend application
├── backend/           # Optional backend services (indexer, WebSocket)
└── docs/             # Additional documentation
```

## Key Features

- **Decentralized-First**: All core functionality works directly via RPC without backend dependencies
- **Upgradeable**: Proxy pattern for future multi-shard support
- **Modular**: Extensible module system for additional features
- **Secure**: Built with security best practices and comprehensive testing (123 contract tests + 315 frontend tests)
- **Real-Time Updates**: Supabase subscriptions with polling fallback for wallet state, balances, and transactions
- **Hybrid Data Fetching**: Indexer for fast reads, blockchain for writes, automatic fallback
- **Transaction Management**: Propose, approve, execute, cancel, and revoke approvals
- **Owner Management**: Add/remove owners and change approval thresholds via multisig
- **Transaction History**: View executed and cancelled transactions with detailed decoding
- **Transaction Lookup**: Find and interact with transactions beyond the 7-hour query window
- **Modern UI**: Dark vault theme with responsive design and comprehensive notifications

## Security

See [SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md) for the full security review.

### Security Status

| Severity | Issues | Status |
|----------|--------|--------|
| Critical | 0 | - |
| High | 2 | **All Fixed** |
| Medium | 5 | **All Fixed** |
| Low | 6 | Open (acceptable risk) |

### Module Security (H-2 Fix)

All module configuration operations now require **multisig approval**:

- **DailyLimitModule**: `setDailyLimit()`, `resetDailyLimit()` require multisig
- **WhitelistModule**: `addToWhitelist()`, `removeFromWhitelist()` require multisig
- **SocialRecoveryModule**: `setupRecovery()` requires multisig

Execution functions (`executeBelowLimit()`, `executeToWhitelist()`) remain callable by single owners as intended - these operate within pre-approved limits.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to Quai Network RPC endpoint

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start frontend development server
npm run frontend:dev

# Compile smart contracts
npm run contracts:compile

# Run contract tests
npm run contracts:test

# Start backend services (optional)
npm run backend:dev
```

## Documentation

- **[Architecture Documentation](ARCHITECTURE.md)** - Comprehensive system architecture with detailed diagrams
- **[Architecture Quick Reference](ARCHITECTURE_QUICK_REFERENCE.md)** - Visual guide and cheat sheet
- **[Security Analysis](SECURITY_ANALYSIS.md)** - Security audit findings and fixes
- **[Script Consolidation Report](SCRIPT_CONSOLIDATION.md)** - Utility scripts organization
- **[JSDoc Template Guide](frontend/JSDOC_TEMPLATE.md)** - Code documentation standards
- **[Project Details](quai-multisig.md)** - Additional project documentation

## Architecture

### High-Level Overview

- **Smart Contracts**: Upgradeable multisig wallet using EIP-1967 proxy pattern
  - MultisigWallet implementation (shared by all proxies)
  - ProxyFactory for deterministic wallet deployment
  - Modular extension system (DailyLimit, Whitelist, SocialRecovery)
- **Frontend**: React 18 + TypeScript + Vite
  - Service layer with facade pattern (MultisigService + IndexerService)
  - Zustand for client state, React Query for server state
  - quais.js for blockchain interaction
  - Supabase for indexer integration and real-time subscriptions
  - Zod for runtime type validation
- **Indexer** (Optional): Supabase-based event indexer for fast queries and real-time updates

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for detailed diagrams and explanations.

## Development Roadmap

- [x] Phase 0: Project setup and architecture
- [x] Phase 1: MVP - Core multisig functionality
- [x] Phase 2: Enhanced features (owner management, transaction history, real-time updates)
- [x] Phase 3: Polish and optimization (UI overhaul, notifications, transaction cancellation)
- [ ] Phase 4: Multi-shard support
- [x] Phase 5: Module management UI (Social Recovery, Daily Limits, Whitelist)
- [x] Phase 6: Security audit fixes (H-1, H-2, M-1 through M-5)

## Contributing

Contributions are welcome! Please read the contribution guidelines before submitting PRs.

## License

MIT License - See LICENSE file for details
