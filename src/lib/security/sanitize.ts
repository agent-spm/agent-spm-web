/**
 * Security sanitization, safe encoding, and trusted origin utilities.
 */

/**
 * Escapes HTML metacharacters to prevent injection inside email templates.
 */
export function escapeHtml(input: unknown): string {
  const str = String(input ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes CSV cell values to prevent spreadsheet formula injection (CWE-1236).
 * Prefixes cells starting with =, +, -, @, tab, or CR with a single quote.
 */
export function escapeCsvCell(input: unknown): string {
  const raw = String(input ?? "");
  const trimmedStart = raw.replace(/^[\u0000-\u0020]+/, "");
  const needsPrefix = /^[=+\-@\t\r]/.test(trimmedStart) || /^[\t\r]/.test(raw);
  const safeVal = needsPrefix ? `'${raw}` : raw;
  return `"${safeVal.replace(/"/g, '""')}"`;
}

/**
 * Serializes JSON-LD safely for inline <script type="application/ld+json">
 * by escaping `<` so `</script>` cannot break out of the script tag.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * Resolves a trusted base origin for OAuth / SAML redirects without blindly
 * trusting an arbitrary client Origin header.
 */
export function getTrustedOrigin(request: Request): string {
  const reqOrigin = new URL(request.url).origin;
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  const allowedOrigins = new Set<string>([
    reqOrigin,
    "http://localhost:3000",
    "https://agent-spm.com",
    "https://www.agent-spm.com",
  ]);

  if (configuredUrl) {
    try {
      allowedOrigins.add(new URL(configuredUrl).origin);
    } catch {
      // Ignore malformed env URL
    }
  }

  const headerOrigin = request.headers.get("origin");
  if (headerOrigin && allowedOrigins.has(headerOrigin)) {
    return headerOrigin;
  }

  return reqOrigin;
}

/**
 * Validates that a domain or organization slug contains only safe identifier characters
 * so it can never manipulate PostgREST filter syntax.
 */
export function sanitizeIdentifier(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-z0-9._-]/g, "");
}
