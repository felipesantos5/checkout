// src/components/ui/PurchaseNotification.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAutoNotifications, type AutoNotificationsConfig } from '../../hooks/useAutoNotifications';
import { useTranslation } from '../../i18n/I18nContext';

interface Notification {
  id: number;
  name: string;
}

interface PurchaseNotificationProps {
  config?: AutoNotificationsConfig;
  productName: string;
}

export function PurchaseNotification({ config, productName }: PurchaseNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationIdRef = useRef(0);
  const { t } = useTranslation();

  const handleNotification = useCallback((name: string) => {
    const id = ++notificationIdRef.current;
    setNotifications(prev => [...prev, { id, name }]);

    // Remove a notificação após 4 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  useAutoNotifications({
    config,
    onNotification: handleNotification,
  });

  if (!config?.enabled || notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Mobile: Top */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center gap-2 p-3 pointer-events-none md:hidden">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            name={notification.name}
            productName={productName}
            position="top"
            purchaseText={t.notification?.purchase || 'acabou de comprar'}
          />
        ))}
      </div>

      {/* Desktop: Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none hidden md:flex">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            name={notification.name}
            productName={productName}
            position="bottom-right"
            purchaseText={t.notification?.purchase || 'acabou de comprar'}
          />
        ))}
      </div>
    </>
  );
}

interface NotificationToastProps {
  name: string;
  productName: string;
  position: 'top' | 'bottom-right';
  purchaseText: string;
}

function NotificationToast({ name, productName, position, purchaseText }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const animationClass = position === 'top'
    ? isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    : isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

  return (
    <div
      className={`
        bg-white rounded-lg shadow-lg border border-gray-100 p-3 max-w-xs pointer-events-auto
        transform transition-all duration-300 ease-out
        ${animationClass}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{name}</span>{' '}
            <span className="text-gray-600">{purchaseText}</span>
          </p>
          <p className="text-xs text-gray-500 truncate">{productName}</p>
        </div>
      </div>
    </div>
  );
}
