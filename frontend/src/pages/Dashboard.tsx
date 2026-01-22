import { useWallet } from '../hooks/useWallet';
import { useMultisig } from '../hooks/useMultisig';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { connected } = useWallet();
  const { userWallets, isLoadingWallets } = useMultisig();

  if (!connected) {
    return (
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="vault-panel p-4 mb-4 text-center">
          <div className="mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-vault-dark-4 border-2 border-primary-600/30 mb-2">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-lg font-display font-bold text-gradient-red mb-2 vault-text-glow">
            Quai Vault
          </h1>
          <p className="text-base text-dark-300 mb-1 font-medium">
            Secure Multisig Wallet Solution for Quai Network
          </p>
          <p className="text-base text-dark-500 mb-4">
            Connect your wallet to get started
          </p>
          <div className="flex items-center justify-center gap-4 text-base font-mono text-dark-600 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-primary-600 animate-glow-pulse"></div>
            <span>Secure • Decentralized • Trustless</span>
          </div>
        </div>

        {/* What is Quai Vault */}
        <div className="vault-panel p-4 mb-4">
          <h2 className="text-base font-display font-bold text-dark-200 mb-2 flex items-center gap-4.5">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What is Quai Vault?
          </h2>
          <p className="text-base text-dark-400 mb-3 leading-relaxed">
            Quai Vault is a decentralized multisignature (multisig) wallet solution built specifically for the Quai Network. 
            It enables secure, collaborative management of QUAI tokens and smart contract interactions through 
            a multi-owner approval system.
          </p>
          <p className="text-base text-dark-400 leading-relaxed">
            Unlike traditional single-signature wallets, Quai Vault requires multiple authorized parties to 
            approve transactions before execution, providing enhanced security and preventing unauthorized access 
            to your funds.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="vault-panel p-4">
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-shrink-0 w-6 h-6 rounded bg-primary-900/30 border border-primary-700/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-dark-200 mb-0.5">Enhanced Security</h3>
                <p className="text-base text-dark-500 leading-relaxed">
                  Multiple approvals required for transactions, protecting against single points of failure and unauthorized access.
                </p>
              </div>
            </div>
          </div>

          <div className="vault-panel p-4">
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-shrink-0 w-6 h-6 rounded bg-primary-900/30 border border-primary-700/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-dark-200 mb-0.5">Collaborative Control</h3>
                <p className="text-base text-dark-500 leading-relaxed">
                  Share control with trusted parties. Configure custom approval thresholds to match your security needs.
                </p>
              </div>
            </div>
          </div>

          <div className="vault-panel p-4">
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-shrink-0 w-6 h-6 rounded bg-primary-900/30 border border-primary-700/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-dark-200 mb-0.5">Decentralized & Trustless</h3>
                <p className="text-base text-dark-500 leading-relaxed">
                  Built on smart contracts deployed on Quai Network. No central authority, no custodial risk.
                </p>
              </div>
            </div>
          </div>

          <div className="vault-panel p-4">
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-shrink-0 w-6 h-6 rounded bg-primary-900/30 border border-primary-700/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-dark-200 mb-0.5">Flexible Configuration</h3>
                <p className="text-base text-dark-500 leading-relaxed">
                  Add or remove owners, adjust approval thresholds, and manage permissions as your needs evolve.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="vault-panel p-4">
          <h2 className="text-base font-display font-bold text-dark-200 mb-2 flex items-center gap-4.5">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How It Works
          </h2>
          <div className="space-y-2">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-base font-bold text-primary-300">
                1
              </div>
              <div>
                <p className="text-base text-dark-300 font-medium mb-0.5">Create Your Vault</p>
                <p className="text-base text-dark-500">Set up a multisig wallet with multiple owners and a custom approval threshold (e.g., 2 of 3 owners must approve).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-base font-bold text-primary-300">
                2
              </div>
              <div>
                <p className="text-base text-dark-300 font-medium mb-0.5">Propose Transactions</p>
                <p className="text-base text-dark-500">Any owner can propose transactions (transfers, contract calls, owner changes). Transactions require approval before execution.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-base font-bold text-primary-300">
                3
              </div>
              <div>
                <p className="text-base text-dark-300 font-medium mb-0.5">Gather Approvals</p>
                <p className="text-base text-dark-500">Owners review and approve pending transactions. Once the threshold is met, anyone can execute the transaction.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-900/50 border border-primary-700/50 flex items-center justify-center text-base font-bold text-primary-300">
                4
              </div>
              <div>
                <p className="text-base text-dark-300 font-medium mb-0.5">Execute & Track</p>
                <p className="text-base text-dark-500">Execute approved transactions on-chain. View complete transaction history and manage your vault settings.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingWallets) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary-600/20 blur-xl animate-pulse"></div>
            <div className="relative inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          </div>
          <p className="mt-6 text-dark-400 font-semibold">Loading vaults...</p>
          <p className="mt-2 text-base font-mono text-dark-600 uppercase tracking-wider">Accessing secure storage</p>
        </div>
      </div>
    );
  }

  // If user has wallets, show welcome with quick actions
  if (userWallets && userWallets.length > 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="vault-panel p-4 mb-4">
          <h1 className="text-lg font-display font-bold text-gradient-red mb-2 vault-text-glow">
            Welcome Back
          </h1>
          <p className="text-base text-dark-400 mb-2">
            You have <span className="text-primary-400 font-semibold">{userWallets.length}</span> vault{userWallets.length !== 1 ? 's' : ''} ready to use
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to={`/wallet/${userWallets[0]}`}
              className="btn-primary inline-flex items-center gap-4 text-base px-5 py-2.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              Open First Vault
            </Link>
            <Link
              to="/create"
              className="btn-secondary inline-flex items-center gap-4 text-base px-5 py-2.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Vault
            </Link>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="vault-panel p-4">
          <h2 className="text-base font-display font-bold text-dark-200 mb-2">Quick Start</h2>
          <p className="text-base text-dark-500 mb-2">
            Select a vault from the sidebar to view details, manage owners, approve transactions, or create new proposals.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-vault-dark-4 rounded p-4 border border-dark-600">
              <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-0.5">Your Vaults</p>
              <p className="text-lg font-display font-bold text-primary-400">{userWallets.length}</p>
            </div>
            <div className="bg-vault-dark-4 rounded p-4 border border-dark-600">
              <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-0.5">Status</p>
              <p className="text-base font-semibold text-primary-400">Active</p>
            </div>
            <div className="bg-vault-dark-4 rounded p-4 border border-dark-600">
              <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-0.5">Network</p>
              <p className="text-base font-semibold text-dark-300">Quai Network</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="vault-panel p-6 mb-6 text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vault-dark-4 border-2 border-dark-600 mb-3">
            <svg className="w-8 h-8 text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>
        <h2 className="text-base font-display font-bold text-gradient-red mb-2 vault-text-glow">
          No Vaults Found
        </h2>
        <p className="text-base text-dark-400 mb-3">
          Create your first multisig vault to get started
        </p>
        <Link
          to="/create"
          className="btn-primary inline-flex items-center gap-4 text-base px-4 py-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Vault
        </Link>
      </div>
    </div>
  );
}
