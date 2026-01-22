import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useMultisig } from '../hooks/useMultisig';
import type { PendingTransaction } from '../types';
import * as quais from 'quais';
import {
  ApproveTransactionModal,
  ExecuteTransactionModal,
  CancelTransactionModal,
  RevokeApprovalModal,
} from './transactionModals';
import { decodeTransaction } from '../utils/transactionDecoder';

interface TransactionListProps {
  transactions: PendingTransaction[];
  walletAddress: string;
  isOwner: boolean;
}

function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function TransactionList({ transactions, walletAddress, isOwner }: TransactionListProps) {
  const { address: connectedAddress } = useWallet();
  const { refreshTransactions } = useMultisig(walletAddress);
  const [approveModalTx, setApproveModalTx] = useState<PendingTransaction | null>(null);
  const [executeModalTx, setExecuteModalTx] = useState<PendingTransaction | null>(null);
  const [cancelModalTx, setCancelModalTx] = useState<PendingTransaction | null>(null);
  const [revokeModalTx, setRevokeModalTx] = useState<PendingTransaction | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTimestamp = (timestamp: number | bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleApprove = (tx: PendingTransaction) => {
    setApproveModalTx(tx);
  };

  const handleRevoke = (tx: PendingTransaction) => {
    setRevokeModalTx(tx);
  };

  const handleExecute = (tx: PendingTransaction) => {
    setExecuteModalTx(tx);
  };

  const handleCancel = (tx: PendingTransaction) => {
    setCancelModalTx(tx);
  };

  return (
    <div className="space-y-3">
      {transactions.length === 0 ? (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-vault-dark-4 border border-dark-600 mb-2">
            <svg
              className="mx-auto h-5 w-5 text-dark-600"
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
          </div>
          <p className="text-base text-dark-400 font-semibold">No pending transactions</p>
        </div>
      ) : (
        transactions.map((tx) => {
          // Check if current user has approved - handle case-insensitive matching
          const hasApproved = connectedAddress
            ? Object.entries(tx.approvals).some(
                ([owner, approved]) =>
                  approved && owner.toLowerCase() === connectedAddress.toLowerCase()
              )
            : false;
          const canExecute = tx.numApprovals >= tx.threshold;
          const approvalPercentage = (Number(tx.numApprovals) / Number(tx.threshold)) * 100;
          const decoded = decodeTransaction(tx, walletAddress);
          
          // Check if user can cancel: proposer can always cancel, others need threshold approvals
          const isProposer = connectedAddress && tx.proposer && 
            tx.proposer.toLowerCase() === connectedAddress.toLowerCase();
          const canCancel = isProposer || (tx.numApprovals >= tx.threshold);

          return (
            <div
              key={tx.hash}
              className="vault-panel p-5 hover:border-primary-600/50 transition-all duration-300"
            >
            {/* Transaction Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-4 mb-2.5">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded text-base font-semibold ${decoded.bgColor} ${decoded.textColor} border ${decoded.borderColor} shadow-vault-inner`}>
                    <span className="mr-2">{decoded.icon}</span>
                    {decoded.description}
                  </span>
                  {canExecute && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded text-base font-semibold bg-gradient-to-r from-primary-700 to-primary-800 text-primary-200 border border-primary-600 shadow-red-glow animate-pulse-slow">
                      <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Ready to execute
                    </span>
                  )}
                </div>
                {decoded.details && (
                  <p className="text-base text-dark-300 font-medium mt-1 mb-0.5">{decoded.details}</p>
                )}
                <p className="text-base font-mono text-dark-600 uppercase tracking-wider">{formatTimestamp(tx.timestamp)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                {tx.value !== '0' && (
                  <div className="bg-vault-dark-4 rounded px-4 py-2.5 border border-dark-600 mb-1.5">
                    <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-0.5">Value</p>
                    <p className="text-base font-display font-bold text-gradient-red vault-text-glow">
                      {parseFloat(quais.formatQuai(tx.value)).toFixed(4)} QUAI
                    </p>
                  </div>
                )}
                <div className="bg-vault-dark-4 rounded px-4 py-2.5 border border-dark-600">
                  <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-1">Hash</p>
                  <div className="flex items-center gap-4">
                    <p className="text-base font-mono text-primary-400 break-all max-w-[120px] flex-1">
                      {formatAddress(tx.hash)}
                    </p>
                    <button
                      onClick={() => copyToClipboard(tx.hash)}
                      className="text-primary-500 hover:text-primary-400 transition-colors p-1 rounded hover:bg-vault-dark-3 flex-shrink-0"
                      title="Copy full transaction hash"
                    >
                      {copiedHash === tx.hash ? (
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details - Only show if not a self-call */}
            {tx.to.toLowerCase() !== walletAddress.toLowerCase() && (
              <div className="bg-vault-dark-4 rounded p-4 mb-3 border border-dark-600">
                <div className="flex justify-between items-center text-base gap-4">
                  <span className="text-base font-mono text-dark-500 uppercase tracking-wider">To:</span>
                  <span className="font-mono text-primary-300">{formatAddress(tx.to)}</span>
                </div>
              </div>
            )}

            {/* Approval Progress */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Approvals</span>
                <span className="text-base font-semibold text-dark-200">
                  <span className="text-primary-400">{tx.numApprovals.toString()}</span>
                  <span className="text-dark-500 mx-0.5">/</span>
                  <span className="text-dark-300">{tx.threshold.toString()}</span>
                </span>
              </div>
              <div className="w-full bg-vault-dark-4 rounded-full h-1.5 border border-dark-600 shadow-vault-inner overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    canExecute 
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-red-glow' 
                      : 'bg-gradient-to-r from-primary-700 to-primary-800'
                  }`}
                  style={{ width: `${Math.min(approvalPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Approvals List */}
            <div className="mb-3">
              <h4 className="text-base font-mono text-dark-500 uppercase tracking-wider mb-2">Approved by</h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(tx.approvals).map(([owner, approved]) => {
                  if (!approved) return null;
                  const isYou = owner.toLowerCase() === connectedAddress?.toLowerCase();
                  return (
                    <span
                      key={owner}
                      className={`inline-flex items-center px-3 py-1.5 rounded text-base font-medium border shadow-vault-inner ${
                        isYou
                          ? 'bg-gradient-to-r from-primary-800/50 to-primary-900/50 text-primary-300 border-primary-600/50'
                          : 'bg-vault-dark-4 text-dark-300 border-dark-600'
                      }`}
                    >
                      <span className="font-mono">{formatAddress(owner)}</span>
                      {isYou && <span className="ml-2 text-primary-400 font-semibold">(You)</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="pt-3 border-t border-dark-700">
                <div className="flex flex-wrap gap-4">
                  {!hasApproved ? (
                    <button
                      onClick={() => handleApprove(tx)}
                      disabled={hasApproved}
                      className="btn-primary inline-flex items-center gap-2 text-base"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRevoke(tx)}
                      className="btn-secondary inline-flex items-center gap-2 text-base"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Revoke
                    </button>
                  )}
                  {canExecute && (
                    <button
                      onClick={() => handleExecute(tx)}
                      className="btn-primary inline-flex items-center gap-2 text-base bg-gradient-to-r from-primary-500 to-primary-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Execute
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(tx)}
                      className="px-5 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded border border-red-700 shadow-vault-button hover:shadow-red-glow transition-all duration-300"
                    >
                      <span className="inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          );
        })
      )}

      {/* Modals */}
      {approveModalTx && (
        <ApproveTransactionModal
          isOpen={!!approveModalTx}
          onClose={() => {
            setApproveModalTx(null);
            refreshTransactions();
          }}
          walletAddress={walletAddress}
          transaction={approveModalTx}
        />
      )}
      {executeModalTx && (
        <ExecuteTransactionModal
          isOpen={!!executeModalTx}
          onClose={() => {
            setExecuteModalTx(null);
            refreshTransactions();
          }}
          walletAddress={walletAddress}
          transaction={executeModalTx}
        />
      )}
      {cancelModalTx && (
        <CancelTransactionModal
          isOpen={!!cancelModalTx}
          onClose={() => {
            setCancelModalTx(null);
            refreshTransactions();
          }}
          walletAddress={walletAddress}
          transaction={cancelModalTx}
        />
      )}
      {revokeModalTx && (
        <RevokeApprovalModal
          isOpen={!!revokeModalTx}
          onClose={() => {
            setRevokeModalTx(null);
            refreshTransactions();
          }}
          walletAddress={walletAddress}
          transaction={revokeModalTx}
        />
      )}
    </div>
  );
}
