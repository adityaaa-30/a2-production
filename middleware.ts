import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory sliding window rate limiter for Edge Runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 10; // 10 requests
const WINDOW_MS = 60 * 1000; // per 1 minute

function cleanRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security checks to API routes
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // 1. Method restriction & CSRF check for state-changing requests
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return NextResponse.json(
              { error: "Forbidden: Cross-origin request rejected" },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Invalid Origin header" },
            { status: 400 }
          );
        }
      }
    }

    // 2. Request body size check (Max 100KB for API requests)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 100) {
      return NextResponse.json(
        { error: "Payload too large. Maximum 100KB allowed." },
        { status: 413 }
      );
    }

    // 3. IP-based Rate Limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "127.0.0.1";

    cleanRateLimitMap();
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip);

    if (clientRecord) {
      if (now > clientRecord.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      } else {
        clientRecord.count += 1;
        if (clientRecord.count > MAX_REQUESTS) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            {
              status: 429,
              headers: {
                "Retry-After": "60",
                "X-RateLimit-Limit": String(MAX_REQUESTS),
                "X-RateLimit-Remaining": "0",
              },
            }
          );
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
