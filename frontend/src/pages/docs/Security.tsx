import { Link } from 'react-router-dom';

export function Security() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/docs"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-300 mb-4 inline-flex items-center gap-2 transition-colors font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Documentation
        </Link>
        <h1 className="text-2xl font-display font-bold text-gradient-red vault-text-glow mb-3">
          Security
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Security considerations, best practices, and audit information for Quai Vault.
        </p>
      </div>

      {/* Security Model */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Security Model</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            Quai Vault implements a threshold-based multisig security model where transactions require 
            multiple approvals before execution. This provides defense-in-depth against single points of failure.
          </p>
          <p>
            Key security principles:
          </p>
          <ul className="space-y-2 ml-4 list-disc">
            <li><strong className="text-dark-700 dark:text-dark-200">Distributed Control:</strong> No single key controls the vault</li>
            <li><strong className="text-dark-700 dark:text-dark-200">Threshold Protection:</strong> Requires consensus for execution</li>
            <li><strong className="text-dark-700 dark:text-dark-200">On-Chain Transparency:</strong> All actions are verifiable on-chain</li>
            <li><strong className="text-dark-700 dark:text-dark-200">Modular Design:</strong> Modules add security layers without compromising core functionality</li>
          </ul>
        </div>
      </div>

      {/* Smart Contract Security */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Smart Contract Security</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Reentrancy Protection</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              All execution functions use OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks. 
              State changes occur before external calls.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Access Control</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Strict access control through modifiers ensures only authorized addresses can perform actions. 
              Owners, modules, and self-calls are properly gated.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Input Validation</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              All inputs are validated: addresses checked for zero, thresholds validated against owner counts, 
              transaction existence verified before operations.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Social Recovery Security</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              The Social Recovery Module includes several security features:
            </p>
            <ul className="space-y-1 ml-4 list-disc text-base text-dark-600 dark:text-dark-300 mt-2">
              <li>Threshold stored at initiation time prevents manipulation</li>
              <li>Configuration locked during pending recoveries</li>
              <li>Time delay prevents immediate takeovers</li>
              <li>Owner cancellation rights provide final safeguard</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Security Best Practices</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Key Management</h3>
            <ul className="space-y-1 ml-4 list-disc text-dark-500 dark:text-dark-400">
              <li>Use hardware wallets for owner keys when possible</li>
              <li>Store keys securely and separately</li>
              <li>Never share private keys</li>
              <li>Use different keys for different vaults</li>
              <li>Consider using multisig wallets as owners (nested multisig)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Threshold Selection</h3>
            <ul className="space-y-1 ml-4 list-disc text-dark-500 dark:text-dark-400">
              <li>Balance security with operational needs</li>
              <li>Avoid 1-of-N thresholds (defeats purpose of multisig)</li>
              <li>Consider geographic/key distribution when setting thresholds</li>
              <li>Higher thresholds for higher-value vaults</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Module Configuration</h3>
            <ul className="space-y-1 ml-4 list-disc text-dark-500 dark:text-dark-400">
              <li>Only whitelist trusted addresses</li>
              <li>Set conservative daily limits</li>
              <li>Choose trusted guardians for social recovery</li>
              <li>Regularly review module configurations</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Transaction Verification</h3>
            <ul className="space-y-1 ml-4 list-disc text-dark-500 dark:text-dark-400">
              <li>Always verify transaction details before approving</li>
              <li>Check decoded contract calls when possible</li>
              <li>Verify destination addresses</li>
              <li>Use transaction lookup to verify on-chain state</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Known Limitations */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Known Limitations</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div className="bg-gradient-to-r from-yellow-900/90 via-yellow-800/90 to-yellow-900/90 border-l-4 border-yellow-600 rounded-md p-4">
            <h3 className="text-base font-semibold text-yellow-200 mb-2">Testnet Deployment</h3>
            <p className="text-sm text-yellow-200/90">
              Quai Vault is currently deployed on Orchard Testnet for engineering testing. 
              <strong> Do not store significant funds.</strong> Mainnet deployment will follow after 
              comprehensive testing and security audits.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Daily Limit Enforcement</h3>
            <p className="leading-relaxed">
              Daily limit checks are enforced in the frontend only. Direct contract calls can bypass 
              daily limits. This is by design for flexibility, but users should be aware.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Social Recovery Guardians</h3>
            <p className="leading-relaxed">
              If a threshold of guardians is compromised, they can recover your vault. Choose guardians 
              carefully and use secure key management.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Status */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Audit Status</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            <strong className="text-dark-700 dark:text-dark-200">Current Status:</strong> Pre-audit (Testnet)
          </p>
          <p>
            The contracts are currently on testnet for testing and development. A formal security audit 
            is planned before mainnet deployment. All code is open source and available for review.
          </p>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600 mt-3">
            <p className="text-sm text-dark-500 font-mono mb-1">Security Researchers</p>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              If you discover a security vulnerability, please report it responsibly. Open an issue on 
              GitHub or contact the maintainers directly.
            </p>
          </div>
        </div>
      </div>

      {/* Attack Vectors */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Potential Attack Vectors</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Owner Key Compromise</h3>
            <p className="leading-relaxed">
              <strong className="text-dark-700 dark:text-dark-200">Risk:</strong> If an owner's key is compromised, the attacker 
              can propose and approve transactions.
            </p>
            <p className="leading-relaxed mt-2">
              <strong className="text-dark-700 dark:text-dark-200">Mitigation:</strong> Use hardware wallets, secure key storage, 
              and appropriate thresholds. Remove compromised owners immediately.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Guardian Compromise</h3>
            <p className="leading-relaxed">
              <strong className="text-dark-700 dark:text-dark-200">Risk:</strong> If enough guardians are compromised (meeting threshold), 
              they can initiate and execute recoveries.
            </p>
            <p className="leading-relaxed mt-2">
              <strong className="text-dark-700 dark:text-dark-200">Mitigation:</strong> Choose trusted guardians, use secure key management, 
              and monitor recovery proposals. Current owners can cancel malicious recoveries.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Social Engineering</h3>
            <p className="leading-relaxed">
              <strong className="text-dark-700 dark:text-dark-200">Risk:</strong> Attackers may try to trick owners into approving 
              malicious transactions.
            </p>
            <p className="leading-relaxed mt-2">
              <strong className="text-dark-700 dark:text-dark-200">Mitigation:</strong> Always verify transaction details, use 
              transaction decoding, and establish clear approval processes.
            </p>
          </div>
        </div>
      </div>

      {/* Reporting Issues */}
      <div className="vault-panel p-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Reporting Security Issues</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <p>
            If you discover a security vulnerability:
          </p>
          <ol className="space-y-2 ml-4 list-decimal">
            <li>Do not open a public GitHub issue</li>
            <li>Contact the maintainers directly or use GitHub's private security reporting</li>
            <li>Provide detailed information about the vulnerability</li>
            <li>Allow time for the issue to be addressed before public disclosure</li>
          </ol>
          <div className="bg-dark-100 dark:bg-vault-dark-4 rounded p-3 border border-dark-300 dark:border-dark-600 mt-3">
            <p className="text-sm text-dark-500 font-mono mb-1">Responsible Disclosure</p>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              We appreciate responsible disclosure and will work with security researchers to address 
              issues promptly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
