import { useState, useEffect, useCallback } from "react";

export interface PWAState {
  isOnline: boolean;
  isInstallable: boolean;
  isStandalone: boolean;
  swUpdateAvailable: boolean;
  pendingSyncCount: number;
  notificationPermission: NotificationPermission;
  install: () => Promise<void>;
  applyUpdate: () => void;
  requestNotifications: () => Promise<NotificationPermission>;
  registerSync: (tag: string) => Promise<void>;
  sendLocalNotification: (title: string, body: string, url?: string) => void;
}

export function usePWA(): PWAState {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [swUpdateAvailable, setSwUpdateAvailable] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    () => ('Notification' in window ? Notification.permission : 'denied')
  );

  useEffect(() => {
    // Standalone mode check
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mq.matches || !!(navigator as any).standalone);
    const onMqChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mq.addEventListener('change', onMqChange);

    // Network status
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    // Install prompt
    const onBeforeInstall = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    const onInstalled     = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // SW update detection
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => {
          const watch = (sw: ServiceWorker | null) => {
            if (!sw) return;
            sw.addEventListener('statechange', () => {
              if (sw.state === 'installed' && navigator.serviceWorker.controller) {
                setSwUpdateAvailable(true);
              }
            });
          };
          watch(reg.installing ?? reg.waiting);
          reg.addEventListener('updatefound', () => watch(reg.installing));
          // Periodically check for updates
          const timer = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
          return () => clearInterval(timer);
        })
        .catch(() => {});

      // SW → app messages
      const onSWMessage = (e: MessageEvent) => {
        if (e.data?.type === 'SYNC_COMPLETE')  setPendingSyncCount(0);
        if (e.data?.type === 'ALERTAS_SYNCED') setPendingSyncCount(0);
      };
      navigator.serviceWorker.addEventListener('message', onSWMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', onSWMessage);
        window.removeEventListener('online',  onOnline);
        window.removeEventListener('offline', onOffline);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
        window.removeEventListener('appinstalled', onInstalled);
        mq.removeEventListener('change', onMqChange);
      };
    }

    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      mq.removeEventListener('change', onMqChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  }, [installPrompt]);

  const applyUpdate = useCallback(() => {
    navigator.serviceWorker?.ready
      .then(reg => {
        reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      })
      .catch(() => {});
  }, []);

  const requestNotifications = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
    return perm;
  }, []);

  const registerSync = useCallback(async (tag: string) => {
    try {
      const reg = await navigator.serviceWorker?.ready;
      if (reg && 'sync' in reg) {
        await (reg as any).sync.register(tag);
        setPendingSyncCount(n => n + 1);
      }
    } catch { /* Background Sync not supported */ }
  }, []);

  const sendLocalNotification = useCallback((title: string, body: string, url = '/') => {
    if (Notification.permission !== 'granted') return;
    navigator.serviceWorker?.ready
      .then(reg => {
        reg.showNotification(title, {
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: `local-${Date.now()}`,
          data: { url },
        });
      })
      .catch(() => {
        new Notification(title, { body, icon: '/favicon.svg' });
      });
  }, []);

  return {
    isOnline,
    isInstallable:  !!installPrompt,
    isStandalone,
    swUpdateAvailable,
    pendingSyncCount,
    notificationPermission,
    install,
    applyUpdate,
    requestNotifications,
    registerSync,
    sendLocalNotification,
  };
}
