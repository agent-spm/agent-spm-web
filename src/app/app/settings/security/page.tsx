"use client";

import React, { useState } from "react";
import {
  Building2,
  Copy,
  Check,
  Smartphone,
  Laptop,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [idp, setIdp] = useState("okta");
  const [copiedAcs, setCopiedAcs] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState(false);

  // 2FA state
  const [require2fa, setRequire2fa] = useState(true);
  const [gracePeriod, setGracePeriod] = useState("7 days");
  const [allowedFactors, setAllowedFactors] = useState("totp_webauthn");

  // Sessions
  const [sessionDuration, setSessionDuration] = useState("8 hours");
  const [concurrentSessions, setConcurrentSessions] = useState("3");

  const acsUrl = "https://auth.agent-spm.com/sso/saml/v1/acme-labs/callback";
  const entityId = "https://agent-spm.com/saml/metadata/acme-labs";
  const [cert, setCert] = useState(`-----BEGIN CERTIFICATE-----
MIIDpDCCAoygAwIBAgIGAXk4f31cMA0GCSqGSIb3DQEBCwUAMIGSMQswCQYDVQQG
EwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNj
bzESMBAGA1UECgwJT2t0YSwgSW5jMRMwEQYDVQQLDApUZWNoIFN1cHBvcnQxEjAQ
BgNVBAMMCWFjbWUtbGFiczAeFw0yNjAxMDEwODAwMDBaFw0yODAxMDEwODAwMDBa
-----END CERTIFICATE-----`);

  const handleCopy = (text: string, isAcs: boolean) => {
    navigator.clipboard.writeText(text);
    if (isAcs) {
      setCopiedAcs(true);
      setTimeout(() => setCopiedAcs(false), 2000);
    } else {
      setCopiedEntity(true);
      setTimeout(() => setCopiedEntity(false), 2000);
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── SAML 2.0 SINGLE SIGN-ON (ENTERPRISE) ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1B5FED]" />
              <h3 className="text-base font-semibold text-black">SAML 2.0 Single Sign-On</h3>
              <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                ● ACTIVE
              </span>
            </div>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Enforce enterprise authentication via your organization Identity Provider (IdP)
            </p>
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-black cursor-pointer select-none">
            <span className="text-black/70">Enable SAML SSO:</span>
            <input
              type="checkbox"
              checked={ssoEnabled}
              onChange={(e) => setSsoEnabled(e.target.checked)}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4"
            />
          </label>
        </div>

        {ssoEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  Identity Provider
                </label>
                <select
                  value={idp}
                  onChange={(e) => setIdp(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                >
                  <option value="okta">Okta Enterprise SAML</option>
                  <option value="azure">Microsoft Entra ID (Azure AD)</option>
                  <option value="google">Google Workspace SAML</option>
                  <option value="ping">PingIdentity</option>
                </select>
                <div className="mt-1 text-[11px] font-mono text-emerald-700 font-medium">
                  Last verified: Today at 04:12 UTC (Connection healthy)
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  Single Sign-On URL
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://acme-labs.okta.com/app/agent-spm/sso/saml"
                  className="w-full rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-xs font-mono text-black/70"
                />
              </div>
            </div>

            {/* Readonly URLs for IdP */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Assertion Consumer Service (ACS) URL
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/10 bg-black/[0.02] text-black">
                  <span className="truncate mr-2 font-medium">{acsUrl}</span>
                  <button
                    onClick={() => handleCopy(acsUrl, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-black/10 hover:bg-black/5 text-black font-mono text-[11px] uppercase flex-shrink-0 shadow-xs cursor-pointer"
                  >
                    {copiedAcs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black/60" />}
                    <span>{copiedAcs ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Entity ID / Issuer URL
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-black/10 bg-black/[0.02] text-black">
                  <span className="truncate mr-2 font-medium">{entityId}</span>
                  <button
                    onClick={() => handleCopy(entityId, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-black/10 hover:bg-black/5 text-black font-mono text-[11px] uppercase flex-shrink-0 shadow-xs cursor-pointer"
                  >
                    {copiedEntity ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black/60" />}
                    <span>{copiedEntity ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* X509 Certificate PEM */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                X.509 Signing Certificate (PEM)
              </label>
              <textarea
                rows={4}
                value={cert}
                onChange={(e) => setCert(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-black/[0.02] p-2.5 font-mono text-[11px] text-black/80 focus:border-[#1B5FED] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => alert("SAML connection test succeeded: Okta IdP returned signed Assertion.")}
                className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-semibold shadow-xs cursor-pointer"
              >
                Test SSO Connection
              </button>
              <button
                onClick={() => alert("Downloaded SP metadata XML file.")}
                className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase shadow-xs cursor-pointer"
              >
                View Metadata XML
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── TWO-FACTOR AUTHENTICATION (2FA) ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
          <div>
            <h3 className="text-base font-semibold text-black">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Enforce secondary hardware or authenticator tokens for all workspace members
            </p>
          </div>

          <label className="flex items-center gap-2 font-mono text-xs text-black cursor-pointer select-none">
            <span className="text-black/70">Require 2FA for all members:</span>
            <input
              type="checkbox"
              checked={require2fa}
              onChange={(e) => setRequire2fa(e.target.checked)}
              className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-4 h-4"
            />
          </label>
        </div>

        {/* Compliance Progress Bar per spec */}
        <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-black font-bold">5 of 6 Members Enrolled (83%)</span>
            <button
              onClick={() => alert("Sent 2FA setup reminder to non-enrolled member: Elena Rostova")}
              className="text-[#1B5FED] font-semibold hover:underline"
            >
              Send Reminder →
            </button>
          </div>
          <div className="h-2.5 w-full rounded-full bg-black/5 overflow-hidden">
            <div style={{ width: "83%" }} className="h-full rounded-full bg-[#1B5FED]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Enforcement Grace Period
            </label>
            <select
              value={gracePeriod}
              onChange={(e) => setGracePeriod(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="immediate">Immediate (Block instantly)</option>
              <option value="3 days">3 Days</option>
              <option value="7 days">7 Days (Recommended)</option>
              <option value="14 days">14 Days</option>
            </select>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Allowed Factors
            </label>
            <select
              value={allowedFactors}
              onChange={(e) => setAllowedFactors(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="totp_webauthn">TOTP (Google Auth, 1Password) & WebAuthn / Passkeys</option>
              <option value="webauthn_only">WebAuthn Hardware Security Keys Only (FIDO2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── SESSION MANAGEMENT ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
        <div className="pb-4 border-b border-black/10">
          <h3 className="text-base font-semibold text-black">Active Sessions & Timeouts</h3>
          <p className="text-xs font-mono text-black/60 mt-0.5">Control token expiration and active browser instances</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Max Session Duration
            </label>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="4 hours">4 Hours</option>
              <option value="8 hours">8 Hours (Standard Workday)</option>
              <option value="24 hours">24 Hours</option>
              <option value="7 days">7 Days</option>
            </select>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
              Concurrent Sessions Per User
            </label>
            <select
              value={concurrentSessions}
              onChange={(e) => setConcurrentSessions(e.target.value)}
              className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
            >
              <option value="1">1 Session (Strict)</option>
              <option value="3">3 Sessions</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
        </div>

        {/* Active Sessions List */}
        <div className="space-y-2 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Laptop className="w-5 h-5 text-emerald-700" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-950">macOS 15.1 • Chrome 130</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    THIS DEVICE
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5 font-sans">IP: 192.0.2.42 (San Francisco, US) • Active right now</div>
              </div>
            </div>
            <span className="text-emerald-800 text-xs font-semibold">Current</span>
          </div>

          <div className="p-3.5 rounded-xl border border-black/10 bg-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-black/50" />
              <div>
                <div className="font-bold text-black">iPhone 16 Pro • Safari</div>
                <div className="text-[11px] text-black/60 mt-0.5 font-sans">IP: 198.51.100.12 (San Jose, US) • Last active 3 hours ago</div>
              </div>
            </div>
            <button
              onClick={() => alert("Session revoked on other device.")}
              className="px-3 py-1 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono transition-colors shadow-xs"
            >
              Revoke
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}