'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  releaseNotes: string;
  downloadUrl: string;
}

export default function UpdateNotification() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      // Check if user dismissed this version
      const dismissed = localStorage.getItem('dismissed-update-version');
      
      const response = await fetch('/api/version');
      if (!response.ok) return;

      const data: VersionInfo = await response.json();
      setVersionInfo(data);

      if (data.updateAvailable && dismissed !== data.latestVersion) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleDismiss = () => {
    if (versionInfo) {
      localStorage.setItem('dismissed-update-version', versionInfo.latestVersion);
    }
    setIsDismissed(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleViewRelease = () => {
    if (versionInfo?.downloadUrl) {
      window.open(versionInfo.downloadUrl, '_blank');
    }
  };

  if (!isVisible || !versionInfo?.updateAvailable) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md transition-opacity duration-300 z-50 ${
        isDismissed ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-3xl">🎉</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900">
              Доступно обновление!
            </h4>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Новая версия <strong>{versionInfo.latestVersion}</strong> доступна для скачивания.
            <br />
            Текущая версия: <strong>{versionInfo.currentVersion}</strong>
          </p>
          {versionInfo.releaseNotes && (
            <details className="text-xs text-gray-500 mb-3">
              <summary className="cursor-pointer hover:text-gray-700">
                Что нового?
              </summary>
              <div className="mt-2 pl-2 border-l-2 border-gray-200 max-h-40 overflow-y-auto">
                {versionInfo.releaseNotes.split('\n').slice(0, 5).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </details>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleViewRelease}
              className="flex-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
            >
              Посмотреть
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
