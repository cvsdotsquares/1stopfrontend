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

function withAttendeeCount(item: GTMItem): Record<string, unknown> {
  const { quantity, ...rest } = item;
  return {
    ...rest,
    no_of_attendee: quantity ?? 1,
  };
}

export function trackAddToCart(item: GTMItem, value?: number, currency = 'GBP'): void {
  pushEvent({
    event: 'add_to_cart',
    ecommerce: {
      currency,
      value: value ?? item.price ?? 0,
      items: [withAttendeeCount(item)],
    },
  });
}

export function trackBeginCheckout(item: GTMItem, value?: number, currency = 'GBP'): void {
  pushEvent({
    event: 'begin_checkout',
    ecommerce: {
      currency,
      value: value ?? item.price ?? 0,
      items: [withAttendeeCount(item)],
    },
  });
}

export function trackCheckout(item: GTMItem, value?: number, currency = 'GBP'): void {
  pushEvent({
    event: 'checkout',
    ecommerce: {
      currency,
      value: value ?? item.price ?? 0,
      items: [withAttendeeCount(item)],
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
      items: [withAttendeeCount(item)],
    },
  });
}

export function trackPurchase(
  transactionId: string,
  itemOrItems: GTMItem | GTMItem[],
  value: number,
  currency = 'GBP',
  paymentType = 'Credit Card',
): void {
  const normalizedItems = Array.isArray(itemOrItems)
    ? itemOrItems.map((item) => withAttendeeCount(item))
    : [withAttendeeCount(itemOrItems)];

  pushEvent({
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      booking_ref: transactionId,
      currency,
      value,
      payment_type: paymentType,
      items: normalizedItems,
    },
  });
}