/**
 * Webmail Deep-Linking Utility (Vercel-style Gmail & Webmail OTP Search)
 *
 * Provides intelligent deep-links into the user's specific mailbox with:
 * 1. Multi-account disambiguation via Google's `?authuser={email}` parameter.
 *    This ensures that when a user has multiple Google accounts (e.g. u/0, u/1),
 *    clicking the link switches directly to the mailbox that requested the OTP.
 * 2. In-app search filtering (`in:anywhere "Agent SPM"`) across Inbox, Spam,
 *    Trash, Updates, and Promotions folders.
 * 3. Provider detection for Gmail, Outlook, Yahoo, Proton, and iCloud.
 */

export interface WebmailInfo {
  provider: "gmail" | "outlook" | "yahoo" | "proton" | "icloud" | "default";
  label: string;
  url: string;
}

export function getWebmailInfo(email: string): WebmailInfo | null {
  if (!email || !email.includes("@")) return null;

  const cleanEmail = email.trim().toLowerCase();
  const domain = cleanEmail.split("@")[1];
  if (!domain) return null;

  // 1. Google Mail & Google Workspace
  if (domain === "gmail.com" || domain === "googlemail.com") {
    // Encodes: in:anywhere "Agent SPM"
    const searchQuery = encodeURIComponent('in:anywhere "Agent SPM"');
    return {
      provider: "gmail",
      label: "Open Gmail",
      url: `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(cleanEmail)}#search/${searchQuery}`,
    };
  }

  // 2. Microsoft Outlook / Hotmail / Live
  if (
    domain === "outlook.com" ||
    domain === "hotmail.com" ||
    domain === "live.com" ||
    domain === "msn.com"
  ) {
    return {
      provider: "outlook",
      label: "Open Outlook",
      url: `https://outlook.live.com/mail/0/search?q=%22Agent%20SPM%22`,
    };
  }

  // 3. Yahoo Mail
  if (
    domain === "yahoo.com" ||
    domain === "ymail.com" ||
    domain === "myyahoo.com"
  ) {
    return {
      provider: "yahoo",
      label: "Open Yahoo Mail",
      url: `https://mail.yahoo.com/d/search/keyword=Agent%20SPM`,
    };
  }

  // 4. Proton Mail
  if (domain === "proton.me" || domain === "protonmail.com") {
    return {
      provider: "proton",
      label: "Open Proton Mail",
      url: `https://mail.proton.me/u/0/almost-all-mail#keyword=Agent+SPM`,
    };
  }

  // 5. Apple iCloud Mail
  if (domain === "icloud.com" || domain === "me.com" || domain === "mac.com") {
    return {
      provider: "icloud",
      label: "Open iCloud Mail",
      url: `https://www.icloud.com/mail`,
    };
  }

  // 6. Custom or Corporate Domains:
  // Many developers use Google Workspace on custom domains. Providing a Gmail authuser link
  // allows Workspace users to open their corporate inbox directly.
  const searchQuery = encodeURIComponent('in:anywhere "Agent SPM"');
  return {
    provider: "default",
    label: "Open Gmail",
    url: `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(cleanEmail)}#search/${searchQuery}`,
  };
}
