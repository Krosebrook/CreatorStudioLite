import React, { useState, useEffect } from 'react';
import { cn } from '../../design-system/utils/cn';
import { pwaManager } from '../../utils/pwa';
import { Download, X, Smartphone, RefreshCw } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const unsubscribeInstall = pwaManager.onInstallAvailable(() => {
      if (!pwaManager.isInstalled()) {
        setShowInstallPrompt(true);
      }
    });

    const unsubscribeUpdate = pwaManager.onUpdateAvailable(() => {
      setShowUpdatePrompt(true);
    });

    if (pwaManager.isInstallable() && !pwaManager.isInstalled()) {
      setShowInstallPrompt(true);
    }

    return () => {
      unsubscribeInstall();
      unsubscribeUpdate();
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await pwaManager.promptInstall();
      if (accepted) {
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await pwaManager.updateServiceWorker();
      setShowUpdatePrompt(false);
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  if (!showInstallPrompt && !showUpdatePrompt) {
    return null;
  }

  return (
    <>
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Install SparkLabs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Install our app for a faster experience with offline support and native features.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className={cn(
                      'flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium',
                      'hover:bg-blue-700 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'flex items-center justify-center gap-2'
                    )}
                  >
                    {isInstalling ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Install
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDismissInstall}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismissInstall}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdatePrompt && (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-down">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Update Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  A new version of SparkLabs is available. Update now for the latest features and improvements.
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Update Now
                  </button>

                  <button
                    onClick={handleDismissUpdate}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>

              <button
                onClick={handleDismissUpdate}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
