import { NextResponse, type NextRequest } from "next/server";

/**
 * Site-wide middleware.
 *
 * Two responsibilities:
 *
 *   1. Maintenance mode — when the server-side env var `MAINTENANCE_MODE` is
 *      set to "true", every public request is rewritten to /maintenance and
 *      served with HTTP 503 + a Retry-After header so search engines treat
 *      the outage as temporary.
 *
 *   2. Path exposure — every passthrough request gets an `x-pathname`
 *      request header so server components (e.g. the root layout) can read
 *      the current URL via `headers()` and adjust chrome accordingly (we use
 *      this to hide the global Header/Footer on /maintenance).
 *
 * Bypass:
 *   - Visit any URL with `?maintenance_bypass=<MAINTENANCE_BYPASS_TOKEN>` to
 *     drop a `maintenance-bypass` cookie that lets you preview the live site
 *     while everyone else still sees the maintenance page. The cookie lasts
 *     1 hour. Useful for QA / smoke-testing during a deploy window.
 *   - `MAINTENANCE_BYPASS_TOKEN` is a server-only env var; if it's unset the
 *     bypass mechanism is disabled entirely.
 */

const BYPASS_QUERY_PARAM = "maintenance_bypass";
const BYPASS_COOKIE = "maintenance-bypass";
const BYPASS_COOKIE_MAX_AGE_SECONDS = 60 * 60; // 1 hour
const RETRY_AFTER_SECONDS = 60 * 30; // 30 min hint to bots/clients

// Paths that must always pass through, even during maintenance. Static assets
// and Next internals are already excluded by the matcher below; this list is
// for things matched by the matcher that we still want to serve normally.
const ALWAYS_ALLOWED_PATHS: readonly string[] = [
  "/maintenance",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
];

function isMaintenanceModeEnabled(): boolean {
  return String(process.env.MAINTENANCE_MODE ?? "").toLowerCase() === "true";
}

function isPathAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Always expose the current path to server components downstream.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // ---- Maintenance bypass: allow opt-in preview via signed query token ----
  const bypassToken = process.env.MAINTENANCE_BYPASS_TOKEN || "";
  const queryToken = nextUrl.searchParams.get(BYPASS_QUERY_PARAM);

  if (bypassToken && queryToken && queryToken === bypassToken) {
    // Clean the token out of the URL and drop a cookie so the rest of the
    // session can browse the live site even while maintenance mode is on.
    const cleanUrl = nextUrl.clone();
    cleanUrl.searchParams.delete(BYPASS_QUERY_PARAM);
    const response = NextResponse.redirect(cleanUrl);
    // Intentionally NOT httpOnly: the same token must be readable by client
    // JS so the axios layer can forward it to the backend as
    // `X-Maintenance-Bypass`, otherwise an admin previewing the site would
    // see the maintenance page in every backend response. The token isn't a
    // session credential — anyone who already has it can use it via the
    // query string anyway, so dropping httpOnly doesn't change the security
    // posture.
    response.cookies.set(BYPASS_COOKIE, bypassToken, {
      path: "/",
      maxAge: BYPASS_COOKIE_MAX_AGE_SECONDS,
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  const hasValidBypassCookie =
    !!bypassToken && request.cookies.get(BYPASS_COOKIE)?.value === bypassToken;

  // ---- Maintenance gate ----
  if (
    isMaintenanceModeEnabled() &&
    !hasValidBypassCookie &&
    !isPathAlwaysAllowed(pathname)
  ) {
    const url = nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";

    const response = NextResponse.rewrite(url, {
      status: 503,
      headers: {
        "Retry-After": String(RETRY_AFTER_SECONDS),
        "Cache-Control": "no-store, must-revalidate",
        "x-pathname": "/maintenance",
      },
      request: { headers: requestHeaders },
    });
    return response;
  }

  // Normal passthrough — just forward the augmented request headers.
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * Run middleware on every request EXCEPT:
 *   - Next.js internals (_next/static, _next/image)
 *   - Common static assets we never want to gate
 *
 * We still run on /api/* and on the maintenance page itself; the body of
 * `middleware` handles those cases explicitly above.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|woff|woff2|ttf|eot)$).*)",
  ],
};
