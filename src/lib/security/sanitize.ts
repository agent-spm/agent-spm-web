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

/**
 * Validates that an outbound webhook URL uses HTTPS and targets a public internet host
 * (blocks localhost, loopback, private RFC1918 CIDRs, and cloud metadata IPs to prevent SSRF).
 */
export function isSafePublicWebhookUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "::1" ||
    host === "[::1]"
  ) {
    return false;
  }

  // Block raw IPv4 private, loopback, link-local, and metadata ranges
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    ) {
      return false;
    }
  }

  return true;
}
