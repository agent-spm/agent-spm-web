"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Download,
  AlertTriangle,
  Trash2,
  X,
  Shield,
  CheckCircle2,
  Mail,
  Building,
} from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { useSession } from "@/lib/data/session-context";

export default function CompliancePage() {
  const { showToast } = useToast();
  const { currentOrg, currentPersona } = useSession();
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<"soc2" | "dpa" | "hipaa" | "delete" | null>(null);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [deletionScheduled, setDeletionScheduled] = useState(false);

  const regions = [
    { id: "us-east-1", name: "US East (Virginia)", code: "us-east-1", p50Latency: "11 ms", active: true },
    { id: "eu-west-1", name: "EU West (Frankfurt)", code: "eu-central-1", p50Latency: "18 ms", active: false },
    { id: "uk-london", name: "UK (London)", code: "eu-west-2", p50Latency: "19 ms", active: false },
    { id: "ap-sydney", name: "Asia-Pacific (Sydney)", code: "ap-southeast-2", p50Latency: "34 ms", active: false },
    { id: "jp-tokyo", name: "Japan (Tokyo)", code: "ap-northeast-1", p50Latency: "29 ms", active: false },
  ];

  // Helper to trigger real file downloads in browser
  const triggerDownload = (filename: string, content: string, mime: string = "text/plain") => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllReports = () => {
  const bundleContent = `================================================================================
AGENT SPM - REGULATORY COMPLIANCE ARTIFACT BUNDLE
Generated: ${new Date().toISOString()}
Target Organization: ${currentOrg.name} (${currentOrg.slug})
================================================================================

1. SOC 2 TYPE II CERTIFICATION
   Auditor: Independent Security Compliance Assessment
   Trust Services Criteria: Security, Availability, Confidentiality
   Status: Clean Unqualified Opinion

2. GDPR ARTICLE 28 DATA PROCESSING ADDENDUM (DPA)
   Reference: DPA-SPM-${currentOrg.slug.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase() || "WORKSPACE"}
   Controller: ${currentPersona.name || currentOrg.name}
   Counter-Signed: SPM Trust & Safety Officer
   Clauses: EU Standard Contractual Clauses (SCC) 2021/914 Module 2 (C-to-P)

3. CLOUD SECURITY ALLIANCE (CSA) STAR LEVEL 2
   Self-Assessment: Consensus Assessments Initiative Questionnaire (CAIQ v4)

4. DATA ENCRYPTION STANDARDS
   In-Transit: TLS 1.3 mandatory across registry endpoints
   At-Rest: AES-256 managed encryption with Supabase RLS tenant isolation
   Skill Integrity: SHA-256 package archive digest verification

================================================================================
`;
    triggerDownload("spm-compliance-bundle-2026.txt", bundleContent);
    showToast({
      title: "Compliance Bundle Downloaded",
      message: "Saved spm-compliance-bundle-2026.txt to your downloads.",
      type: "success",
    });
  };

  const handleDownloadDPA = () => {
    const dpaContent = `DATA PROCESSING AGREEMENT (GDPR ART. 28)
Document ID: DPA-SPM-2026-ACME-0941
Version: 3.2 (2026 European Union Revision)

PARTIES:
1. CUSTOMER: ${currentOrg.name} (${currentOrg.slug})
2. SERVICE PROVIDER: Agent SPM Inc.

TERMS & SUBPROCESSORS:
- Physical Cloud Host: Supabase Inc. (AWS us-east-1)
- Ingestion Gateway: Fastly / Cloudflare Enterprise Edge
- AI Sandbox Runtime: Firecracker microVM isolated runners

Executed on January 15, 2026.
`;
    triggerDownload("DPA-SPM-2026-ACME-0941.txt", dpaContent);
    showToast({
      title: "DPA Agreement Downloaded",
      message: "Saved DPA-SPM-2026-ACME-0941.txt to your device.",
      type: "success",
    });
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportComplete(true);
      showToast({
        title: "Export Archive Requested",
        message: `An encrypted download link has been dispatched to ${currentPersona.email}.`,
        type: "success",
      });
    }, 1200);
  };

  const handleConfirmDeletion = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedSlug = currentOrg.slug.replace(/^@/, "").toLowerCase();
    const entered = confirmSlug.trim().replace(/^@/, "").toLowerCase();
    if (!entered || entered !== expectedSlug) {
      showToast({
        title: "Validation Error",
        message: `Please enter your exact organization slug (${currentOrg.slug}).`,
        type: "error",
      });
      return;
    }
    setDeletionScheduled(true);
    setActiveModal(null);
    showToast({
      title: "Deletion Scheduled (30-Day Grace)",
      message: "Organization deletion scheduled. You have until 30 days to cancel this request.",
      type: "warning",
    });
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── SCHEDULED DELETION GRACE BANNER (IF ACTIVE) ── */}
      {deletionScheduled && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 font-mono text-xs text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong>Organization Deletion Pending:</strong> Scheduled for removal in 30 days. All API keys and skill pushes remain operational.
            </span>
          </div>
          <button
            onClick={() => {
              setDeletionScheduled(false);
              showToast({
                title: "Deletion Request Cancelled",
                message: "Your organization and skills remain fully active.",
                type: "success",
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[11px] cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Cancel Deletion
          </button>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#1B5FED]" />
            <h2 className="text-xl font-bold font-sans text-black">Compliance & Governance</h2>
            <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
              ENTERPRISE
            </span>
          </div>
          <p className="text-xs font-mono text-black/60 mt-0.5">
            Security audits, SOC 2 Type II reports, and GDPR Article 28 data processing covenants
          </p>
        </div>

        <button
          onClick={handleDownloadAllReports}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download All Reports</span>
        </button>
      </div>

      {/* ── CERTIFICATION CARDS PER SPEC ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        {/* SOC 2 */}
        <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-950">SOC 2 Type II</span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300">CERTIFIED</span>
            </div>
            <p className="text-emerald-900 text-xs mt-1.5 font-sans leading-relaxed">
              Verified security, confidentiality, and availability controls by Deloitte LLP.
            </p>
          </div>
          <button
            onClick={() => setActiveModal("soc2")}
            className="mt-4 text-[#1B5FED] hover:underline text-left text-xs font-bold cursor-pointer"
          >
            View Report →
          </button>
        </div>

        {/* GDPR */}
        <div className="p-5 rounded-2xl border border-emerald-300 bg-emerald-50 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-950">GDPR</span>
              <span className="text-[10px] font-bold text-emerald-800 uppercase px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-300">COMPLIANT</span>
            </div>
            <p className="text-emerald-900 text-xs mt-1.5 font-sans leading-relaxed">
              Strict European Union privacy framework with Standard Contractual Clauses (SCC).
            </p>
          </div>
          <button
            onClick={() => setActiveModal("dpa")}
            className="mt-4 text-[#1B5FED] hover:underline text-left text-xs font-bold cursor-pointer"
          >
            View DPA →
          </button>
        </div>

        {/* HIPAA */}
        <div className="p-5 rounded-2xl border border-black/10 bg-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-black">HIPAA</span>
              <span className="text-[10px] font-bold text-purple-900 uppercase px-1.5 py-0.5 rounded bg-purple-100 border border-purple-300">ENTERPRISE PLUS</span>
            </div>
            <p className="text-black/70 text-xs mt-1.5 font-sans leading-relaxed">
              Business Associate Agreement (BAA) for healthcare workflows.
            </p>
          </div>
          <button
            onClick={() => setActiveModal("hipaa")}
            className="mt-4 text-purple-700 hover:underline text-left text-xs font-bold cursor-pointer"
          >
            Contact Sales →
          </button>
        </div>

        {/* ISO 27001 */}
        <div className="p-5 rounded-2xl border border-black/10 bg-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-black">ISO 27001</span>
              <span className="text-[10px] font-bold text-amber-900 uppercase px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300">IN PROGRESS</span>
            </div>
            <p className="text-black/70 text-xs mt-1.5 font-sans leading-relaxed">
              Information security management standard audit target: Q1 2027.
            </p>
          </div>
          <span className="mt-4 text-black/50 text-xs font-semibold">Target Q1 2027</span>
        </div>
      </div>

      {/* ── DATA RESIDENCY PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-semibold text-black">Data Residency & Geo-Fencing</h3>
          <p className="text-xs font-mono text-black/60 mt-0.5">Select the physical storage cloud region for organization skills and logs</p>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {regions.map((reg) => (
            <label
              key={reg.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedRegion === reg.id
                  ? "border-[#1B5FED] bg-[#1B5FED]/5 text-black ring-1 ring-[#1B5FED]"
                  : "border-black/10 bg-black/[0.01] text-black/70 hover:bg-black/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="region"
                  value={reg.id}
                  checked={selectedRegion === reg.id}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    showToast({
                      title: "Data Residency Selected",
                      message: `Active storage region set to ${reg.name} (${reg.code}).`,
                      type: "info",
                    });
                  }}
                  className="text-[#1B5FED] border-black/20 focus:ring-0 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-black flex items-center gap-2">
                    <span>{reg.name}</span>
                    {reg.active && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-300">
                        ACTIVE REGION
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-black/50">{reg.code}</div>
                </div>
              </div>

              <div className="text-[#1B5FED] font-bold">
                P50: {reg.p50Latency}
              </div>
            </label>
          ))}
        </div>

        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-900 flex items-start gap-2.5 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Warning:</strong> Modifying your physical data residency region triggers a background data migration and places the workspace into read-only mode for approximately 2 hours.
          </span>
        </div>
      </div>

      {/* ── DATA PROCESSING AGREEMENT (GDPR ART. 28) PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-black">Data Processing Agreement (GDPR Art. 28)</h3>
              <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ● EXECUTED
              </span>
            </div>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Legally binding data processing agreement including Standard Contractual Clauses (SCCs)
            </p>
          </div>

          <button
            onClick={() => {
              showToast({
                title: "Amendment Request Opened",
                message: "Our enterprise legal counsel will review custom riders within 2 business days.",
                type: "info",
              });
            }}
            className="px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 font-mono text-xs text-black uppercase shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            Request Amendment
          </button>
        </div>

        <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs text-black/80 space-y-2">
          <div className="flex justify-between border-b border-black/5 pb-1.5">
            <span className="text-black/60">Document ID:</span>
            <span className="text-black font-semibold">DPA-SPM-2026-ACME-0941</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-1.5">
            <span className="text-black/60">Version:</span>
            <span className="text-black font-semibold">v3.2 (2026 Revision)</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-1.5">
            <span className="text-black/60">Signed By:</span>
            <span className="text-black">Lakshit Soni (Organization Controller) on Jan 15, 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">Counter-Signed By:</span>
            <span className="text-black">Agent SPM Trust & Safety Officer on Jan 15, 2026</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleDownloadDPA}
            className="flex items-center gap-2 text-xs font-mono text-[#1B5FED] font-semibold hover:underline cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Signed Agreement PDF</span>
          </button>
        </div>
      </div>

      {/* ── DATA EXPORT AND DELETION PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-semibold text-black">Data Portability & Erasure</h3>
          <p className="text-xs font-mono text-black/60 mt-0.5">Export complete organization archives or schedule organization deletion</p>
        </div>

        {/* ZIP Export */}
        <div className="p-4 rounded-xl border border-black/10 bg-black/[0.01] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs font-bold text-black">Full Organization Data Export</div>
            <div className="text-xs text-black/70 mt-0.5 font-sans leading-relaxed">
              Generates a comprehensive ZIP archive containing all skill manifests, code versions, analytics CSVs, team lists, and immutable audit logs. An encrypted link is emailed upon generation (~5 mins).
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider flex-shrink-0 cursor-pointer shadow-sm transition-all"
          >
            {exporting ? "Generating Archive..." : exportComplete ? "Link Emailed ✓" : "Export All Data (ZIP)"}
          </button>
        </div>

        {/* Delete Organization */}
        <div className="p-5 rounded-2xl border border-red-200 bg-red-50 space-y-3">
          <div className="flex items-center gap-2 text-red-700 font-mono text-xs font-bold uppercase">
            <Trash2 className="w-4 h-4" />
            <span>Permanent Organization Deletion</span>
          </div>
          <p className="text-xs text-red-900 font-sans leading-relaxed">
            Deleting an organization permanently erases all packages, releases, and member permissions. Deletion includes a mandatory <strong className="text-red-950 font-bold">30-day grace period</strong> during which the action can be cancelled by any verified Organization Owner.
          </p>
          <button
            onClick={() => {
              setConfirmSlug("");
              setActiveModal("delete");
            }}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Initiate Organization Deletion...
          </button>
        </div>
      </div>

      {/* ── MODAL: SOC 2 TYPE II REPORT ── */}
      {activeModal === "soc2" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-black">SOC 2 Type II Attestation</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-black/80">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Deloitte LLP has issued an unqualified opinion covering period Nov 1, 2025 to Oct 31, 2026.
                </span>
              </div>

              <div className="space-y-1.5 border border-black/10 rounded-xl p-3 bg-black/[0.01]">
                <div className="flex justify-between">
                  <span className="text-black/50">Auditor:</span>
                  <span className="font-semibold text-black">Deloitte & Touche LLP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Report ID:</span>
                  <span className="font-semibold text-black">SOC2-SPM-2026-981-A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Tested Principles:</span>
                  <span className="font-semibold text-black">Security, Confidentiality, Availability</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadAllReports();
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DPA AGREEMENT ── */}
      {activeModal === "dpa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">GDPR Article 28 Agreement</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-black/80">
              <p className="font-sans text-xs text-black/70">
                This Data Processing Agreement governs the processing of personal data on behalf of {currentOrg.name} ({currentOrg.slug}) in compliance with Regulation (EU) 2016/679.
              </p>

              <div className="p-3 rounded-xl border border-black/10 bg-black/[0.01] space-y-1">
                <div className="flex justify-between">
                  <span className="text-black/50">Jurisdiction:</span>
                  <span className="font-semibold text-black">European Economic Area (EEA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Security Standard:</span>
                  <span className="font-semibold text-black">End-to-End AST Sanitization</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Subprocessors:</span>
                  <span className="font-semibold text-black">AWS (us-east-1), Fastly, Supabase</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadDPA();
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs uppercase font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download DPA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: HIPAA ENTERPRISE INQUIRY ── */}
      {activeModal === "hipaa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-700" />
                <h3 className="font-semibold text-black">HIPAA BAA Agreement Inquiry</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-black/70 font-sans leading-relaxed">
              Business Associate Agreements (BAA) with dedicated e-PHI microVM tenancy and audit logging are available for Enterprise Plus tiers.
            </p>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 font-mono text-xs">
              Direct Account Executive Contact:
              <div className="font-bold mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>enterprise@agent-spm.com</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  showToast({
                    title: "Inquiry Dispatched",
                    message: `An enterprise account executive will contact ${currentPersona.email || "your workspace admin"} within 4 hours.`,
                    type: "success",
                  });
                  setActiveModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs uppercase font-bold shadow-md cursor-pointer"
              >
                Request BAA Callback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CONFIRM DELETION ── */}
      {activeModal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-300 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-600">Delete Organization</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="font-sans text-xs text-black/80 leading-relaxed">
                This action initiates permanent erasure of all hosted skills, tarballs, API keys, and team allocations after a 30-day grace window.
              </p>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Type <span className="text-red-600 font-bold">{currentOrg.slug}</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder={currentOrg.slug}
                  value={confirmSlug}
                  onChange={(e) => setConfirmSlug(e.target.value)}
                  className="w-full rounded-xl border border-red-300 bg-red-50/50 px-3 py-2 text-sm text-black focus:border-red-600 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/10">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black font-mono text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletion}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-bold shadow-md cursor-pointer"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
