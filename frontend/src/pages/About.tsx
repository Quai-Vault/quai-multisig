import { Link } from 'react-router-dom';
import { getBlockRangeTimePeriod } from '../utils/blockTime';

export function About() {
  const transactionHistoryLimit = getBlockRangeTimePeriod();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 mb-3 inline-flex items-center gap-4.5 transition-colors font-semibold"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-xl font-display font-bold text-gradient-red vault-text-glow mb-2">
          About Quai Vault
        </h1>
        <p className="text-base font-mono text-dark-500 uppercase tracking-wider">
          Decentralized Multisig Solution for Quai Network
        </p>
      </div>

      {/* High-Level Overview */}
      <div className="vault-panel p-4 mb-4">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          What is Quai Vault?
        </h2>
        <div className="space-y-2 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            <strong className="text-dark-700 dark:text-dark-200">Quai Vault</strong> is a decentralized multisignature (multisig) wallet solution built specifically for the Quai Network. 
            It enables secure, collaborative management of QUAI tokens and smart contract interactions through a multi-owner approval system.
          </p>
          <p>
            Unlike traditional single-signature wallets where one person has complete control, Quai Vault requires multiple authorized parties 
            (owners) to approve transactions before they can be executed. This provides enhanced security, shared control, and protection against 
            single points of failure.
          </p>
          <p>
            Think of it as a digital safe that requires multiple keys to open—no single person can move funds without the consent of others, 
            making it ideal for teams, organizations, or individuals who want extra security for their assets.
          </p>
        </div>
      </div>

      {/* Core Philosophy */}
      <div className="vault-panel p-4 mb-4 border-2 border-primary-600/30">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Core Philosophy: True Decentralization
        </h2>
        <div className="space-y-2 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            <strong className="text-primary-600 dark:text-primary-400">Quai Vault is built on a fundamental principle: complete decentralization.</strong> 
            Every interaction with your multisig wallet works directly through blockchain RPC calls—no third-party services, 
            no centralized backends, no intermediaries.
          </p>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 mt-3 border border-dark-300 dark:border-dark-600">
            <p className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-2 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              What This Means for You
            </p>
            <ul className="space-y-1.5 text-base text-dark-500 dark:text-dark-400 ml-5 list-disc">
              <li><strong className="text-dark-600 dark:text-dark-300">No Backend Required:</strong> All wallet operations work directly with the blockchain</li>
              <li><strong className="text-dark-600 dark:text-dark-300">No Third-Party Dependencies:</strong> Your interactions are between you and the smart contracts</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Self-Hostable:</strong> The entire frontend can run on IPFS or your own server</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Censorship Resistant:</strong> No single entity can block or control your wallet</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Privacy First:</strong> No data is sent to external services</li>
            </ul>
          </div>
          <p className="mt-3 text-base text-dark-500 dark:text-dark-400 italic">
            An optional Supabase-based indexer provides real-time subscriptions and faster queries,
            but is never required—the frontend automatically falls back to direct RPC calls if unavailable.
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="vault-panel p-4 mb-4">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          How It Works
        </h2>
        <div className="space-y-3">
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <div className="flex items-start gap-4 mb-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center text-base font-bold text-primary-600 dark:text-primary-400">1</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1">Create Your Vault</h3>
                <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
                  Deploy a new multisig wallet by specifying owners and an approval threshold (e.g., 2 of 3 owners must approve). 
                  The wallet is deployed as a smart contract on the Quai Network.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <div className="flex items-start gap-4 mb-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center text-base font-bold text-primary-600 dark:text-primary-400">2</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1">Propose Transactions</h3>
                <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
                  Any owner can propose a transaction (sending QUAI, calling contracts, etc.). The transaction is created but not executed yet.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <div className="flex items-start gap-4 mb-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center text-base font-bold text-primary-600 dark:text-primary-400">3</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1">Gather Approvals</h3>
                <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
                  Other owners review and approve the transaction. Once the threshold is met (e.g., 2 of 3 approvals), 
                  the transaction becomes ready to execute.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <div className="flex items-start gap-4 mb-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-600/30 flex items-center justify-center text-base font-bold text-primary-600 dark:text-primary-400">4</span>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1">Execute</h3>
                <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
                  Any owner can execute the transaction once it has enough approvals. The transaction is then executed on-chain 
                  and the funds or contract call is processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="vault-panel p-4 mb-4">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Multi-Owner Control
            </h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Configure multiple owners with customizable approval thresholds. No single point of failure.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Transaction Management
            </h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Propose, approve, execute, and cancel transactions. Full control over the transaction lifecycle.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Owner Management
            </h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Add or remove owners, change approval thresholds—all through multisig transactions for security.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Modular Architecture
            </h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Extensible module system for additional features like daily limits, whitelisting, and social recovery.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Upgradeable Design
            </h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Built with an upgradeable architecture, ready for future enhancements and multi-shard support.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.12V17a1 1 0 001 1z" />
              </svg>
              Real-Time Updates
            </h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Real-time subscriptions via Supabase keep your wallet state synchronized instantly. Falls back to polling if unavailable.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="vault-panel p-4 mb-4 border-2 border-primary-600/30">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Best Practices
        </h2>
        <div className="space-y-3">
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Transaction History
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              With the indexer connected, you have access to <strong className="text-primary-600 dark:text-primary-400">complete transaction history</strong> with
              no time limits. If the indexer is unavailable and the system falls back to blockchain queries,
              history is limited to the last ~{transactionHistoryLimit} due to network query constraints.
            </p>
            <ul className="space-y-1 text-base text-dark-500 dark:text-dark-400 ml-5 list-disc">
              <li><strong className="text-dark-600 dark:text-dark-300">Save Transaction Hashes:</strong> Keep records of important transaction hashes</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Use Transaction Lookup:</strong> Find any transaction by hash, regardless of age</li>
            </ul>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-4.5">
              <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Data Resilience
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              The application uses a <strong className="text-primary-600 dark:text-primary-400">hybrid data architecture</strong>: fast queries via the indexer,
              with automatic fallback to direct blockchain queries. Your wallet always works, even if the indexer is down.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="vault-panel p-4 mb-4">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Technical Architecture
        </h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <div>
            <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Smart Contract Layer</h3>
            <p className="text-base text-dark-500 dark:text-dark-400 mb-2">
              Quai Vault uses an upgradeable proxy pattern with three core components:
            </p>
            <ul className="space-y-1 text-base text-dark-500 dark:text-dark-400 ml-4 list-disc">
              <li><strong className="text-dark-600 dark:text-dark-300">MultisigWallet:</strong> Core implementation contract containing all logic</li>
              <li><strong className="text-dark-600 dark:text-dark-300">MultisigWalletProxy:</strong> Minimal proxy deployed per wallet instance</li>
              <li><strong className="text-dark-600 dark:text-dark-300">ProxyFactory:</strong> Factory contract for deploying new wallets</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Frontend Layer</h3>
            <p className="text-base text-dark-500 dark:text-dark-400 mb-2">
              Built with React and TypeScript, using a hybrid data fetching approach:
            </p>
            <ul className="space-y-1 text-base text-dark-500 dark:text-dark-400 ml-4 list-disc">
              <li><strong className="text-dark-600 dark:text-dark-300">Quais.js:</strong> Quai Network SDK for blockchain interactions</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Hybrid Data Fetching:</strong> Indexer for fast reads, blockchain for writes</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Real-Time Subscriptions:</strong> Supabase provides instant updates when available</li>
              <li><strong className="text-dark-600 dark:text-dark-300">Automatic Fallback:</strong> Falls back to RPC polling if indexer unavailable</li>
              <li><strong className="text-dark-600 dark:text-dark-300">No Backend Required:</strong> Core functionality works via direct RPC calls</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-dark-700 dark:text-dark-200 mb-1.5">Security Features</h3>
            <ul className="space-y-1 text-base text-dark-500 dark:text-dark-400 ml-4 list-disc">
              <li>ReentrancyGuard protection on all execution functions</li>
              <li>Checks-Effects-Interactions pattern throughout</li>
              <li>Owner-only and self-only modifiers for access control</li>
              <li>Threshold validation before execution</li>
              <li>Nonce system for replay protection</li>
              <li>Transaction cancellation support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="vault-panel p-4 mb-4">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Use Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5">Team Wallets</h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Organizations can manage funds with multiple authorized signers, ensuring no single person has unilateral control.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5">High-Value Storage</h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Extra security layer for significant amounts of QUAI, requiring multiple approvals before any movement.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5">DAO Treasuries</h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Decentralized autonomous organizations can manage their treasury with transparent, on-chain governance.
            </p>
          </div>

          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
            <h3 className="text-base font-semibold text-primary-600 dark:text-primary-400 mb-1.5">Escrow Services</h3>
            <p className="text-base text-dark-500 dark:text-dark-400 leading-relaxed">
              Multi-party escrow scenarios where funds require approval from multiple parties before release.
            </p>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="vault-panel p-4 mb-4 border-2 border-primary-600/30">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Getting Started
        </h2>
        <div className="space-y-2 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            Ready to create your first multisig vault? Here's what you need:
          </p>
          <ol className="space-y-2 ml-4 list-decimal">
            <li>
              <strong className="text-dark-700 dark:text-dark-200">Connect Your Wallet:</strong> Use Pelagus or another Quai Network-compatible wallet
            </li>
            <li>
              <strong className="text-dark-700 dark:text-dark-200">Create a Vault:</strong> Navigate to the create page and specify your owners and threshold
            </li>
            <li>
              <strong className="text-dark-700 dark:text-dark-200">Deploy:</strong> Sign two transactions to deploy your vault (implementation + initialization)
            </li>
            <li>
              <strong className="text-dark-700 dark:text-dark-200">Start Using:</strong> Begin proposing transactions and managing your multisig wallet
            </li>
          </ol>
          <div className="mt-3 flex gap-4">
            <Link
              to="/create"
              className="vault-button text-base px-5 py-2.5 inline-flex items-center gap-4.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Vault
            </Link>
            <Link
              to="/"
              className="vault-button-secondary text-base px-5 py-2.5 inline-flex items-center gap-4.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center py-4">
        <p className="text-base text-dark-600 font-mono">
          Built for Quai Network • Open Source • Decentralized by Design
        </p>
      </div>
    </div>
  );
}
