/**
 * GTM / dataLayer helpers
 *
 * All pushes are no-ops when window.dataLayer is not present (SSR, test env).
 */

type DataLayerEntry = Record<string, unknown>;

export function pushEvent(payload: DataLayerEntry): void {
  if (globalThis.window === undefined) return;
  const win = globalThis.window as Window & { dataLayer?: DataLayerEntry[] };
  win.dataLayer = win.dataLayer ?? [];
  win.dataLayer.push(payload);
}

export function trackPageView(url: string, title?: string): void {
  const pageTitle = typeof document === 'undefined' ? '' : document.title;
  pushEvent({
    event: 'page_view',
    page_location: url,
    page_title: title ?? pageTitle,
  });
}

export interface GTMItem {
  item_id: string | number;
  item_name: string;
  item_category?: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
}

export function trackAddToCart(item: GTMItem, value?: number, currency = 'GBP'): void {
  pushEvent({
    event: 'add_to_cart',
    ecommerce: {
      currency,
      value: value ?? item.price ?? 0,
      items: [{ quantity: 1, ...item }],
    },
  });
}

export function trackBeginCheckout(item: GTMItem, value?: number, currency = 'GBP'): void {
  pushEvent({
    event: 'begin_checkout',
    ecommerce: {
      currency,
      value: value ?? item.price ?? 0,
      items: [{ quantity: 1, ...item }],
    },
  });
}

export function trackAddPaymentInfo(item: GTMItem, value?: number, currency = 'GBP'): void {
  pushEvent({
    event: 'add_payment_info',
    ecommerce: {
      currency,
      value: value ?? item.price ?? 0,
      payment_type: 'Credit Card',
      items: [{ quantity: 1, ...item }],
    },
  });
}

export function trackPurchase(
  transactionId: string,
  item: GTMItem,
  value: number,
  currency = 'GBP',
): void {
  pushEvent({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      currency,
      value,
      items: [{ quantity: 1, ...item }],
    },
  });
}