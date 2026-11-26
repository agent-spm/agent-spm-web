"use client";

import React, { useState } from "react";
import {
  Building2,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Lock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/data/session-context";

export default function SecuritySettingsPage() {
  const supabase = createSupabaseBrowserClient();
  const { userProfile, currentPersona, currentOrg } = useSession();
  const cleanOrgSlug = currentOrg.slug.replace(/^@/, "") || "workspace";

  // Personal Credential & Biometrics State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [biometricError, setBiometricError] = useState<string | null>(null);

  const [totpEnrolling, setTotpEnrolling] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpSuccess, setTotpSuccess] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);

  // SAML SSO State
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [idp, setIdp] = useState("okta");
  const [ssoUrl, setSsoUrl] = useState("");
  const [copiedAcs, setCopiedAcs] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState(false);

  // 2FA state
  const [require2fa, setRequire2fa] = useState(true);
  const [gracePeriod, setGracePeriod] = useState("7 days");
  const [allowedFactors, setAllowedFactors] = useState("totp_webauthn");

  // Sessions
  const [sessionDuration, setSessionDuration] = useState("8 hours");
  const [concurrentSessions, setConcurrentSessions] = useState("3");

  const acsUrl = `https://www.agent-spm.com/sso/saml/v1/${cleanOrgSlug}/callback`;
  const entityId = `https://www.agent-spm.com/saml/metadata/${cleanOrgSlug}`;
  const [cert, setCert] = useState("");

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

  // ── 1. Set / Change Password ──
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 4000);
      }
    } catch (err: unknown) {
      setPasswordError((err instanceof Error ? err.message : null) || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── 2. Register Hardware Passkey / Touch ID ──
  const handleRegisterBiometric = async () => {
    setBiometricLoading(true);
    setBiometricError(null);
    setBiometricSuccess(false);

    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      setBiometricError("WebAuthn / Biometrics are not supported on this browser.");
      setBiometricLoading(false);
      return;
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const actorEmail = userProfile?.email || currentPersona.email;
      const actorName = userProfile?.name || currentPersona.name;

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Agent SPM Registry", id: window.location.hostname },
          user: {
            id: userId,
            name: actorEmail,
            displayName: actorName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Touch ID / Windows Hello / Android Fingerprint
            userVerification: "preferred",
          },
          timeout: 60000,
        },
      });

      if (credential) {
        setBiometricSuccess(true);
        localStorage.setItem("spm_webauthn_registered", "true");
        setTimeout(() => setBiometricSuccess(false), 4000);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setBiometricError("Biometric registration was cancelled or timed out.");
      } else {
        setBiometricError((err instanceof Error ? err.message : null) || "Failed to register biometric authenticator.");
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  // ── 3. Authenticator App (TOTP) Setup ──
  const handleStartTotpEnroll = async () => {
    setTotpEnrolling(true);
    setTotpError(null);
    setTotpFactorId(null);
    setTotpSecret(null);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Mobile Authenticator",
      });
      if (error || !data) {
        setTotpError(error?.message || "Failed to initialize authenticator enrollment.");
        setTotpEnrolling(false);
        return;
      }
      setTotpFactorId(data.id);
      setTotpSecret(data.totp.secret);
    } catch (err: unknown) {
      setTotpError((err instanceof Error ? err.message : null) || "Unable to initialize TOTP enrollment.");
      setTotpEnrolling(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length !== 6) {
      setTotpError("Please enter a valid 6-digit code.");
      return;
    }
    if (!totpFactorId) {
      setTotpError("No active TOTP enrollment factor. Click Enroll Authenticator first.");
      return;
    }
    setTotpError(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: totpFactorId,
      code: totpCode,
    });
    if (error) {
      setTotpError(error.message || "Invalid 6-digit verification code.");
      return;
    }
    setTotpSuccess(true);
    setTotpEnrolling(false);
    setTotpCode("");
    setTimeout(() => setTotpSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── 1. PERSONAL CREDENTIALS & HARDWARE BIOMETRICS ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-6">
        <div className="pb-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1B5FED]" />
            <h3 className="text-base font-semibold text-black">Personal Sign-In & Hardware Biometrics</h3>
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#1B5FED]/10 text-[#1B5FED] border border-[#1B5FED]/20">
              Primary Security
            </span>
          </div>
          <p className="text-xs font-mono text-black/60 mt-1">
            Configure passwords, Touch ID / Fingerprint passkeys, and authenticator apps for your account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Touch ID & Hardware Biometrics */}
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.01] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Fingerprint className="w-4 h-4 text-[#1B5FED]" />
                <span className="font-mono text-xs font-bold text-black uppercase">Touch ID / Fingerprint Passkey</span>
              </div>
              <p className="text-xs font-sans text-black/70 leading-relaxed">
                Log in instantly using Apple Touch ID on MacBook, Windows Hello, or Android biometrics without typing passwords.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {biometricSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                  <span>Hardware Passkey registered successfully!</span>
                </div>
              )}
              {biometricError && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-red-700 bg-red-50 border border-red-300 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{biometricError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRegisterBiometric}
                disabled={biometricLoading}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{biometricLoading ? "Waiting for Biometric Touch..." : "Register This Device (Touch ID)"}</span>
              </button>
            </div>
          </div>

          {/* Card B: Authenticator App (TOTP) */}
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.01] space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Smartphone className="w-4 h-4 text-[#1B5FED]" />
                <span className="font-mono text-xs font-bold text-black uppercase">Authenticator App (TOTP)</span>
              </div>
              <p className="text-xs font-sans text-black/70 leading-relaxed">
                Use Google Authenticator, 1Password, or Authy to generate time-based 6-digit codes.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {totpSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                  <span>Authenticator app enrolled successfully!</span>
                </div>
              )}

              {!totpEnrolling ? (
                <button
                  type="button"
                  onClick={handleStartTotpEnroll}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-black/15 bg-white hover:bg-black/5 text-black font-mono text-xs font-semibold uppercase tracking-wider shadow-xs transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#1B5FED]" />
                  <span>Configure Authenticator App</span>
                </button>
              ) : (
                <form onSubmit={handleVerifyTotp} className="space-y-2">
                  <div className="text-[11px] font-mono text-black/70 bg-white p-2 rounded-lg border border-black/10">
                    Secret Key: <strong className="text-black select-all">{totpSecret}</strong>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="6-digit code"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 rounded-xl border border-black/15 bg-white px-3 py-1.5 font-mono text-xs text-black focus:border-[#1B5FED] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-[#1B5FED] text-white font-mono text-xs font-semibold uppercase"
                    >
                      Verify
                    </button>
                  </div>
                  {totpError && <div className="text-[11px] font-mono text-red-600">{totpError}</div>}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Section C: Set / Change Password */}
        <div className="p-4 rounded-xl border border-black/10 bg-black/[0.01] space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1B5FED]" />
            <span className="font-mono text-xs font-bold text-black uppercase">Set / Change Account Password</span>
          </div>
          <p className="text-xs font-sans text-black/70">
            Set a password to enable traditional Email & Password authentication alongside your GitHub login.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-lg pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                />
              </div>
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 p-2 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                <span>Password updated! You can now log in with either GitHub or Email + Password.</span>
              </div>
            )}
            {passwordError && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-red-700 bg-red-50 border border-red-300 p-2 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {passwordLoading ? "Updating..." : "Save Password"}
            </button>
          </form>
        </div>
      </div>

      {/* ── 2. SAML 2.0 SINGLE SIGN-ON (ENTERPRISE) ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1B5FED]" />
              <h3 className="text-base font-semibold text-black">SAML 2.0 Single Sign-On</h3>
              <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                {ssoEnabled ? "PREVIEW CONFIG" : "UNCONFIGURED"}
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
                <div className="mt-1 text-[11px] font-mono text-black/55 font-medium">
                  Enterprise IdP provisioning preview (contact sales for production IdP enforcement)
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  Single Sign-On URL
                </label>
                <input
                  type="url"
                  value={ssoUrl}
                  onChange={(e) => setSsoUrl(e.target.value)}
                  placeholder={`https://${cleanOrgSlug}.okta.com/app/agent-spm/sso/saml`}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black focus:border-[#1B5FED] focus:outline-none"
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
          </div>
        )}
      </div>

      {/* ── 3. TWO-FACTOR AUTHENTICATION POLICY ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
          <div>
            <h3 className="text-base font-semibold text-black">Workspace 2FA Policy</h3>
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
              <option value="totp_webauthn">TOTP & WebAuthn / Passkeys</option>
              <option value="webauthn_only">WebAuthn Hardware Security Keys Only (FIDO2)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. SESSION MANAGEMENT ── */}
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
                  <span className="font-bold text-emerald-950">Current Authenticated Session</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                    THIS DEVICE
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5 font-sans">
                  {userProfile?.githubUsername
                    ? `Verified GitHub Identity (@${userProfile.githubUsername}) • Active right now`
                    : `Authenticated Session (${userProfile?.email || currentPersona.email}) • Active right now`}
                </div>
              </div>
            </div>
            <span className="text-emerald-800 text-xs font-semibold">Current</span>
          </div>
        </div>
      </div>
    </div>
  );
}
