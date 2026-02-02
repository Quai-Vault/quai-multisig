import { Link } from 'react-router-dom';

export function GettingStarted() {
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
          Getting Started
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Learn how to create your first multisig vault and start managing your Quai Network assets securely.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Prerequisites
        </h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <div className="flex items-start gap-3">
            <span className="text-primary-600 dark:text-primary-400 font-bold">1.</span>
            <div>
              <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Quai Network Wallet</p>
              <p className="text-dark-500 dark:text-dark-400">
                You need a Quai Network-compatible wallet like <strong>Pelagus</strong> or another Web3 wallet 
                that supports Quai Network. Make sure you're connected to the <strong>Orchard Testnet</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-600 dark:text-primary-400 font-bold">2.</span>
            <div>
              <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Testnet QUAI</p>
              <p className="text-dark-500 dark:text-dark-400">
                You'll need testnet QUAI tokens to pay for gas fees. These can be obtained from 
                Quai Network testnet faucets.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary-600 dark:text-primary-400 font-bold">3.</span>
            <div>
              <p className="font-semibold text-dark-700 dark:text-dark-200 mb-1">Owner Addresses</p>
              <p className="text-dark-500 dark:text-dark-400">
                Decide on the addresses that will be owners of your multisig vault. You'll need at least 
                2 owners, and you should decide on the approval threshold (e.g., 2 of 3, 3 of 5).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Step-by-Step Guide
        </h2>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-primary-600 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                1
              </span>
              <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200">Connect Your Wallet</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Click the <strong className="text-dark-700 dark:text-dark-200">"Connect Wallet"</strong> button in the sidebar. 
                This will prompt your wallet to connect to the Quai Vault application.
              </p>
              <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600 mt-3">
                <p className="text-sm text-dark-500 font-mono mb-1">Note:</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Make sure you're connected to the Orchard Testnet. The application will display a warning 
                  banner if you're on the wrong network.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-primary-600 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                2
              </span>
              <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200">Navigate to Create Vault</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Click the <strong className="text-dark-700 dark:text-dark-200">"Create"</strong> button in the sidebar, or navigate 
                to the <Link to="/create" className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline">Create Vault</Link> page.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-primary-600 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                3
              </span>
              <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200">Configure Your Vault</h3>
            </div>
            <div className="ml-11 space-y-3 text-base text-dark-600 dark:text-dark-300">
              <p>Fill in the vault configuration:</p>
              <ul className="space-y-2 ml-4 list-disc">
                <li>
                  <strong className="text-dark-700 dark:text-dark-200">Owners:</strong> Add the addresses that will be owners. 
                  You can add multiple owners by clicking "Add Owner". Each owner address must be a valid Quai Network address.
                </li>
                <li>
                  <strong className="text-dark-700 dark:text-dark-200">Threshold:</strong> Set how many owner approvals are required 
                  to execute transactions. This must be between 1 and the number of owners.
                </li>
              </ul>
              <div className="bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-blue-900/90 border-l-4 border-blue-600 rounded-md p-4 mt-3">
                <p className="text-sm text-blue-200/90">
                  <strong>Example:</strong> For a 2-of-3 multisig, add 3 owner addresses and set the threshold to 2. 
                  This means any 2 of the 3 owners must approve a transaction before it can be executed.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-primary-600 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                4
              </span>
              <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200">Deploy Your Vault</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Click <strong className="text-dark-700 dark:text-dark-200">"Create Vault"</strong> and approve two transactions in your wallet:
              </p>
              <ol className="space-y-2 ml-4 list-decimal">
                <li>
                  <strong className="text-dark-700 dark:text-dark-200">Implementation Deployment:</strong> Deploys the MultisigWallet implementation contract
                </li>
                <li>
                  <strong className="text-dark-700 dark:text-dark-200">Proxy Initialization:</strong> Creates your vault proxy and initializes it with your owners and threshold
                </li>
              </ol>
              <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600 mt-3">
                <p className="text-sm text-dark-500 font-mono mb-1">Gas Fees:</p>
                <p className="text-sm text-dark-500 dark:text-dark-400">
                  Both transactions require gas fees. Make sure you have sufficient testnet QUAI in your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-primary-600 pl-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                5
              </span>
              <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200">Start Using Your Vault</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Once deployed, your vault will appear in the sidebar. You can now:
              </p>
              <ul className="space-y-2 ml-4 list-disc">
                <li>View vault details and balance</li>
                <li>Propose transactions (transfers, contract calls, etc.)</li>
                <li>Approve or reject pending proposals</li>
                <li>Execute approved transactions</li>
                <li>Enable modules (Social Recovery, Daily Limits, Whitelist)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Next Steps</h2>
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <p>
            Now that you've created your first vault, explore these resources:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/docs/multisig-wallets"
              className="vault-panel p-4 hover:border-primary-600/50 transition-all group"
            >
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
                Understanding Multisig Wallets
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Learn how proposals, approvals, and execution work in detail.
              </p>
            </Link>
            <Link
              to="/docs/modules"
              className="vault-panel p-4 hover:border-primary-600/50 transition-all group"
            >
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
                Explore Modules
              </h3>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Extend your vault with Social Recovery, Daily Limits, and Whitelist modules.
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="vault-panel p-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Common Issues</h2>
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <p className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Transaction Fails</p>
            <p className="text-dark-500 dark:text-dark-400">
              If deployment transactions fail, check that you have sufficient gas, are on the correct network 
              (Orchard Testnet), and that all owner addresses are valid.
            </p>
          </div>
          <div>
            <p className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Vault Not Appearing</p>
            <p className="text-dark-500 dark:text-dark-400">
              After deployment, refresh the page or wait a few seconds. The vault should appear in the sidebar 
              automatically. If it doesn't, check the transaction hash to verify deployment succeeded.
            </p>
          </div>
          <div>
            <p className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Need More Help?</p>
            <p className="text-dark-500 dark:text-dark-400">
              Check the <Link to="/docs/faq" className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline">FAQ</Link> section 
              or open an issue on <a href="https://github.com/mpoletiek/quai-multisig" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline">GitHub</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
