import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import {
  AddOwnerModal,
  RemoveOwnerModal,
  ChangeThresholdModal,
} from './transactionModals';

interface OwnerManagementProps {
  walletAddress: string;
  owners: string[];
  threshold: number;
  onUpdate: () => void;
}

export function OwnerManagement({ walletAddress, owners, threshold, onUpdate }: OwnerManagementProps) {
  const { address: connectedAddress } = useWallet();
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [showChangeThreshold, setShowChangeThreshold] = useState(false);
  const [ownerToRemove, setOwnerToRemove] = useState<string | null>(null);

  const handleRemoveOwner = (owner: string) => {
    setOwnerToRemove(owner);
  };

  const canRemoveOwner = (_owner: string): boolean => {
    // Can't remove if it would make threshold invalid
    if (owners.length - 1 < threshold) {
      return false;
    }
    // Can't remove yourself if you're the only owner
    if (owners.length === 1) {
      return false;
    }
    return true;
  };

  return (
    <div className="vault-panel p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-display font-bold text-dark-200">Owners</h2>
          <span className="vault-badge text-base">{owners.length}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddOwner(true)}
            className="btn-primary text-base px-5 py-2.5 inline-flex items-center gap-4.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
          <button
            onClick={() => setShowChangeThreshold(true)}
            className="btn-secondary text-base px-5 py-2.5 inline-flex items-center gap-4.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Threshold
          </button>
        </div>
      </div>

      {/* Owners List - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
        {owners.map((owner, index) => (
          <div
            key={owner}
            className="flex items-center justify-between p-4.5 bg-vault-dark-4 rounded-md border border-dark-600 hover:border-primary-600/30 hover:bg-vault-dark-3 transition-all"
          >
            <div className="flex items-center gap-4.5 flex-1 min-w-0">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-700 to-primary-900 rounded-full flex items-center justify-center border border-primary-600/50 flex-shrink-0">
                <span className="text-base font-bold text-primary-200">
                  {index + 1}
                </span>
              </div>
              <span className="font-mono text-base text-primary-300 truncate">{owner}</span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              {owner.toLowerCase() === connectedAddress?.toLowerCase() && (
                <span className="vault-badge text-base border-primary-600/50 text-primary-400 bg-primary-900/30">
                  You
                </span>
              )}
              {canRemoveOwner(owner) && (
                <button
                  onClick={() => handleRemoveOwner(owner)}
                  className="text-base font-semibold text-primary-500 hover:text-primary-400 transition-colors px-4 py-2 rounded border border-primary-700/50 hover:border-primary-600 bg-vault-dark-3 hover:bg-vault-dark-2"
                  title="Remove owner"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-dark-700">
        <p className="text-base font-mono text-dark-500 uppercase tracking-wider">Threshold</p>
        <p className="text-lg font-semibold text-dark-200">
          <span className="text-primary-400">{threshold}</span>
          <span className="text-dark-500 mx-1">/</span>
          <span className="text-dark-300">{owners.length}</span>
        </p>
      </div>

      {/* Modals */}
      <AddOwnerModal
        isOpen={showAddOwner}
        onClose={() => {
          setShowAddOwner(false);
          onUpdate();
        }}
        walletAddress={walletAddress}
        threshold={threshold}
        existingOwners={owners}
      />
      <ChangeThresholdModal
        isOpen={showChangeThreshold}
        onClose={() => {
          setShowChangeThreshold(false);
          onUpdate();
        }}
        walletAddress={walletAddress}
        currentThreshold={threshold}
        ownerCount={owners.length}
      />
      {ownerToRemove && (
        <RemoveOwnerModal
          isOpen={!!ownerToRemove}
          onClose={() => {
            setOwnerToRemove(null);
            onUpdate();
          }}
          walletAddress={walletAddress}
          ownerToRemove={ownerToRemove}
          threshold={threshold}
        />
      )}
    </div>
  );
}
