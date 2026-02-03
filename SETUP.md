# Quai Multisig - Setup Guide

This guide will help you set up and deploy the Quai Network multisig wallet solution.

## Prerequisites

- **Node.js** 18+ (LTS version recommended)
- **npm** or **yarn**
- Quai Network RPC access (https://rpc.quai.network)
- Private keys for deployment (different key per zone)

## Installation

### 1. Clone and Install

```bash
# Navigate to project root
cd quai-multisig

# Install root dependencies
npm install

# Install contract dependencies
cd contracts
npm install
cd ..
```

### 2. Configure Environment Variables

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:

```env
# Network Configuration
RPC_URL=https://rpc.quai.network
CHAIN_ID=9000

# Private Keys - IMPORTANT: Use DIFFERENT keys for each zone!
# Cyprus region (currently available on testnet)
CYPRUS1_PK=0xYOUR_PRIVATE_KEY_HERE
CYPRUS2_PK=0xYOUR_PRIVATE_KEY_HERE
CYPRUS3_PK=0xYOUR_PRIVATE_KEY_HERE

# Paxos region
PAXOS1_PK=0xYOUR_PRIVATE_KEY_HERE
PAXOS2_PK=0xYOUR_PRIVATE_KEY_HERE
PAXOS3_PK=0xYOUR_PRIVATE_KEY_HERE

# Hydra region
HYDRA1_PK=0xYOUR_PRIVATE_KEY_HERE
HYDRA2_PK=0xYOUR_PRIVATE_KEY_HERE
HYDRA3_PK=0xYOUR_PRIVATE_KEY_HERE
```

**⚠️ Security Warning:**
- NEVER commit `.env` to version control
- Use different private keys for each zone
- Keep your private keys secure
- Consider using hardware wallets for mainnet deployments

## Smart Contract Deployment

### Step 1: Compile Contracts

```bash
cd contracts
npm run compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### Step 2: Run Tests (Optional but Recommended)

```bash
npm test
```

### Step 3: Deploy to Quai Network

Deploy to Cyprus1 (testnet):

```bash
npm run deploy:cyprus1
```

Or deploy to a specific zone:

```bash
npx hardhat run scripts/deploy.ts --network cyprus2
npx hardhat run scripts/deploy.ts --network paxos1
```

### Step 4: Save Contract Addresses

After deployment, you'll see output like:

```
✅ Deployment complete!

Contract Addresses:
-------------------
MultisigWallet Implementation: 0x1234...
ProxyFactory: 0x5678...
SocialRecoveryModule: 0xabcd...
DailyLimitModule: 0xef01...
WhitelistModule: 0x2345...

📝 Add these to your .env file:
-------------------
MULTISIG_IMPLEMENTATION=0x1234...
PROXY_FACTORY=0x5678...
...
```

**Copy these addresses** to your `.env` file for frontend use.

## Frontend Setup

The frontend is built with:
- React 18+ with TypeScript
- Vite for build tooling
- Quais.js for Quai Network interaction
- TailwindCSS with custom vault theme
- React Query for server state / data fetching
- Zustand for client state management
- Supabase for indexer integration and real-time subscriptions
- Zod for runtime type validation

### Frontend Installation

```bash
cd frontend
npm install
```

### Configure Frontend Environment

Copy the frontend environment template:

```bash
cp .env.example .env
```

Edit `frontend/.env` and add contract addresses:

```env
# Contract Addresses (from deployment)
VITE_MULTISIG_IMPLEMENTATION=0x006179ef48CDBE621C9Fb7301615daBC070A95A7
VITE_PROXY_FACTORY=0x0008962F68a05A3dF589E965289f887484e6Ee2e
VITE_SOCIAL_RECOVERY_MODULE=0x002C543bf327860b212548DE25DBB5fD3dA56B41
VITE_DAILY_LIMIT_MODULE=0x0016947f85495602D3F3D2cd3f78Cf1E5DD5C79F
VITE_WHITELIST_MODULE=0x0036fE8BAad7eBb35c453386D7740C81796161dB

# Network Configuration
VITE_RPC_URL=https://rpc.orchard.quai.network
VITE_CHAIN_ID=9000

# Indexer Configuration (Optional - enables real-time updates)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_NETWORK_SCHEMA=testnet
VITE_INDEXER_URL=http://localhost:3001
```

**Note:** The indexer configuration is optional. Without it, the frontend falls back to blockchain polling for data updates.

### Run Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build Frontend for Production

```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

## Troubleshooting

### "Cannot find module 'quais'"

This is a TypeScript error before dependencies are installed. Run:

```bash
cd contracts
npm install
```

### "Insufficient funds for transaction"

Make sure your deployment account has enough QUAI:
- Check balance on Quai Network explorer
- Get testnet QUAI from faucet (for testnet deployments)

### "Network not found"

Verify your `.env` file has correct RPC URL and private keys are set.

### "Transaction failed"

Common causes:
- Gas estimation issues
- Contract size too large
- Invalid constructor parameters

Check the full error message and consult Quai Network documentation.

## Network Information

### Quai Network Zones

**Cyprus Region:**
- cyprus1, cyprus2, cyprus3

**Paxos Region:**
- paxos1, paxos2, paxos3

**Hydra Region:**
- hydra1, hydra2, hydra3

### Current Availability

As of now, the Golden Age testnet supports:
- ✅ Cyprus 1
- ✅ Cyprus 2
- 🚧 Other zones (coming soon)

Check [Quai Network docs](https://docs.qu.ai) for latest network status.

## Key Files

```
quai-multisig/
├── .env.example              # Environment template
├── contracts/
│   ├── contracts/            # Solidity contracts
│   ├── scripts/deploy.ts     # Deployment script
│   ├── test/                 # Contract tests
│   ├── hardhat.config.ts     # Hardhat configuration
│   └── package.json          # Contract dependencies
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # Blockchain & indexer services
│   │   │   ├── core/         # Core blockchain services
│   │   │   ├── modules/      # Module services
│   │   │   └── indexer/      # Supabase indexer services
│   │   └── hooks/            # React Query hooks
│   └── package.json          # Frontend dependencies
└── docs/                     # Documentation
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Compile contracts
4. ✅ Run tests
5. ✅ Deploy to testnet
6. ✅ Set up frontend
7. ✅ Create your first multisig wallet
8. ✅ Test transaction flows

## Resources

- [Quai Network Documentation](https://docs.qu.ai)
- [Quais.js SDK Docs](https://docs.qu.ai/develop/apis/quaisjs)
- [Hardhat Example Repository](https://github.com/dominant-strategies/hardhat-example)

## Support

For issues or questions:
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for architecture details
- Check [SECURITY_ANALYSIS.md](./SECURITY_ANALYSIS.md) for security information
- Consult Quai Network Discord/Telegram communities

## License

MIT License - See [LICENSE](./LICENSE) file for details
