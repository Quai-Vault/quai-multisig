import { useState } from 'react';

export type DeploymentStep = 
  | 'preparing'
  | 'deploying'
  | 'deploying_waiting'
  | 'registering'
  | 'registering_waiting'
  | 'verifying'
  | 'success'
  | 'error';

export interface DeploymentProgress {
  step: DeploymentStep;
  walletAddress?: string;
  deployTxHash?: string;
  registerTxHash?: string;
  error?: string;
  message?: string;
}

interface WalletCreationFlowProps {
  owners: string[];
  threshold: number;
  onDeploy: (onProgress: (progress: {
    step: 'deploying' | 'deploying_waiting' | 'registering' | 'registering_waiting' | 'verifying' | 'success';
    deployTxHash?: string;
    registerTxHash?: string;
    walletAddress?: string;
    message?: string;
  }) => void) => Promise<string>;
  onComplete: (walletAddress: string) => void;
  onCancel: () => void;
}

export function WalletCreationFlow({
  owners,
  threshold,
  onDeploy,
  onComplete,
  onCancel,
}: WalletCreationFlowProps) {
  const [progress, setProgress] = useState<DeploymentProgress>({
    step: 'preparing',
  });
  const [copied, setCopied] = useState(false);

  const startDeployment = async () => {
    try {
      setProgress({ step: 'deploying', message: 'Preparing deployment transaction...' });
      
      // Start deployment with progress callback
      const walletAddress = await onDeploy((progressUpdate) => {
        setProgress({
          step: progressUpdate.step,
          deployTxHash: progressUpdate.deployTxHash,
          registerTxHash: progressUpdate.registerTxHash,
          walletAddress: progressUpdate.walletAddress,
          message: progressUpdate.message,
        });
      });
      
      // Ensure success state is set
      setProgress({
        step: 'success',
        walletAddress,
        message: 'Wallet created successfully!',
      });
      
      // Call onComplete after a short delay to show success message
      setTimeout(() => {
        onComplete(walletAddress);
      }, 2000);
    } catch (error) {
      console.error('Deployment error:', error);
      setProgress({
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to create wallet',
      });
    }
  };

  const getStepNumber = (step: DeploymentStep): number => {
    const stepOrder: DeploymentStep[] = [
      'preparing',
      'deploying',
      'deploying_waiting',
      'registering',
      'registering_waiting',
      'verifying',
      'success',
    ];
    return stepOrder.indexOf(step) + 1;
  };

  const isStepComplete = (step: DeploymentStep): boolean => {
    const currentStepIndex = getStepNumber(progress.step);
    const stepIndex = getStepNumber(step);
    return stepIndex < currentStepIndex || progress.step === 'success';
  };

  const isStepActive = (step: DeploymentStep): boolean => {
    return progress.step === step;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-gradient-red vault-text-glow mb-2">Create Multisig Vault</h1>
      <p className="text-lg font-mono text-dark-500 uppercase tracking-wider mb-8">Deploy a new secure multisig wallet</p>

      {/* Configuration Summary */}
      {progress.step === 'preparing' && (
        <div className="vault-panel p-8 mb-8">
          <h2 className="text-2xl font-display font-bold text-dark-700 dark:text-dark-200 mb-6">Configuration Summary</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-base font-mono text-dark-500 uppercase tracking-wider mb-3">Owners</label>
              <div className="space-y-2">
                {owners.map((owner) => (
                  <div
                    key={owner}
                    className="px-4 py-3 bg-dark-100 dark:bg-vault-dark-4 rounded-md border border-dark-300 dark:border-dark-600 text-lg font-mono text-primary-600 dark:text-primary-300"
                  >
                    {owner}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-mono text-dark-500 uppercase tracking-wider mb-3">Required Approvals</label>
              <p className="text-lg font-semibold text-dark-700 dark:text-dark-200">
                <span className="text-primary-600 dark:text-primary-400">{threshold}</span>
                <span className="text-dark-500 mx-2">of</span>
                <span className="text-dark-600 dark:text-dark-300">{owners.length}</span>
                <span className="text-dark-500 ml-2 text-lg font-normal">owner{owners.length !== 1 ? 's' : ''}</span>
              </p>
            </div>

            <div className="bg-dark-100 dark:bg-vault-dark-4 border border-dark-300 dark:border-dark-600 rounded-md p-5">
              <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-200 mb-3 flex items-center gap-4">
                <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Important Information
              </h3>
              <ul className="text-lg text-dark-500 dark:text-dark-400 space-y-2">
                <li className="flex items-start gap-4">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>You will need to approve <strong className="text-dark-700 dark:text-dark-200">2 transactions</strong> in your wallet</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-primary-500 mt-1">•</span>
                  <span><strong className="text-dark-700 dark:text-dark-200">First transaction:</strong> Deploy the Multisig Vault</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-primary-500 mt-1">•</span>
                  <span><strong className="text-dark-700 dark:text-dark-200">Second transaction:</strong> Register the Vault</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>Each transaction requires gas fees</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-primary-500 mt-1">•</span>
                  <span>The wallet address will be generated after deployment</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="vault-divider pt-6 mt-8">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={startDeployment}
                className="btn-primary flex-1 min-w-[200px]"
              >
                <span className="flex items-center justify-center gap-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start Deployment
                </span>
              </button>
              <button
                onClick={onCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deployment Steps */}
      {progress.step !== 'preparing' && progress.step !== 'error' && (
        <div className="vault-panel p-8">
          <div className="space-y-8">
            {/* Step 1: Deploy Multisig Vault */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                    isStepComplete('deploying')
                      ? 'bg-gradient-to-br from-primary-700 to-primary-900 border-primary-600 shadow-red-glow text-primary-200'
                      : isStepActive('deploying') || isStepActive('deploying_waiting')
                      ? 'bg-gradient-to-br from-primary-700 to-primary-900 border-primary-600 shadow-red-glow text-primary-200 animate-pulse'
                      : 'bg-dark-100 dark:bg-vault-dark-4 border-dark-300 dark:border-dark-600 text-dark-500'
                  }`}
                >
                  {isStepComplete('deploying') ? '✓' : '1'}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-2">
                  Step 1: Deploy Multisig Vault
                </h3>
                <p className="text-lg text-dark-500 dark:text-dark-400 mb-3">
                  {isStepActive('deploying')
                    ? 'Please approve the deployment transaction in your wallet'
                    : isStepActive('deploying_waiting')
                    ? 'Transaction submitted. Waiting for confirmation...'
                    : isStepComplete('deploying')
                    ? 'Multisig Vault deployed successfully'
                    : 'Deploying your Multisig Vault'}
                </p>
                {progress.deployTxHash && (
                  <div className="mt-3 bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
                    <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-1">Transaction Hash</p>
                    <code className="text-base font-mono text-primary-600 dark:text-primary-300 break-all">
                      {progress.deployTxHash}
                    </code>
                  </div>
                )}
                {isStepActive('deploying') && (
                  <div className="mt-4 flex items-center gap-4 text-lg text-dark-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-600/20 blur-sm"></div>
                      <div className="relative w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="font-semibold">Waiting for your approval in wallet...</span>
                  </div>
                )}
                {isStepActive('deploying_waiting') && (
                  <div className="mt-4 flex items-center gap-4 text-lg text-dark-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-600/20 blur-sm"></div>
                      <div className="relative w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="font-semibold">Waiting for transaction confirmation...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Register Wallet */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${
                    isStepComplete('registering')
                      ? 'bg-gradient-to-br from-primary-700 to-primary-900 border-primary-600 shadow-red-glow text-primary-200'
                      : isStepActive('registering') || isStepActive('registering_waiting')
                      ? 'bg-gradient-to-br from-primary-700 to-primary-900 border-primary-600 shadow-red-glow text-primary-200 animate-pulse'
                      : 'bg-dark-100 dark:bg-vault-dark-4 border-dark-300 dark:border-dark-600 text-dark-500'
                  }`}
                >
                  {isStepComplete('registering') ? '✓' : '2'}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-2">
                  Step 2: Register Vault
                </h3>
                <p className="text-lg text-dark-500 dark:text-dark-400 mb-3">
                  {isStepActive('registering')
                    ? 'Please approve the registration transaction in your wallet'
                    : isStepActive('registering_waiting')
                    ? 'Transaction submitted. Waiting for confirmation...'
                    : isStepComplete('registering')
                    ? 'Vault registered successfully'
                    : 'Registering your Vault'}
                </p>
                {progress.registerTxHash && (
                  <div className="mt-3 bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
                    <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-1">Transaction Hash</p>
                    <code className="text-base font-mono text-primary-600 dark:text-primary-300 break-all">
                      {progress.registerTxHash}
                    </code>
                  </div>
                )}
                {isStepActive('registering') && (
                  <div className="mt-4 flex items-center gap-4 text-lg text-dark-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-600/20 blur-sm"></div>
                      <div className="relative w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="font-semibold">Waiting for your approval in wallet...</span>
                  </div>
                )}
                {isStepActive('registering_waiting') && (
                  <div className="mt-4 flex items-center gap-4 text-lg text-dark-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-600/20 blur-sm"></div>
                      <div className="relative w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <span className="font-semibold">Waiting for transaction confirmation...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Success Message */}
            {progress.step === 'success' && progress.walletAddress && (
              <div className="mt-8 p-6 bg-gradient-to-br from-primary-900/30 via-primary-800/20 to-primary-900/30 border-2 border-primary-600/50 rounded-md shadow-red-glow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-700 to-primary-900 border-2 border-primary-600 shadow-red-glow flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-gradient-red vault-text-glow">Vault Created Successfully!</h3>
                    <p className="text-lg text-dark-500 dark:text-dark-400 mt-1">
                      Your multisig vault has been deployed and is ready to use.
                    </p>
                  </div>
                </div>
                <div className="bg-dark-100 dark:bg-vault-dark-4 rounded-md p-4 border border-dark-300 dark:border-dark-600">
                  <p className="text-base font-mono text-dark-500 uppercase tracking-wider mb-3">Vault Address</p>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(progress.walletAddress || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch (err) {
                        console.error('Failed to copy:', err);
                      }
                    }}
                    className="group relative w-full text-left"
                    title="Click to copy address"
                  >
                    <div className="flex items-center gap-4 bg-dark-50 dark:bg-vault-dark-3 px-4 py-3 rounded-md border border-dark-200 dark:border-dark-600 hover:border-primary-600/50 hover:bg-dark-100 dark:hover:bg-vault-dark-2 transition-all">
                      <code className="text-lg font-mono text-primary-600 dark:text-primary-300 break-all flex-1 group-hover:text-primary-500 dark:group-hover:text-primary-200 transition-colors select-all">
                        {progress.walletAddress}
                      </code>
                      <div className={`flex-shrink-0 transition-all duration-200 ${copied ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                        {copied ? (
                          <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-primary-500 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                    {copied && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-primary-900 text-primary-200 px-5 py-2.5 rounded-md text-base font-semibold border border-primary-700 shadow-red-glow z-10 animate-in fade-in duration-200">
                        Address copied!
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="border-4 border-transparent border-t-primary-900"></div>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {progress.step === 'error' && (
        <div className="vault-panel p-8">
          <div className="bg-gradient-to-r from-primary-900/90 via-primary-800/90 to-primary-900/90 border-l-4 border-primary-600 rounded-md p-6 shadow-red-glow">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-900 to-primary-950 border-2 border-primary-700 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-primary-200 mb-2">Deployment Failed</h3>
                <p className="text-primary-300 font-medium">{progress.error}</p>
              </div>
            </div>
            <div className="vault-divider pt-6">
              <div className="flex flex-wrap gap-4">
                <button onClick={startDeployment} className="btn-primary">
                  Try Again
                </button>
                <button onClick={onCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
