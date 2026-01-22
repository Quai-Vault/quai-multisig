import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { TransactionFlow } from '../TransactionFlow';
import { useMultisig } from '../../hooks/useMultisig';
import type { PendingTransaction } from '../../types';

interface CancelTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  transaction: PendingTransaction;
}

export function CancelTransactionModal({
  isOpen,
  onClose,
  walletAddress,
  transaction,
}: CancelTransactionModalProps) {
  const { cancelTransactionAsync } = useMultisig(walletAddress);
  const [resetKey, setResetKey] = useState(0);

  // Reset the flow when modal opens
  useEffect(() => {
    if (isOpen) {
      setResetKey(prev => prev + 1);
    }
  }, [isOpen]);

  const handleCancel = async (onProgress: (progress: any) => void) => {
    onProgress({ step: 'signing', message: 'Please approve the cancellation transaction in your wallet' });
    
    const txHash = await cancelTransactionAsync({ walletAddress, txHash: transaction.hash });
    
    onProgress({ step: 'waiting', txHash: txHash || transaction.hash, message: 'Waiting for cancellation confirmation...' });
    
    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return txHash || transaction.hash;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Transaction"
      size="md"
    >
      <div className="space-y-6">
        <div className="bg-vault-dark-4 rounded-md p-4 border border-dark-600">
          <div className="flex items-start gap-4">
            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-dark-200 font-semibold mb-1">
                Cancel Transaction
              </p>
              <p className="text-lg text-dark-500">
                Are you sure you want to cancel this transaction? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <TransactionFlow
          title="Cancel Transaction"
          description={`You are cancelling transaction ${transaction.hash.substring(0, 10)}...`}
          onExecute={handleCancel}
          onComplete={onClose}
          onCancel={onClose}
          successMessage="Transaction cancelled successfully!"
          resetKey={resetKey}
        />
      </div>
    </Modal>
  );
}
