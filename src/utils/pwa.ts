export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private initialize(): void {
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.notifyInstallAvailable();
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.notifyInstalled();
    });
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  public isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  public isInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  public async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  public async clearCache(): Promise<void> {
    if (!this.registration) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ type: 'CLEAR_CACHE' });

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  public async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    const permission = await this.requestNotificationPermission();

    if (permission === 'granted' && this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        ...options,
      });
    }
  }

  public async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    await this.registration.update();
    return !!this.registration.waiting;
  }

  private notifyInstallAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private notifyInstalled(): void {
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  private notifyUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  public onInstallAvailable(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('pwa-install-available', handler);
    return () => window.removeEventListener('pwa-install-available', handler);
  }

  public onInstalled(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('pwa-installed', handler);
    return () => window.removeEventListener('pwa-installed', handler);
  }

  public onUpdateAvailable(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener('pwa-update-available', handler);
    return () => window.removeEventListener('pwa-update-available', handler);
  }

  public async shareContent(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  }

  public canShare(data?: ShareData): boolean {
    return navigator.share !== undefined && (!data || navigator.canShare?.(data) !== false);
  }

  public getConnectionInfo(): {
    online: boolean;
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      online: navigator.onLine,
      type: connection?.type,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
    };
  }

  public async addToHomeScreen(): Promise<boolean> {
    return await this.promptInstall();
  }
}

export const pwaManager = PWAManager.getInstance();

export function usePWAInstallPrompt() {
  const manager = PWAManager.getInstance();
  return {
    isInstallable: manager.isInstallable(),
    isInstalled: manager.isInstalled(),
    promptInstall: () => manager.promptInstall(),
  };
}

export function registerPWAListeners() {
  const manager = PWAManager.getInstance();

  manager.onInstallAvailable(() => {
    console.log('PWA installation is available');
  });

  manager.onInstalled(() => {
    console.log('PWA has been installed');
  });

  manager.onUpdateAvailable(() => {
    console.log('PWA update is available');
  });
}
