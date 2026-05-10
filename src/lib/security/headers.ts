/**
 * Security headers for the Next.js application.
 * Applied via next.config.ts headers() function.
 * 
 * NOTE: Supabase and Polar CSP connect-src entries are temporarily
 * kept as comments. Re-enable when backend services are connected.
 */

export const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      // Supabase & Polar connect-src temporarily removed
      // Re-enable: "connect-src 'self' blob: https://*.supabase.co https://api.polar.sh https://raw.githack.com",
      "connect-src 'self' blob: https://raw.githack.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];
