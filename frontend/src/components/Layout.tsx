import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useWalletStore } from '../store/walletStore';
import { Sidebar } from './Sidebar';
import { NotificationContainer } from './NotificationContainer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { connect, disconnect, connected, address } = useWallet();
  const { error, setError } = useWalletStore();
  const location = useLocation();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-vault-black relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-glow-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-glow-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Warning Banner - Engineering Testing */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-yellow-900/95 via-yellow-800/95 to-yellow-900/95 border-b-2 border-yellow-600/50 shadow-yellow-glow-lg backdrop-blur-sm">
        <div className="flex max-w-full mx-auto px-5 py-2.5 items-center justify-center gap-4">
          <svg className="w-5 h-5 text-yellow-300 flex-shrink-0 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="text-base font-bold text-yellow-200 uppercase tracking-wider">
              Engineering Testing
            </span>
            <span className="text-base text-yellow-300 font-semibold">
              Orchard Testnet Only
            </span>
            <span className="text-base text-yellow-200/70">
              •
            </span>
            <span className="text-base text-yellow-300 font-semibold">
              Do not store significant funds
            </span>
          </div>
        </div>
      </div>

      {/* Top Navbar - Full width, branding and minimal nav */}
      <header className="fixed top-[3.5rem] left-0 right-0 h-14 vault-panel border-b-2 border-dark-700 z-30">
        <nav className="h-full px-6">
          <div className="flex justify-between h-full items-center">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary-600/20 blur-xl group-hover:bg-primary-600/30 transition-all"></div>
                  <span className="relative text-base font-display font-bold text-gradient-red vault-text-glow">
                    QUAI VAULT
                  </span>
                </div>
                <span className="ml-2 text-base font-mono text-dark-500 uppercase tracking-wider">
                  Multisig
                </span>
              </Link>
              <div className="hidden sm:flex sm:space-x-3">
                <Link
                  to="/"
                  className={`inline-flex items-center px-4 py-1.5 rounded text-base font-semibold transition-all ${
                    location.pathname === '/'
                      ? 'text-primary-400 vault-text-glow'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`inline-flex items-center px-4 py-1.5 rounded text-base font-semibold transition-all ${
                    location.pathname === '/about'
                      ? 'text-primary-400 vault-text-glow'
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  About
                </Link>
                <a
                  href="#"
                  className="inline-flex items-center px-4 py-1.5 rounded text-base font-semibold text-dark-400 hover:text-dark-200 transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Add docs link
                  }}
                >
                  Docs
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {connected && address ? (
                <>
                  <div className="vault-panel px-4 py-1.5 border border-dark-600">
                    <span className="text-base font-mono text-primary-400 font-semibold">
                      {formatAddress(address)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="btn-secondary"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={connect}
                  className="btn-primary"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar - Below top bar, narrow */}
      <Sidebar />

      {/* Error Banner - Fixed below navbar */}
      {error && (
        <div className="fixed left-64 top-[6rem] right-0 z-20 bg-gradient-to-r from-primary-900/90 via-primary-800/90 to-primary-900/90 border-b-2 border-primary-600 p-4.5 shadow-red-glow-lg backdrop-blur-sm">
          <div className="flex max-w-full mx-auto px-5 items-center">
            <div className="flex-1">
              <p className="text-base font-semibold text-primary-100 flex items-center gap-4.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-primary-200 hover:text-primary-100 transition-colors p-1.5 rounded hover:bg-primary-800/50"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area - Offset by sidebar and navbar */}
      <main className={`relative z-0 ml-64 ${error ? 'pt-[8.5rem]' : 'pt-[7.5rem]'} min-h-screen pb-6`}>
        <div className="px-5 py-4">
          {children}
        </div>
      </main>

      {/* Notification Container */}
      <NotificationContainer />

      {/* Footer */}
      <footer className="relative z-10 vault-panel border-t-2 border-dark-700 ml-64">
        <div className="px-5 py-3">
          <div className="flex flex-col items-center gap-4.5">
            <p className="text-center text-base font-mono text-dark-500 uppercase tracking-wider">
              Quai Multisig Vault
            </p>
            <p className="text-center text-base text-dark-600">
              Decentralized multisig solution for Quai Network
            </p>
            <div className="mt-1.5 flex items-center gap-4.5">
              <div className="w-2 h-2 rounded-full bg-primary-600 animate-glow-pulse"></div>
              <span className="text-base text-dark-600 font-mono">Secure • Decentralized • Trustless</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
