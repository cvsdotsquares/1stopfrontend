'use client';

import { useCallback, useEffect, useState } from 'react';

export function formatRetryClock(seconds: number): string {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getRetryAfterSeconds(error: unknown, fallback = 0): number {
  const err = error as {
    response?: {
      status?: number;
      data?: { retryAfter?: number };
      headers?: Record<string, string>;
    };
  };
  const fromBody = Number(err?.response?.data?.retryAfter);
  if (Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody);

  const header = err?.response?.headers?.['retry-after'] ?? err?.response?.headers?.['Retry-After'];
  const fromHeader = parseInt(String(header || ''), 10);
  if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;

  if (err?.response?.status === 429 && fallback > 0) return fallback;
  return 0;
}

export function useRetryTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const start = useCallback((seconds: number) => {
    const value = Math.max(0, Math.ceil(Number(seconds) || 0));
    if (value <= 0) return;
    setEndsAt(Date.now() + value * 1000);
  }, []);

  useEffect(() => {
    if (!endsAt) {
      setSecondsLeft(0);
      return;
    }

    const tick = () => {
      const left = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) setEndsAt(null);
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return {
    secondsLeft,
    isWaiting: secondsLeft > 0,
    start,
    clock: formatRetryClock(secondsLeft),
  };
}
