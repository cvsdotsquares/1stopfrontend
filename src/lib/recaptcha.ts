function waitForGrecaptcha(timeoutMs = 8000): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);

  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha?.execute) {
        resolve(grecaptcha);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 100);
    };
    tick();
  });
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === 'undefined') return '';

  const grecaptcha = await waitForGrecaptcha();
  if (!grecaptcha?.execute) return '';

  return new Promise((resolve) => {
    const run = () => {
      grecaptcha
        .execute(siteKey, { action })
        .then((token: string) => resolve(token || ''))
        .catch(() => resolve(''));
    };

    if (typeof grecaptcha.ready === 'function') {
      grecaptcha.ready(run);
    } else {
      run();
    }
  });
}
