import type { NextConfig } from "next";

const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const parseOrigin = (value?: string): string | null => {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};
const publicSupabaseOrigin = parseOrigin(publicSupabaseUrl);
const publicSupabaseWebSocketOrigin = (() => {
  if (!publicSupabaseOrigin) return null;
  return publicSupabaseOrigin.replace(/^http/, "ws");
})();
const cdnOrigin =
  parseOrigin(process.env.NEXT_PUBLIC_CDN_URL) ??
  parseOrigin(process.env.R2_PUBLIC_URL);
const isHttpsDeployment =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") ?? false;
const enableHstsPreload = process.env.ENABLE_HSTS_PRELOAD === "true";
const isDevelopment = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} https://client.crisp.chat https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://client.crisp.chat",
  "img-src 'self' data: blob: https://client.crisp.chat",
  "font-src 'self' data: https://client.crisp.chat",
  `media-src 'self' blob: https://*.supabase.co https://*.r2.cloudflarestorage.com https://api.dictionaryapi.dev${publicSupabaseOrigin ? ` ${publicSupabaseOrigin}` : ""}${cdnOrigin ? ` ${cdnOrigin}` : ""}`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.r2.cloudflarestorage.com https://client.crisp.chat wss://client.relay.crisp.chat https://va.vercel-scripts.com https://vitals.vercel-insights.com${publicSupabaseOrigin ? ` ${publicSupabaseOrigin}` : ""}${publicSupabaseWebSocketOrigin ? ` ${publicSupabaseWebSocketOrigin}` : ""}${cdnOrigin ? ` ${cdnOrigin}` : ""}`,
  ...(isHttpsDeployment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(self)",
  },
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: enableHstsPreload
            ? "max-age=63072000; includeSubDomains; preload"
            : "max-age=31536000",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/offline.html",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    return ["reading", "listening", "writing", "speaking"].map((skill) => ({
      source: `/${skill}`,
      destination: `/practice/${skill}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
