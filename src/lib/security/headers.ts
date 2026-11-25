/**
 * HTTP security headers for the Next.js application.
 * Applied via next.config.ts async headers().
 */

const isDev = process.env.NODE_ENV === "development";

export const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} 'wasm-unsafe-eval' https://checkout.razorpay.com https://unpkg.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://avatars.githubusercontent.com https://cdn.spm.dev https:",
  "connect-src 'self' blob: https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://prod.spline.design https://*.spline.design https://unpkg.com https://www.gstatic.com https://raw.githack.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "worker-src 'self' blob:",
  "child-src 'self' blob: https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.razorpay.com https://api.razorpay.com https://*.supabase.co https://github.com",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

export const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(self "https://checkout.razorpay.com")',
  },
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
];
