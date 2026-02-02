import { Link } from 'react-router-dom';

export function DeveloperGuide() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/docs"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 mb-4 inline-flex items-center gap-2 transition-colors font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documentation
        </Link>
        <h1 className="text-2xl font-display font-bold text-gradient-red vault-text-glow mb-3">
          Developer Guide
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Technical documentation for developers integrating with Quai Vault smart contracts.
        </p>
      </div>

      {/* Architecture */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Architecture</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Proxy Pattern</h3>
            <p className="leading-relaxed mb-2">
              Quai Vault uses an upgradeable proxy pattern:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong className="text-dark-700 dark:text-dark-200">Implementation Contract:</strong> Contains the core logic (MultisigWallet.sol)</li>
              <li><strong className="text-dark-700 dark:text-dark-200">Proxy Contract:</strong> Each vault is a proxy pointing to the implementation</li>
              <li><strong className="text-dark-700 dark:text-dark-200">Factory Contract:</strong> Creates new proxy instances</li>
            </ul>
            <p className="mt-2">
              This pattern allows gas-efficient deployment and potential future upgrades while maintaining 
              each vault's independent state.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Module System</h3>
            <p className="leading-relaxed">
              Modules are separate contracts that extend vault functionality. They interact with the vault 
              through the <code className="bg-dark-100 dark:bg-vault-dark-4 px-1 py-0.5 rounded text-primary-600 dark:text-primary-300 font-mono text-sm">onlyModule</code> modifier. 
              Modules can be enabled/disabled dynamically without affecting the core vault.
            </p>
          </div>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Contract Addresses</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            Contract addresses are configured via environment variables. On Orchard Testnet:
          </p>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-4 border border-dark-300 dark:border-dark-600 font-mono text-sm">
            <div className="space-y-2 text-dark-600 dark:text-dark-300">
              <div><span className="text-dark-500">MULTISIG_IMPLEMENTATION:</span> <span className="text-primary-600 dark:text-primary-300">0x006179ef48CDBE621C9Fb7301615daBC070A95A7</span></div>
              <div><span className="text-dark-500">PROXY_FACTORY:</span> <span className="text-primary-600 dark:text-primary-300">0x0008962F68a05A3dF589E965289f887484e6Ee2e</span></div>
              <div><span className="text-dark-500">SOCIAL_RECOVERY_MODULE:</span> <span className="text-primary-600 dark:text-primary-300">0x002C543bf327860b212548DE25DBB5fD3dA56B41</span></div>
              <div><span className="text-dark-500">DAILY_LIMIT_MODULE:</span> <span className="text-primary-600 dark:text-primary-300">0x0016947f85495602D3F3D2cd3f78Cf1E5DD5C79F</span></div>
              <div><span className="text-dark-500">WHITELIST_MODULE:</span> <span className="text-primary-600 dark:text-primary-300">0x0036fE8BAad7eBb35c453386D7740C81796161dB</span></div>
            </div>
          </div>
          <p className="text-sm text-dark-500">
            Note: These addresses are for Orchard Testnet. Mainnet addresses will differ.
          </p>
        </div>
      </div>

      {/* Core Functions */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Core Functions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 font-mono">proposeTransaction(address to, uint256 value, bytes data)</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Proposes a new transaction. Returns the transaction hash. Only callable by owners.
            </p>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600 font-mono text-xs text-dark-500 dark:text-dark-400">
              Returns: bytes32 txHash
            </div>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 font-mono">approveTransaction(bytes32 txHash)</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Approves a pending transaction. Only callable by owners who haven't already approved.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 font-mono">executeTransaction(bytes32 txHash)</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Executes a transaction that has reached the threshold. Only callable by owners. 
              Performs the actual on-chain action.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 font-mono">cancelTransaction(bytes32 txHash)</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Cancels a pending transaction. Callable by proposer or any owner (if threshold met).
            </p>
          </div>
        </div>
      </div>

      {/* Integration Examples */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Integration Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Using ethers.js / quais</h3>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-4 border border-dark-300 dark:border-dark-600 font-mono text-xs text-dark-600 dark:text-dark-300 overflow-x-auto">
              <pre>{`import { Contract } from 'quais';
import MultisigWalletABI from './abis/MultisigWallet.json';

const walletAddress = '0x...'; // Your vault address
const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Contract(walletAddress, MultisigWalletABI, provider);

// Propose a transaction
const tx = await wallet.proposeTransaction(
  '0x...', // to
  ethers.parseEther('1.0'), // value
  '0x' // data
);

// Approve a transaction
await wallet.approveTransaction(txHash);

// Execute a transaction
await wallet.executeTransaction(txHash);`}</pre>
            </div>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Creating a Vault via Factory</h3>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-4 border border-dark-300 dark:border-dark-600 font-mono text-xs text-dark-600 dark:text-dark-300 overflow-x-auto">
              <pre>{`import ProxyFactoryABI from './abis/ProxyFactory.json';

const factory = new Contract(
  PROXY_FACTORY_ADDRESS,
  ProxyFactoryABI,
  signer
);

const owners = ['0x...', '0x...', '0x...'];
const threshold = 2;

const tx = await factory.createWallet(owners, threshold);
const receipt = await tx.wait();

// Extract vault address from events
const event = receipt.logs.find(
  log => factory.interface.parseLog(log)?.name === 'WalletCreated'
);
const vaultAddress = event.args.wallet;`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Events</h2>
        
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600">
            <p className="font-mono text-sm text-primary-600 dark:text-primary-300 mb-1">TransactionProposed(bytes32 indexed txHash, address indexed proposer, address indexed to, uint256 value, bytes data)</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">Emitted when a transaction is proposed</p>
          </div>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600">
            <p className="font-mono text-sm text-primary-600 dark:text-primary-300 mb-1">TransactionApproved(bytes32 indexed txHash, address indexed approver)</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">Emitted when an owner approves a transaction</p>
          </div>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600">
            <p className="font-mono text-sm text-primary-600 dark:text-primary-300 mb-1">TransactionExecuted(bytes32 indexed txHash, address indexed executor)</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">Emitted when a transaction is executed</p>
          </div>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600">
            <p className="font-mono text-sm text-primary-600 dark:text-primary-300 mb-1">TransactionCancelled(bytes32 indexed txHash, address indexed canceller)</p>
            <p className="text-xs text-dark-500 dark:text-dark-400">Emitted when a transaction is cancelled</p>
          </div>
        </div>
      </div>

      {/* Gas Considerations */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Gas Considerations</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            Gas costs for common operations (approximate):
          </p>
          <ul className="space-y-2 ml-4 list-disc">
            <li><strong className="text-dark-700 dark:text-dark-200">Propose Transaction:</strong> ~50,000 - 100,000 gas</li>
            <li><strong className="text-dark-700 dark:text-dark-200">Approve Transaction:</strong> ~45,000 - 80,000 gas</li>
            <li><strong className="text-dark-700 dark:text-dark-200">Execute Transaction:</strong> Variable (depends on target contract)</li>
            <li><strong className="text-dark-700 dark:text-dark-200">Cancel Transaction:</strong> ~30,000 - 50,000 gas</li>
          </ul>
          <p className="mt-2">
            The frontend automatically estimates gas and adds buffers. For programmatic integrations, 
            always estimate gas before sending transactions.
          </p>
        </div>
      </div>

      {/* Error Handling */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Error Handling</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            Common revert reasons:
          </p>
          <ul className="space-y-2 ml-4 list-disc">
            <li><code className="bg-dark-100 dark:bg-vault-dark-4 px-1 py-0.5 rounded text-primary-600 dark:text-primary-300 font-mono text-sm">"Not an owner"</code> - Caller is not a vault owner</li>
            <li><code className="bg-dark-100 dark:bg-vault-dark-4 px-1 py-0.5 rounded text-primary-600 dark:text-primary-300 font-mono text-sm">"Transaction already exists"</code> - Transaction hash already proposed</li>
            <li><code className="bg-dark-100 dark:bg-vault-dark-4 px-1 py-0.5 rounded text-primary-600 dark:text-primary-300 font-mono text-sm">"Already approved"</code> - Owner already approved this transaction</li>
            <li><code className="bg-dark-100 dark:bg-vault-dark-4 px-1 py-0.5 rounded text-primary-600 dark:text-primary-300 font-mono text-sm">"Not enough approvals"</code> - Threshold not met</li>
            <li><code className="bg-dark-100 dark:bg-vault-dark-4 px-1 py-0.5 rounded text-primary-600 dark:text-primary-300 font-mono text-sm">"Transaction already executed"</code> - Transaction was already executed</li>
          </ul>
        </div>
      </div>

      {/* Testing */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Testing</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            For testing your integration:
          </p>
          <ul className="space-y-2 ml-4 list-disc">
            <li>Use Orchard Testnet for development</li>
            <li>Deploy test vaults using the factory</li>
            <li>Test all transaction states (pending, approved, executed, cancelled)</li>
            <li>Test module interactions</li>
            <li>Verify event emissions</li>
          </ul>
        </div>
      </div>

      {/* Resources */}
      <div className="vault-panel p-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Resources</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <div>
            <a href="https://github.com/mpoletiek/quai-multisig" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline">
              Source Code Repository
            </a>
            <p className="text-sm text-dark-500 mt-1">
              View contract source code, tests, and deployment scripts
            </p>
          </div>
          <div>
            <Link to="/docs/security" className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline">
              Security Documentation
            </Link>
            <p className="text-sm text-dark-500 mt-1">
              Security considerations and audit information
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
