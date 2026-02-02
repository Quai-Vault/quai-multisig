/**
 * Browser notification utilities
 * Centralizes notification permission checks and notification sending
 */

/**
 * Check if browser notifications are supported and permission is granted
 */
export function canShowBrowserNotifications(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  );
}

/**
 * Request notification permission from the user
 * @returns Promise that resolves to the permission state
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.requestPermission();
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Send a browser notification if permissions are granted
 * @param title - Notification title
 * @param options - Optional notification options (body, icon, tag, etc.)
 * @returns The Notification object if created, null otherwise
 */
export function sendBrowserNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!canShowBrowserNotifications()) {
    return null;
  }

  try {
    return new Notification(title, {
      icon: '/vite.svg',
      ...options,
    });
  } catch (error) {
    console.warn('Failed to create notification:', error);
    return null;
  }
}

/**
 * Common notification presets for the application
 */
export const NotificationPresets = {
  /**
   * Notify about a new pending transaction
   */
  newTransaction: (walletAddress: string) => {
    const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    return sendBrowserNotification('New Transaction', {
      body: `A new transaction has been proposed for ${shortAddr}`,
      tag: `tx-new-${walletAddress}`,
    });
  },

  /**
   * Notify that a transaction is ready to execute
   */
  transactionReady: (txHash: string) => {
    const shortHash = `${txHash.slice(0, 10)}...`;
    return sendBrowserNotification('Transaction Ready', {
      body: `Transaction ${shortHash} has enough approvals and is ready to execute`,
      tag: `tx-ready-${txHash}`,
    });
  },

  /**
   * Notify about a completed transaction
   */
  transactionExecuted: (txHash: string) => {
    const shortHash = `${txHash.slice(0, 10)}...`;
    return sendBrowserNotification('Transaction Executed', {
      body: `Transaction ${shortHash} has been executed successfully`,
      tag: `tx-executed-${txHash}`,
    });
  },

  /**
   * Notify about a cancelled transaction
   */
  transactionCancelled: (txHash: string) => {
    const shortHash = `${txHash.slice(0, 10)}...`;
    return sendBrowserNotification('Transaction Cancelled', {
      body: `Transaction ${shortHash} has been cancelled`,
      tag: `tx-cancelled-${txHash}`,
    });
  },

  /**
   * Notify about balance change
   */
  balanceChanged: (walletAddress: string, change: string) => {
    const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    return sendBrowserNotification('Balance Changed', {
      body: `${shortAddr}: ${change}`,
      tag: `balance-${walletAddress}`,
    });
  },

  /**
   * Notify about owner/threshold changes
   */
  walletConfigChanged: (walletAddress: string, description: string) => {
    const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    return sendBrowserNotification('Wallet Updated', {
      body: `${shortAddr}: ${description}`,
      tag: `config-${walletAddress}`,
    });
  },
} as const;
