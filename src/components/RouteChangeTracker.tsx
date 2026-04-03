'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/gtm';

/**
 * Fires a GTM `page_view` event on every SPA route change.
 * Mount once inside RootLayout — renders nothing to the DOM.
 */
export default function RouteChangeTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the very first render — GoogleTagManager already fires the initial
    // page_view via its own script snippet on hard load.
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    trackPageView(globalThis.location.href);
  }, [pathname]);

  return null;
}
