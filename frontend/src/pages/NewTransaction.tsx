import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultisig } from '../hooks/useMultisig';
import { transactionBuilderService } from '../services/TransactionBuilderService';
import { Modal } from '../components/Modal';
import { TransactionFlow } from '../components/TransactionFlow';
import * as quais from 'quais';

export function NewTransaction() {
  const { address: walletAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { proposeTransactionAsync } = useMultisig(walletAddress);

  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState('0x');
  const [errors, setErrors] = useState<string[]>([]);
  const [showFlow, setShowFlow] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!to.trim()) {
      newErrors.push('Recipient address is required');
    } else if (!quais.isAddress(to)) {
      newErrors.push('Invalid recipient address');
    }

    if (!value.trim()) {
      newErrors.push('Value is required');
    } else {
      try {
        const parsedValue = transactionBuilderService.parseValue(value);
        if (parsedValue < 0n) {
          newErrors.push('Value cannot be negative');
        }
      } catch {
        newErrors.push('Invalid value format');
      }
    }

    if (data && data !== '0x') {
      if (!quais.isHexString(data)) {
        newErrors.push('Invalid data format (must be hex string)');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAddress) {
      setErrors(['Invalid wallet address']);
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Show the transaction flow modal
    setShowFlow(true);
    setResetKey(prev => prev + 1);
    setErrors([]);
  };

  const handleProposeTransaction = async (onProgress: (progress: any) => void) => {
    if (!walletAddress) {
      throw new Error('Invalid wallet address');
    }

    const parsedValue = transactionBuilderService.parseValue(value);
    const normalizedTo = to.trim();
    const normalizedData = (data || '0x').trim();

    onProgress({ step: 'signing', message: 'Please approve the transaction proposal in your wallet' });
    
    const txHash = await proposeTransactionAsync({
      walletAddress,
      to: normalizedTo,
      value: parsedValue,
      data: normalizedData,
    });
    
    onProgress({ step: 'waiting', txHash: txHash || '', message: 'Waiting for transaction confirmation...' });
    
    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return txHash || '';
  };

  const handleComplete = () => {
    setShowFlow(false);
    // Navigate back to wallet detail after a short delay
    setTimeout(() => {
      navigate(`/wallet/${walletAddress}`);
    }, 500);
  };

  const handleCancel = () => {
    setShowFlow(false);
  };

  if (!walletAddress) {
    return (
      <div className="text-center py-20">
        <div className="vault-panel max-w-md mx-auto p-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vault-dark-4 border-2 border-primary-600/30 mb-6">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-dark-200 mb-2">Invalid Vault Address</h2>
          <p className="text-dark-500">The requested vault address is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/wallet/${walletAddress}`)}
          className="text-lg text-primary-400 hover:text-primary-300 mb-3 inline-flex items-center gap-4 transition-colors font-semibold"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Vault
        </button>
        <h1 className="text-4xl font-display font-bold text-gradient-red vault-text-glow">New Transaction</h1>
        <p className="text-lg font-mono text-dark-500 uppercase tracking-wider mt-2">Propose a new multisig transaction</p>
      </div>

      <form onSubmit={handleSubmit} className="vault-panel p-8">
        {/* Recipient Address */}
        <div className="mb-8">
          <label htmlFor="to" className="block text-base font-mono text-dark-500 uppercase tracking-wider mb-3">
            Recipient Address
          </label>
          <input
            id="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="input-field w-full"
          />
        </div>

        {/* Value */}
        <div className="mb-8">
          <label htmlFor="value" className="block text-base font-mono text-dark-500 uppercase tracking-wider mb-3">
            Amount (QUAI)
          </label>
          <input
            id="value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.0"
            className="input-field w-full"
          />
          <p className="mt-2 text-base font-mono text-dark-600">
            Enter the amount in QUAI (e.g., 1.5 for 1.5 QUAI)
          </p>
        </div>

        {/* Data (Optional) */}
        <div className="mb-8">
          <label htmlFor="data" className="block text-base font-mono text-dark-500 uppercase tracking-wider mb-3">
            Data (Optional)
          </label>
          <textarea
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="0x"
            rows={4}
            className="input-field w-full font-mono text-lg"
          />
          <p className="mt-2 text-base font-mono text-dark-600">
            Optional contract call data. Leave as "0x" for simple transfers.
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="mb-8 bg-vault-dark-4 rounded-md p-5 border border-dark-600">
          <h3 className="text-base font-mono text-dark-500 uppercase tracking-wider mb-4">Transaction Summary</h3>
          <div className="space-y-3 text-lg">
            <div className="flex justify-between items-center">
              <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Type:</span>
              <span className="text-dark-200 font-semibold">
                {!data || data === '0x' ? 'Simple Transfer' : 'Contract Call'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Recipient:</span>
              <span className="text-primary-300 font-mono truncate max-w-xs text-right">
                {to || '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Amount:</span>
              <span className="text-dark-200 font-semibold">{value || '0'} <span className="text-primary-400">QUAI</span></span>
            </div>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-primary-900/90 via-primary-800/90 to-primary-900/90 border-l-4 border-primary-600 rounded-md p-4 shadow-red-glow">
            <h4 className="text-lg font-semibold text-primary-200 mb-3 flex items-center gap-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please fix the following errors:
            </h4>
            <ul className="list-disc list-inside text-lg text-primary-200 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="font-medium">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <div className="vault-divider pt-6 mt-8">
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="btn-primary flex-1 min-w-[200px]"
            >
              <span className="flex items-center justify-center gap-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Propose Transaction
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/wallet/${walletAddress}`)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Transaction Flow Modal */}
      <Modal
        isOpen={showFlow}
        onClose={handleCancel}
        title="Propose Transaction"
        size="lg"
      >
        <div className="space-y-4">
          {/* Transaction Summary */}
          <div className="bg-vault-dark-4 rounded-md p-5 border border-dark-600">
            <h3 className="text-base font-mono text-dark-500 uppercase tracking-wider mb-4">Transaction Details</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between items-center">
                <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Type:</span>
                <span className="text-dark-200 font-semibold">
                  {!data || data === '0x' ? 'Simple Transfer' : 'Contract Call'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Recipient:</span>
                <span className="text-primary-300 font-mono break-all text-right max-w-xs">
                  {to || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Amount:</span>
                <span className="text-dark-200 font-semibold">{value || '0'} <span className="text-primary-400">QUAI</span></span>
              </div>
              {data && data !== '0x' && (
                <div className="flex justify-between items-start">
                  <span className="text-base font-mono text-dark-500 uppercase tracking-wider">Data:</span>
                  <span className="text-dark-400 font-mono text-base break-all text-right max-w-xs">
                    {data.length > 20 ? `${data.slice(0, 20)}...` : data}
                  </span>
                </div>
              )}
            </div>
          </div>

          <TransactionFlow
            title="Propose Transaction"
            description={`Proposing transaction to ${to.substring(0, 10)}...`}
            onExecute={handleProposeTransaction}
            onComplete={handleComplete}
            onCancel={handleCancel}
            successMessage="Transaction proposed successfully!"
            resetKey={resetKey}
          />
        </div>
      </Modal>
    </div>
  );
}
