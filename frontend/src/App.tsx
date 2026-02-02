import { lazy, Suspense, Component, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { WalletDetail } from './pages/WalletDetail';
import { CreateWallet } from './pages/CreateWallet';
import { NewTransaction } from './pages/NewTransaction';
import { TransactionHistory } from './pages/TransactionHistory';
import { LookupTransaction } from './pages/LookupTransaction';

/**
 * Error Boundary to catch and display errors gracefully
 * Prevents full app crash when a component throws
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-vault-black p-4">
          <div className="vault-panel p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-900/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-dark-800 dark:text-dark-100 mb-4">
              Something went wrong
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-4 mb-6 text-left">
                <p className="text-sm font-mono text-dark-500 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy-loaded documentation pages (reduces initial bundle by ~10-15%)
const DocsIndex = lazy(() => import('./pages/docs/DocsIndex').then(m => ({ default: m.DocsIndex })));
const GettingStarted = lazy(() => import('./pages/docs/GettingStarted').then(m => ({ default: m.GettingStarted })));
const MultisigWallets = lazy(() => import('./pages/docs/MultisigWallets').then(m => ({ default: m.MultisigWallets })));
const Modules = lazy(() => import('./pages/docs/Modules').then(m => ({ default: m.Modules })));
const SocialRecovery = lazy(() => import('./pages/docs/SocialRecovery').then(m => ({ default: m.SocialRecovery })));
const FrontendGuide = lazy(() => import('./pages/docs/FrontendGuide').then(m => ({ default: m.FrontendGuide })));
const DeveloperGuide = lazy(() => import('./pages/docs/DeveloperGuide').then(m => ({ default: m.DeveloperGuide })));
const Security = lazy(() => import('./pages/docs/Security').then(m => ({ default: m.Security })));
const FAQ = lazy(() => import('./pages/docs/FAQ').then(m => ({ default: m.FAQ })));

// Simple loading fallback for lazy-loaded pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000, // 5 minutes - garbage collect unused cache entries
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/docs" element={<DocsIndex />} />
                <Route path="/docs/getting-started" element={<GettingStarted />} />
                <Route path="/docs/multisig-wallets" element={<MultisigWallets />} />
                <Route path="/docs/modules" element={<Modules />} />
                <Route path="/docs/modules/social-recovery" element={<SocialRecovery />} />
                <Route path="/docs/frontend-guide" element={<FrontendGuide />} />
                <Route path="/docs/developer-guide" element={<DeveloperGuide />} />
                <Route path="/docs/security" element={<Security />} />
                <Route path="/docs/faq" element={<FAQ />} />
                <Route path="/create" element={<CreateWallet />} />
                <Route path="/wallet/:address" element={<WalletDetail />} />
                <Route path="/wallet/:address/transaction/new" element={<NewTransaction />} />
                <Route path="/wallet/:address/history" element={<TransactionHistory />} />
                <Route path="/wallet/:address/lookup" element={<LookupTransaction />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ErrorBoundary>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
