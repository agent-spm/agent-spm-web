"use client";

import React, { useState } from "react";
import {
  FileCheck,
  Download,
  AlertTriangle,
  Trash2,
} from "lucide-react";

export default function CompliancePage() {
  const [selectedRegion, setSelectedRegion] = useState("us-east-1");
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const regions = [
    { id: "us-east-1", name: "US East (Virginia)", code: "us-east-1", p50Latency: "11 ms", active: true },
    { id: "eu-west-1", name: "EU West (Frankfurt)", code: "eu-central-1", p50Latency: "18 ms", active: false },
    { id: "uk-london", name: "UK (London)", code: "eu-west-2", p50Latency: "19 ms", active: false },
    { id: "ap-sydney", name: "Asia-Pacific (Sydney)", code: "ap-southeast-2", p50Latency: "34 ms", active: false },
    { id: "jp-tokyo", name: "Japan (Tokyo)", code: "ap-northeast-1", p50Latency: "29 ms", active: false },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportComplete(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-black">
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
          onClick={() => alert("Downloading all regulatory compliance artifacts (ZIP)...")}
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
          <button onClick={() => alert("Viewed SOC 2 report.")} className="mt-4 text-[#1B5FED] hover:underline text-left text-xs font-bold">
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
          <button onClick={() => alert("Viewed DPA agreement.")} className="mt-4 text-[#1B5FED] hover:underline text-left text-xs font-bold">
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
          <button onClick={() => alert("Contact sales for HIPAA BAA.")} className="mt-4 text-purple-700 hover:underline text-left text-xs font-bold">
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
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="text-[#1B5FED] border-black/20 focus:ring-0"
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
        <div className="flex items-center justify-between pb-3 border-b border-black/10">
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
            onClick={() => alert("Requesting amendment...")}
            className="px-3.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/5 font-mono text-xs text-black uppercase shadow-xs transition-colors"
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
            <span className="text-black">Alex Chen (Customer Controller) on Jan 15, 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">Counter-Signed By:</span>
            <span className="text-black">Agent SPM Trust & Safety Officer on Jan 15, 2026</span>
          </div>
        </div>

        <div>
          <button
            onClick={() => alert("Downloaded PDF agreement.")}
            className="flex items-center gap-2 text-xs font-mono text-[#1B5FED] font-semibold hover:underline"
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
            onClick={() => alert("Deletion request initiated with 30-day grace cancellation window.")}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Initiate Organization Deletion...
          </button>
        </div>
      </div>
    </div>
  );
}