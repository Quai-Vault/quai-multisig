import { Link } from 'react-router-dom';

export function SocialRecovery() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/docs/modules"
          className="text-base text-primary-600 dark:text-primary-400 hover:text-primary-600 dark:text-primary-300 mb-4 inline-flex items-center gap-2 transition-colors font-semibold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Modules
        </Link>
        <h1 className="text-2xl font-display font-bold text-gradient-red vault-text-glow mb-3">
          Social Recovery Module
        </h1>
        <p className="text-lg text-dark-600 dark:text-dark-300 leading-relaxed">
          Comprehensive guide to configuring and using the Social Recovery Module for wallet recovery.
        </p>
      </div>

      {/* Overview */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Overview</h2>
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300 leading-relaxed">
          <p>
            The Social Recovery Module provides a mechanism for trusted guardians to recover access to your 
            multisig vault if you lose access to your owner keys. This is particularly important for critical 
            wallets holding significant assets.
          </p>
          <p>
            Recovery is not automatic - it requires guardian consensus, a time delay, and manual execution. 
            This design prevents immediate takeovers while providing a safety net for legitimate recovery scenarios.
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Guardians</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              Guardians are trusted addresses that can initiate and approve recovery processes. Choose guardians 
              carefully - they have significant power.
            </p>
            <ul className="space-y-2 ml-4 list-disc text-base text-dark-600 dark:text-dark-300">
              <li>At least one guardian is required</li>
              <li>Guardian addresses must be valid Quai Network addresses</li>
              <li>No duplicate addresses allowed</li>
              <li>Guardians can be changed through configuration updates</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Threshold</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              The threshold determines how many guardians must approve a recovery before it can be executed.
            </p>
            <ul className="space-y-2 ml-4 list-disc text-base text-dark-600 dark:text-dark-300">
              <li>Must be between 1 and the number of guardians</li>
              <li>Higher thresholds provide more security but reduce flexibility</li>
              <li>Example: 2-of-3 means 2 out of 3 guardians must approve</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Recovery Period</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed mb-2">
              The recovery period is a time delay (minimum 1 day) between when a recovery receives enough 
              approvals and when it can be executed. This gives current owners time to cancel malicious recoveries.
            </p>
            <ul className="space-y-2 ml-4 list-disc text-base text-dark-600 dark:text-dark-300">
              <li>Minimum: 1 day (86400 seconds)</li>
              <li>Longer periods provide more security but slower recovery</li>
              <li>Consider your operational needs when setting this value</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recovery Process */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Recovery Process</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-primary-600 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                1
              </span>
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200">Initiation</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                A guardian initiates recovery by proposing:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>New owner addresses for the vault</li>
                <li>New threshold for the vault</li>
              </ul>
              <p className="mt-2">
                The recovery is assigned a unique hash and enters a pending state. The execution time is 
                set to current time + recovery period.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                2
              </span>
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200">Approval Phase</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Other guardians review the recovery proposal and approve it if they agree. Each guardian 
                can only approve once per recovery.
              </p>
              <p>
                The frontend tracks approval status and shows how many approvals are needed. Guardians 
                can approve in any order.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                3
              </span>
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200">Time Delay</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Once the threshold number of approvals is reached, the recovery enters a waiting period. 
                The execution time must pass before the recovery can be executed.
              </p>
              <p>
                During this time, current owners can cancel the recovery if it's malicious or unwanted.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-primary-600 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-900/50 border border-primary-700/50 text-primary-600 dark:text-primary-300 font-bold text-sm">
                4
              </span>
              <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200">Execution</h3>
            </div>
            <div className="ml-11 space-y-2 text-base text-dark-600 dark:text-dark-300">
              <p>
                Once the time delay has passed and threshold approvals are met, anyone can execute the recovery. 
                Execution:
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Replaces the vault's owners with the new owners</li>
                <li>Updates the vault's threshold to the new threshold</li>
                <li>Marks the recovery as executed (cannot be executed again)</li>
              </ul>
              <p className="mt-2">
                <strong className="text-dark-700 dark:text-dark-200">Note:</strong> Recovery does NOT automatically execute. 
                Someone must manually call the execute function after conditions are met.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Security Features</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Threshold Locking</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              The threshold required for a recovery is stored at initiation time. This prevents manipulation 
              attacks where an owner changes the configuration mid-recovery to make execution easier or harder.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Configuration Lock</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Recovery configuration cannot be updated while recoveries are pending. This prevents changing 
              guardians or thresholds during an active recovery process.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Time Delay</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              The mandatory time delay gives current owners time to detect and cancel malicious recovery 
              attempts. Even if guardians are compromised, owners have a window to respond.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Owner Cancellation</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              Current owners can cancel any pending recovery at any time. This provides a final safeguard 
              against unauthorized recovery attempts.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Best Practices</h2>
        
        <div className="space-y-4 text-base text-dark-600 dark:text-dark-300">
          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Choose Trusted Guardians</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Select guardians who are trustworthy and have secure key management. Consider using hardware 
              wallets, multisig wallets, or other secure storage solutions for guardian keys.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Appropriate Threshold</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Balance security with recovery speed. A 2-of-3 setup is good for small teams, while larger 
              organizations might use 3-of-5 or higher. Avoid 1-of-N setups as they provide minimal security.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Recovery Period</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Set a recovery period that gives you enough time to respond to malicious attempts but doesn't 
              delay legitimate recovery too long. 1-7 days is common.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Regular Reviews</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Periodically review your guardian set and update it if needed. Remove guardians who are no 
              longer trusted or accessible.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-dark-700 dark:text-dark-200 mb-2">Test Recovery Process</h3>
            <p className="text-dark-500 dark:text-dark-400 leading-relaxed">
              Before relying on social recovery for critical wallets, test the process with a test vault 
              to ensure all guardians understand the process and can execute it when needed.
            </p>
          </div>
        </div>
      </div>

      {/* Common Scenarios */}
      <div className="vault-panel p-6 mb-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Common Scenarios</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Lost Owner Keys</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              If an owner loses their keys, the remaining owners can initiate a recovery to replace the 
              lost owner with a new address. This requires guardian approval and the time delay.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Owner Rotation</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              To rotate owners (e.g., when an employee leaves), use recovery to replace the old owner 
              addresses with new ones. This is safer than individual add/remove operations.
            </p>
          </div>

          <div>
            <h3 className="text-base font-display font-bold text-dark-700 dark:text-dark-200 mb-2">Emergency Recovery</h3>
            <p className="text-base text-dark-600 dark:text-dark-300 leading-relaxed">
              In emergency situations where multiple owners are compromised or unavailable, guardians can 
              recover the vault to a new set of owners. The time delay ensures this isn't done maliciously.
            </p>
          </div>
        </div>
      </div>

      {/* Limitations */}
      <div className="vault-panel p-6">
        <h2 className="text-lg font-display font-bold text-dark-700 dark:text-dark-200 mb-4">Limitations & Considerations</h2>
        
        <div className="space-y-3 text-base text-dark-600 dark:text-dark-300">
          <div className="bg-gradient-to-r from-yellow-900/90 via-yellow-800/90 to-yellow-900/90 border-l-4 border-yellow-600 rounded-md p-4">
            <p className="text-sm text-yellow-200/90 mb-2">
              <strong>Guardian Compromise:</strong> If a majority of guardians are compromised (meeting the threshold), 
              they can recover your vault. Choose guardians carefully and use secure key management.
            </p>
            <p className="text-sm text-yellow-200/90">
              <strong>Time Delay:</strong> Legitimate recovery takes time due to the mandatory delay. Plan accordingly 
              and ensure guardians understand the process.
            </p>
          </div>
          <p>
            Recovery requires manual execution - it doesn't happen automatically. Someone must call the execute 
            function after all conditions are met.
          </p>
          <p>
            Configuration changes are blocked while recoveries are pending. Complete or cancel pending recoveries 
            before updating configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
