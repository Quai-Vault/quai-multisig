import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useMultisig } from '../hooks/useMultisig';
import { WalletCard } from './WalletCard';
import { EmptyState } from './EmptyState';
import { ThemeToggle } from './ThemeToggle';

// Memoize formatAddress outside component to avoid recreation
const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = memo(function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { connect, disconnect, connected, address } = useWallet();
  const { userWallets, isLoadingWallets, isRefetchingWallets } = useMultisig();
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={onToggle}
        />
      )}
      <aside className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-vault-dark-2 border-r-2 border-dark-200 dark:border-dark-700 flex flex-col z-20 overflow-hidden transition-all duration-300 ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0' : 'w-64 translate-x-0'}`}>

      {/* Wallet Connect/Disconnect */}
      <div className="px-4 py-4 border-b border-dark-200 dark:border-dark-700">
        {connected && address ? (
          <div className="space-y-3">
            <div className="vault-panel px-4 py-2 border border-dark-300 dark:border-dark-600">
              <span className="text-base font-mono text-primary-600 dark:text-primary-400 font-semibold">
                {formatAddress(address)}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="btn-secondary w-full"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            className="btn-primary w-full"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Quick Actions */}
      {connected && (
        <div className="px-4 py-5 border-b border-dark-200 dark:border-dark-700">
          <Link
            to="/create"
            className={`flex items-center gap-4.5 px-4 py-2.5 rounded text-base font-semibold transition-all w-full ${
              location.pathname === '/create'
                ? 'text-primary-600 dark:text-primary-400 vault-text-glow bg-dark-100 dark:bg-vault-dark-4'
                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-vault-dark-4'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create
          </Link>
        </div>
      )}

      {/* Wallets List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!connected ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-dark-100 dark:bg-vault-dark-4 border-2 border-primary-600/30 mb-5">
              <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-base text-dark-600 dark:text-dark-500 font-medium mb-2.5">Connect Wallet</p>
            <p className="text-base text-dark-500 dark:text-dark-600 font-mono uppercase tracking-wider">
              To view your vaults
            </p>
          </div>
        ) : isLoadingWallets ? (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary-600/20 blur-xl animate-pulse"></div>
              <div className="relative inline-block h-10 w-10 animate-spin rounded-full border-2 border-solid border-primary-600 border-r-transparent"></div>
            </div>
            <p className="mt-5 text-base text-dark-500 dark:text-dark-400 font-semibold">Loading vaults...</p>
          </div>
        ) : !userWallets || userWallets.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-9 h-9 text-dark-400 dark:text-dark-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            }
            title="No Vaults"
            description="Create your first multisig vault to get started. Vaults allow you to manage funds securely with multiple owners and configurable approval thresholds."
            action={{
              label: 'Create Vault',
              to: '/create',
            }}
            className="py-10"
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-4.5">
                <h2 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 uppercase tracking-wider">
                  Vaults
                </h2>
                {isRefetchingWallets && (
                  <div className="w-5 h-5 border border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <span className="vault-badge">
                {userWallets.length}
              </span>
            </div>
            <div className="space-y-3">
              {userWallets.map((walletAddress) => {
                const isActive = location.pathname === `/wallet/${walletAddress}` || location.pathname.startsWith(`/wallet/${walletAddress}/`);
                return (
                  <div
                    key={walletAddress}
                    className={`vault-panel p-4 hover:border-primary-600/50 transition-all ${
                      isActive ? 'border-primary-600/50 bg-dark-100 dark:bg-vault-dark-4' : ''
                    }`}
                  >
                    <Link
                      to={`/wallet/${walletAddress}`}
                      className="block"
                    >
                      <WalletCard walletAddress={walletAddress} compact={true} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
        <div className="mt-auto px-4 py-4 border-t border-dark-200 dark:border-dark-700">
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
});
