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
- React Query for data fetching
- Zustand for state management

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
VITE_MULTISIG_IMPLEMENTATION=0x00027C852a007C1AF78F40F2051dbf10853Da25B
VITE_PROXY_FACTORY=0x000C7C1fa37E5590404c257310dbBEBB64D993a9
VITE_SOCIAL_RECOVERY_MODULE=0x00399eb06E476f63c8B573002c273c4958Cc5A6a
VITE_DAILY_LIMIT_MODULE=0x007572B0b565DE076E345D6bCbCD0da3C5d37A22
VITE_WHITELIST_MODULE=0x0059BE8D03E6C66Fc95eF0f2CD0128D81BB5bA53
VITE_RPC_URL=https://rpc.quai.network
```

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
├── frontend/                 # (Coming soon)
└── backend/                  # (Optional)
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Compile contracts
4. ✅ Run tests
5. ✅ Deploy to testnet
6. 🚧 Set up frontend
7. 🚧 Create your first multisig wallet
8. 🚧 Test transaction flows

## Resources

- [Quai Network Documentation](https://docs.qu.ai)
- [Quais.js SDK Docs](https://docs.qu.ai/develop/apis/quaisjs)
- [Hardhat Example Repository](https://github.com/dominant-strategies/hardhat-example)
- [Project Specification](./quai-multisig.md)

## Support

For issues or questions:
- Check [PROGRESS.md](./PROGRESS.md) for current status
- Review [quai-multisig.md](./quai-multisig.md) for architecture details
- Consult Quai Network Discord/Telegram communities

## License

MIT License - See [LICENSE](./LICENSE) file for details
