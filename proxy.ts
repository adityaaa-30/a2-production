import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_MAX_BODY_BYTES = 10 * 1024;
const API_RATE_LIMIT = 5;
const API_RATE_WINDOW_MS = 60 * 1000;
const apiRequests = new Map<string, { count: number; resetAt: number }>();

function getClientAddress(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function jsonError(message: string, status: number, retryAfter?: number) {
  const response = NextResponse.json({ error: message }, { status });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  if (retryAfter) response.headers.set("Retry-After", String(retryAfter));
  return response;
}

function checkApiRequest(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > API_MAX_BODY_BYTES) {
    return jsonError("Request body is too large.", 413);
  }

  const now = Date.now();
  for (const [address, record] of apiRequests) {
    if (now >= record.resetAt) apiRequests.delete(address);
  }
  if (apiRequests.size > 10000) {
    const oldestAddresses = apiRequests.keys();
    for (let index = 0; index < 1000; index += 1) {
      const oldest = oldestAddresses.next();
      if (oldest.done) break;
      apiRequests.delete(oldest.value);
    }
  }

  const address = getClientAddress(request);
  const record = apiRequests.get(address);
  if (record && now < record.resetAt) {
    record.count += 1;
    if (record.count > API_RATE_LIMIT) {
      return jsonError("Too many requests. Please try again shortly.", 429, 60);
    }
  } else {
    apiRequests.set(address, { count: 1, resetAt: now + API_RATE_WINDOW_MS });
  }

  return null;
}

function buildCsp(nonce: string, requestHost: string) {
  const isDev = process.env.NODE_ENV === "development";
  const devWebSocketOrigin = `ws://${requestHost}:*`;
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.supabase.co",
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isDev ? ` ws://localhost:* ws://127.0.0.1:* ${devWebSocketOrigin}` : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];
  return directives.join("; ");
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimitResponse = checkApiRequest(request);
    if (rateLimitResponse) return rateLimitResponse;
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, request.nextUrl.hostname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
