import { useState, useCallback, useEffect } from 'react';
import { NotificationToast, type Notification } from './NotificationToast';

let notificationIdCounter = 0;

// Global notification manager
class NotificationManager {
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private notifications: Notification[] = [];

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((callback) => callback([...this.notifications]));
  }

  add(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${notificationIdCounter++}`,
      timestamp: Date.now(),
    };
    this.notifications.push(newNotification);
    this.notify();

    // Auto-remove after 10 seconds (increased from 5)
    setTimeout(() => {
      this.remove(newNotification.id);
    }, 10000);
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }
}

export const notificationManager = new NotificationManager();

export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    // Request notification permission on mount
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => {
        console.warn('Failed to request notification permission:', err);
      });
    }

    return unsubscribe;
  }, []);

  const handleDismiss = useCallback((id: string) => {
    notificationManager.remove(id);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-[7.5rem] right-5 z-50 w-[28rem] max-w-[calc(100vw-18rem)]">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
