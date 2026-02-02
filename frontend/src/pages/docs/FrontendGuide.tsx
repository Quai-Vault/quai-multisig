import { Link } from 'react-router-dom';

export function FrontendGuide() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/docs"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-300 mb-4 inline-flex items-center gap-2 transition-colors font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documentation
        </Link>
        <h1 className="text-2xl font-display font-bold text-gradient-red vault-text-glow mb-3">
          Frontend Guide
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Complete guide to using the Quai Vault web interface effectively.
        </p>
      </div>

      {/* Navigation */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Interface Overview</h2>
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Top Navigation Bar</h3>
            <p className="leading-relaxed mb-2">
              The top bar contains:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong className="text-dark-700 dark:text-dark-200">Home:</strong> Returns to the homepage</li>
              <li><strong className="text-dark-700 dark:text-dark-200">About:</strong> Project information and overview</li>
              <li><strong className="text-dark-700 dark:text-dark-200">GitHub:</strong> Link to source code repository</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Sidebar</h3>
            <p className="leading-relaxed mb-2">
              The sidebar provides:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong className="text-dark-700 dark:text-dark-200">Wallet Connection:</strong> Connect/disconnect your wallet at the top</li>
              <li><strong className="text-dark-700 dark:text-dark-200">Create Button:</strong> Quick access to create new vaults</li>
              <li><strong className="text-dark-700 dark:text-dark-200">Vault List:</strong> All your multisig vaults appear here</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Main Content Area</h3>
            <p className="leading-relaxed">
              The main area displays the current page content - vault details, transaction history, 
              or the dashboard depending on your navigation.
            </p>
          </div>
        </div>
      </div>

      {/* Vault Management */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Vault Management</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Viewing Vault Details</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Click on any vault in the sidebar to view its details. The vault detail page shows:
            </p>
            <ul className="space-y-1 ml-4 list-disc text-base text-dark-600 dark:text-dark-300">
              <li>Current balance in QUAI</li>
              <li>List of owners and their addresses</li>
              <li>Current threshold setting</li>
              <li>Pending transactions requiring approval</li>
              <li>Enabled modules</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Quick Actions</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              From the vault detail page, you can:
            </p>
            <ul className="space-y-1 ml-4 list-disc text-base text-dark-600 dark:text-dark-300">
              <li>Propose new transactions</li>
              <li>View transaction history</li>
              <li>Manage modules</li>
              <li>Configure module settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction Workflow */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Transaction Workflow</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">1. Proposing a Transaction</h3>
            <div className="space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Click "New Transaction" from the vault detail page or sidebar. Fill in:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li><strong className="text-dark-700 dark:text-dark-200">To:</strong> Destination address</li>
                <li><strong className="text-dark-700 dark:text-dark-200">Value:</strong> QUAI amount (optional for contract calls)</li>
                <li><strong className="text-dark-700 dark:text-dark-200">Data:</strong> Contract call data (optional, leave empty for transfers)</li>
              </ul>
              <p className="mt-2">
                Click "Propose Transaction" and approve the transaction in your wallet. The proposal will 
                appear in the pending transactions list.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">2. Approving Transactions</h3>
            <div className="space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                View pending transactions on the vault detail page. For each transaction, you'll see:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Transaction details (decoded when possible)</li>
                <li>Current approval count vs. required threshold</li>
                <li>List of owners who have approved</li>
                <li>Your approval status</li>
              </ul>
              <p className="mt-2">
                Click "Approve" to add your approval. You can only approve once per transaction.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">3. Executing Transactions</h3>
            <div className="space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Once a transaction has received the required number of approvals, an "Execute" button 
                appears. Any owner can execute the transaction.
              </p>
              <p>
                Click "Execute" and approve the transaction in your wallet. The transaction will be 
                executed on-chain and the vault state will update.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">4. Cancelling Transactions</h3>
            <div className="space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Transactions can be cancelled by:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>The proposer (at any time)</li>
                <li>Any owner (if threshold approvals have been reached)</li>
              </ul>
              <p className="mt-2">
                Click "Cancel" on a pending transaction to cancel it. Cancelled transactions cannot be executed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Module Management */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Module Management</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Enabling Modules</h3>
            <p className="leading-relaxed mb-2">
              From the vault detail page, click "Manage Modules". You'll see a list of available modules:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Social Recovery Module</li>
              <li>Daily Limit Module</li>
              <li>Whitelist Module</li>
            </ul>
            <p className="mt-2">
              Click "Enable" next to a module and approve the transaction. Once enabled, configure the 
              module settings.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Configuring Modules</h3>
            <p className="leading-relaxed mb-2">
              Enabled modules show a "Configure" button. Click it to open the configuration modal:
            </p>
            <ul className="space-y-1 ml-4 list-disc">
              <li><strong className="text-dark-700 dark:text-dark-200">Social Recovery:</strong> Set guardians, threshold, and recovery period</li>
              <li><strong className="text-dark-700 dark:text-dark-200">Daily Limit:</strong> Set daily spending limit</li>
              <li><strong className="text-dark-700 dark:text-dark-200">Whitelist:</strong> Add or remove whitelisted addresses</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Disabling Modules</h3>
            <p className="leading-relaxed">
              Click "Disable" next to an enabled module to remove it. This requires a multisig transaction. 
              Module configurations are preserved and will be restored if you re-enable the module.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Transaction History</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            View complete transaction history from the vault detail page. The history shows:
          </p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>All proposed transactions</li>
            <li>Approval status and counts</li>
            <li>Execution status</li>
            <li>Transaction hashes for on-chain verification</li>
          </ul>
          <p className="mt-2">
            Use the transaction lookup feature to find specific transactions by hash or view detailed 
            information about any transaction.
          </p>
        </div>
      </div>

      {/* Tips & Tricks */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Tips & Tricks</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Transaction Decoding</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              The frontend automatically decodes common contract calls (ERC20 transfers, approvals, etc.) 
              to make transactions human-readable. For custom contracts, raw data is displayed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Real-time Updates</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              When the indexer is available, real-time Supabase subscriptions provide instant updates.
              Transaction statuses, approval counts, and balances update automatically. If the indexer
              is unavailable, the interface falls back to polling every 10-30 seconds.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Notifications</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Important events trigger notifications (transaction proposals, approvals, executions). 
              These appear in the top-right corner and can be dismissed.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Gas Estimation</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              The frontend automatically estimates gas for transactions and adds buffers to prevent 
              out-of-gas errors. Gas limits are displayed before you approve transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="vault-panel p-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2 text-base text-dark-600 dark:text-dark-300">
          <div className="flex items-center justify-between p-2 bg-dark-100 dark:bg-vault-dark-4 rounded border border-dark-300 dark:border-dark-600">
            <span className="font-mono text-dark-700 dark:text-dark-200">Esc</span>
            <span className="text-dark-500 dark:text-dark-400">Close modals</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-dark-100 dark:bg-vault-dark-4 rounded border border-dark-300 dark:border-dark-600">
            <span className="font-mono text-dark-700 dark:text-dark-200">Click outside modal</span>
            <span className="text-dark-500 dark:text-dark-400">Close modals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
