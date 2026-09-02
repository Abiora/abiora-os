import type { NextConfig } from "next";

// Next.js's own hydration relies on inline <script> tags (self.__next_f.push(...))
// and styled-jsx injects inline <style> tags throughout this app (generated/, login/,
// signup/, architect/) — both require 'unsafe-inline' without nonce-based CSP wiring,
// which is a larger change than this pass covers. This CSP still blocks loading any
// externally-hosted script/style/resource and restricts where the page can navigate,
// connect, embed, or submit forms to — a real, if partial, hardening step.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
