'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/services/notification';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker on mount
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
