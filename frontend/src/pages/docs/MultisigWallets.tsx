import { Link } from 'react-router-dom';

export function MultisigWallets() {
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
          Multisig Wallets
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Understanding how multisig wallets work, from proposals to execution, and everything in between.
        </p>
      </div>

      {/* Overview */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">What is a Multisig Wallet?</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            A multisig (multi-signature) wallet is a smart contract that requires multiple approvals before 
            executing transactions. Unlike traditional single-signature wallets where one private key controls 
            everything, multisig wallets distribute control among multiple owners.
          </p>
          <p>
            Quai Vault multisig wallets use a threshold-based approval system: you configure a number of 
            owners and a threshold (e.g., 2 of 3, 3 of 5). Transactions require approval from at least the 
            threshold number of owners before they can be executed.
          </p>
        </div>
      </div>

      {/* Key Concepts */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Key Concepts</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Owners
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Owners are addresses that have the authority to propose, approve, and execute transactions. 
              Each owner has equal voting power. Owners can be added or removed through a multisig transaction 
              (requiring threshold approvals).
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Threshold
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              The threshold is the minimum number of owner approvals required to execute a transaction. 
              It must be between 1 and the total number of owners. For example, a 2-of-3 multisig requires 
              2 approvals out of 3 owners.
            </p>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600 mt-3">
              <p className="text-sm text-dark-500 font-mono mb-1">Security Note:</p>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Higher thresholds provide more security but reduce flexibility. Choose a threshold that 
                balances security with operational needs.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Proposals
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Any owner can propose a transaction. A proposal includes the destination address, value (QUAI amount), 
              and data (for contract calls). Once proposed, the transaction enters a pending state waiting for approvals.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approvals
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Owners can approve pending proposals. Each owner can only approve once per proposal. Once the 
              threshold number of approvals is reached, any owner can execute the transaction.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Execution
            </h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Once a proposal has received the required number of approvals, any owner can execute it. 
              Execution is a separate transaction that actually performs the proposed action (transfer, 
              contract call, etc.).
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Lifecycle */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Transaction Lifecycle</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-1">Proposal</h3>
              <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
                An owner proposes a transaction by specifying the destination, value, and optional calldata. 
                The proposal is stored on-chain and assigned a unique transaction hash.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-1">Approval Phase</h3>
              <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
                Owners review the proposal and approve it if they agree. The frontend tracks approval status 
                and shows how many approvals are needed. Owners can approve in any order.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-1">Threshold Met</h3>
              <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
                Once the threshold number of approvals is reached, the transaction becomes executable. 
                The frontend displays an "Execute" button for eligible transactions.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-1">Execution</h3>
              <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
                Any owner can execute the transaction. Execution performs the actual on-chain action 
                (transfer, contract call, etc.). After execution, the transaction is marked as executed 
                and cannot be executed again.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Types */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Transaction Types</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">QUAI Transfers</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Send QUAI tokens to any address. Specify the recipient address and amount. 
              The data field should be empty (0x) for simple transfers.
            </p>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-2 border border-dark-300 dark:border-dark-600">
              <p className="text-xs font-mono text-dark-500">Example: Send 10 QUAI to 0x1234...</p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Contract Calls</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Interact with smart contracts by providing the contract address and function call data. 
              This allows you to call any function on any contract, enabling complex operations.
            </p>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-2 border border-dark-300 dark:border-dark-600">
              <p className="text-xs font-mono text-dark-500">Example: Call approve() on an ERC20 token</p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Self-Calls (Owner Management)</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Manage the vault itself by calling internal functions. This includes adding/removing owners, 
              changing the threshold, and enabling/disabling modules. These are special transactions that 
              call the vault contract itself.
            </p>
            <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-2 border border-dark-300 dark:border-dark-600">
              <p className="text-xs font-mono text-dark-500">Example: Add a new owner address</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Cancelling Transactions</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            Transactions can be cancelled under certain conditions:
          </p>
          <ul className="space-y-2 ml-4 list-disc">
            <li>
              <strong className="text-dark-700 dark:text-dark-200">By the proposer:</strong> The owner who proposed the transaction 
              can cancel it immediately, regardless of approval count.
            </li>
            <li>
              <strong className="text-dark-700 dark:text-dark-200">By any owner:</strong> If the transaction has reached the threshold 
              number of approvals, any owner can cancel it. This prevents execution of proposals that may have 
              become undesirable.
            </li>
          </ul>
          <div className="bg-gradient-to-r from-yellow-900/90 via-yellow-800/90 to-yellow-900/90 border-l-4 border-yellow-600 rounded-md p-3 mt-3">
            <p className="text-sm text-yellow-200/90">
              <strong>Note:</strong> Once a transaction is executed, it cannot be cancelled. Cancellation 
              is only possible for pending transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Best Practices</h2>
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Choose Appropriate Thresholds</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Balance security with operational efficiency. A 2-of-3 multisig is good for small teams, 
              while larger organizations might use 3-of-5 or higher thresholds.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Verify Transaction Details</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Always carefully review transaction details before approving. Check the destination address, 
              amount, and decoded function calls (if applicable).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Use Modules for Additional Security</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Consider enabling modules like Daily Limits or Whitelist for additional security layers. 
              See the <Link to="/docs/modules" className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline">Modules</Link> documentation.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Keep Owner Keys Secure</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Each owner's private key should be stored securely. Consider using hardware wallets for 
              production multisig wallets.
            </p>
          </div>
        </div>
      </div>

      {/* Related Documentation */}
      <div className="vault-panel p-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Related Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/docs/modules"
            className="vault-panel p-4 hover:border-primary-600/50 transition-all group"
          >
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
              Modules
            </h3>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Extend your vault with Social Recovery, Daily Limits, and Whitelist modules.
            </p>
          </Link>
          <Link
            to="/docs/frontend-guide"
            className="vault-panel p-4 hover:border-primary-600/50 transition-all group"
          >
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors">
              Frontend Guide
            </h3>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              Learn how to use the Quai Vault web interface effectively.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
