import { useParams, Link } from 'react-router-dom';
import { useMultisig } from '../hooks/useMultisig';
import { useIndexerConnection } from '../hooks/useIndexerConnection';
import { decodeTransaction } from '../utils/transactionDecoder';
import { getBlockRangeTimePeriod } from '../utils/blockTime';
import { CopyButton } from '../components/CopyButton';
import { ExplorerLink } from '../components/ExplorerLink';
import { EmptyState } from '../components/EmptyState';
import { formatQuai } from 'quais';

export function TransactionHistory() {
  const { address: walletAddress } = useParams<{ address: string }>();
  const { isConnected: isIndexerConnected } = useIndexerConnection();
  const { executedTransactions, cancelledTransactions, isLoadingHistory, isLoadingCancelled, refreshHistory, refreshCancelled } = useMultisig(walletAddress);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!walletAddress) {
    return (
      <div className="text-center py-20">
        <div className="vault-panel max-w-md mx-auto p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-100 dark:bg-vault-dark-4 border-2 border-primary-600/30 mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Invalid Vault Address</h2>
          <p className="text-dark-500">The requested vault address is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/wallet/${walletAddress}`}
          className="text-lg text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 mb-3 inline-flex items-center gap-4 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Vault
        </Link>
        <h1 className="text-xl font-display font-bold text-gradient-red vault-text-glow">Transaction History</h1>
        <p className="text-lg font-mono text-dark-500 uppercase tracking-wider mt-2">Complete Transaction Log</p>
      </div>

      {/* Info Banner - Only show limitation warning when indexer is not connected */}
      {!isIndexerConnected && (
        <div className="bg-dark-100 dark:bg-vault-dark-4 border border-dark-300 dark:border-dark-600 rounded-md p-4 mb-4">
          <div className="flex items-start gap-4">
            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-base font-mono text-dark-500 dark:text-dark-400">
                Showing transactions from the last <span className="text-primary-600 dark:text-primary-400 font-semibold">{getBlockRangeTimePeriod()}</span>
              </p>
              <p className="text-base text-dark-600 mt-1">
                Older transactions may not be displayed due to network query limitations.
                {' '}
                <Link
                  to={`/wallet/${walletAddress}/lookup`}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 underline font-semibold"
                >
                  Lookup by hash
                </Link>
                {' '}to find older transactions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Executed Transactions */}
      <div className="vault-panel p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-1">Executed Transactions</h2>
            <p className="text-base font-mono text-dark-500 uppercase tracking-wider">
              {executedTransactions?.length || 0} Completed
            </p>
          </div>
          <button
            onClick={() => refreshHistory()}
            className="text-lg text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 transition-colors font-semibold flex items-center gap-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {isLoadingHistory ? (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary-600/20 blur-xl animate-pulse"></div>
              <div className="relative inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
            <p className="mt-6 text-dark-500 dark:text-dark-400 font-semibold">Loading transaction history...</p>
            <p className="mt-2 text-base font-mono text-dark-600 uppercase tracking-wider">Accessing vault records</p>
          </div>
        ) : !executedTransactions || executedTransactions.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="w-8 h-8 text-dark-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            title="No Transaction History"
            description="This vault hasn't executed any transactions yet. Once transactions are proposed, approved, and executed, they will appear here."
            action={
              walletAddress
                ? {
                    label: 'Propose Transaction',
                    to: `/wallet/${walletAddress}/transaction/new`,
                  }
                : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {executedTransactions.map((tx) => {
              const formatTimestamp = (timestamp: number) => {
                const date = new Date(timestamp * 1000);
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
              };

              const decoded = decodeTransaction(tx, walletAddress);

              return (
                <div
                  key={tx.hash}
                  className="vault-panel p-5 hover:border-primary-600/50 transition-all"
                >
                  {/* Transaction Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-base font-semibold ${decoded.bgColor} ${decoded.textColor} border ${decoded.borderColor} shadow-vault-inner`}>
                          <span className="mr-1.5">{decoded.icon}</span>
                          {decoded.description}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-base font-bold bg-primary-900/50 text-primary-600 dark:text-primary-300 border border-primary-700/50">
                          ✓ Executed
                        </span>
                      </div>
                      {decoded.details && (
                        <p className="text-lg text-dark-700 dark:text-dark-200 font-semibold mt-2">{decoded.details}</p>
                      )}
                      <p className="text-base font-mono text-dark-500 mt-2 uppercase tracking-wider">{formatTimestamp(tx.timestamp)}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      {tx.value !== '0' && (
                        <p className="text-base font-display font-bold text-gradient-red vault-text-glow">
                          {parseFloat(formatQuai(tx.value)).toFixed(4)}
                          <span className="text-lg text-primary-600 dark:text-primary-400 ml-1">QUAI</span>
                        </p>
                      )}
                      <div className="flex items-center gap-4 justify-end mt-2">
                        <p className="text-base font-mono text-dark-500">
                          {formatAddress(tx.hash)}
                        </p>
                        <CopyButton text={tx.hash} size="md" />
                        <ExplorerLink type="transaction" value={tx.hash} className="text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details - Only show if not a self-call */}
                  {tx.to.toLowerCase() !== walletAddress.toLowerCase() && (
                    <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 mb-4 border border-dark-300 dark:border-dark-600 space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-base font-mono text-dark-500 uppercase tracking-wider">To:</span>
                        <span className="font-mono text-lg text-primary-600 dark:text-primary-300">{formatAddress(tx.to)}</span>
                      </div>
                      {tx.data !== '0x' && decoded.type === 'contractCall' && (
                        <div className="flex justify-between text-lg">
                          <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Data:</span>
                          <span className="font-mono text-base text-dark-500 dark:text-dark-400 break-all max-w-xs text-right">
                            {tx.data.length > 50 ? `${tx.data.slice(0, 50)}...` : tx.data}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approvals List */}
                  {Object.keys(tx.approvals).length > 0 && (
                    <div className="vault-divider pt-4 mt-4">
                      <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-3">Approved by:</p>
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(tx.approvals)
                          .filter(([, approved]) => approved)
                          .map(([owner]) => (
                            <span
                              key={owner}
                              className="vault-badge text-primary-600 dark:text-primary-300 border-primary-600/30"
                            >
                              {formatAddress(owner)}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancelled Transactions */}
      <div className="vault-panel p-8 opacity-90">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-display font-bold text-dark-600 dark:text-dark-300 mb-1">Cancelled Transactions</h2>
            <p className="text-base font-mono text-dark-500 uppercase tracking-wider">
              {cancelledTransactions?.length || 0} Cancelled
            </p>
          </div>
          <button
            onClick={() => refreshCancelled()}
            className="text-lg text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 transition-colors font-semibold flex items-center gap-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {isLoadingCancelled ? (
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary-600/20 blur-xl animate-pulse"></div>
              <div className="relative inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            </div>
            <p className="mt-6 text-dark-500 dark:text-dark-400 font-semibold">Loading cancelled transactions...</p>
            <p className="mt-2 text-base font-mono text-dark-600 uppercase tracking-wider">Accessing vault records</p>
          </div>
        ) : !cancelledTransactions || cancelledTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-100 dark:bg-vault-dark-4 border-2 border-dark-300 dark:border-dark-600 mb-4">
              <svg
                className="w-8 h-8 text-dark-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-lg text-dark-500 font-semibold">No cancelled transactions</p>
            <p className="text-base text-dark-600 mt-1 font-mono uppercase tracking-wider">
              Cancelled transactions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cancelledTransactions.map((tx) => {
              const formatTimestamp = (timestamp: number) => {
                const date = new Date(timestamp * 1000);
                return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
              };

              const decoded = decodeTransaction(tx, walletAddress);

              return (
                <div
                  key={tx.hash}
                  className="vault-panel p-5 hover:border-primary-600/30 transition-all opacity-80"
                >
                  {/* Transaction Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-base font-semibold ${decoded.bgColor} ${decoded.textColor} border ${decoded.borderColor} shadow-vault-inner opacity-75`}>
                          <span className="mr-1.5">{decoded.icon}</span>
                          {decoded.description}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-base font-bold bg-dark-600/50 text-dark-500 dark:text-dark-400 border border-dark-500">
                          ✕ Cancelled
                        </span>
                      </div>
                      {decoded.details && (
                        <p className="text-lg text-dark-600 dark:text-dark-300 font-semibold mt-2">{decoded.details}</p>
                      )}
                      <p className="text-base font-mono text-dark-600 mt-2 uppercase tracking-wider">{formatTimestamp(tx.timestamp)}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      {tx.value !== '0' && (
                        <p className="text-base font-display font-bold text-dark-500 dark:text-dark-400">
                          {parseFloat(formatQuai(tx.value)).toFixed(4)}
                          <span className="text-lg text-dark-500 ml-1">QUAI</span>
                        </p>
                      )}
                      <div className="flex items-center gap-4 justify-end mt-2">
                        <p className="text-base font-mono text-dark-600">
                          {formatAddress(tx.hash)}
                        </p>
                        <CopyButton text={tx.hash} size="md" />
                        <ExplorerLink type="transaction" value={tx.hash} className="text-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details - Only show if not a self-call */}
                  {tx.to.toLowerCase() !== walletAddress.toLowerCase() && (
                    <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 mb-4 border border-dark-300 dark:border-dark-600 space-y-3">
                      <div className="flex justify-between text-lg">
                        <span className="text-base font-mono text-dark-600 uppercase tracking-wider">To:</span>
                        <span className="font-mono text-lg text-dark-500 dark:text-dark-400">{formatAddress(tx.to)}</span>
                      </div>
                      {tx.data !== '0x' && decoded.type === 'contractCall' && (
                        <div className="flex justify-between text-lg">
                          <span className="text-base font-mono text-dark-600 uppercase tracking-wider">Data:</span>
                          <span className="font-mono text-base text-dark-500 break-all max-w-xs text-right">
                            {tx.data.length > 50 ? `${tx.data.slice(0, 50)}...` : tx.data}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Approvals List */}
                  {Object.keys(tx.approvals).length > 0 && Object.values(tx.approvals).some(v => v) && (
                    <div className="vault-divider pt-4 mt-4">
                      <p className="text-base font-mono text-dark-600 uppercase tracking-wider mb-3">Was approved by:</p>
                      <div className="flex flex-wrap gap-4">
                        {Object.entries(tx.approvals)
                          .filter(([, approved]) => approved)
                          .map(([owner]) => (
                            <span
                              key={owner}
                              className="vault-badge text-dark-500 dark:text-dark-400 border-dark-300 dark:border-dark-600 opacity-75"
                            >
                              {formatAddress(owner)}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
