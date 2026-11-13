"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/data/session-context";
import { PublishSuccessModal } from "@/components/modals/PublishSuccessModal";
import {
  FileText,
  Upload,
  ShieldCheck,
  Rocket,
  Check,
  FileCode,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function PublishWizardPage() {
  const router = useRouter();
  const { currentOrg, addSkill } = useSession();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Manifest Fields
  const [scope, setScope] = useState(currentOrg.slug);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("0.1.0");
  const [license, setLicense] = useState("MIT");
  const [description, setDescription] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(["agent", "tools"]);
  const [agents, setAgents] = useState({
    gpt4: true,
    claude: true,
    gemini: true,
    llama: false,
    custom: false,
  });
  const [repoUrl, setRepoUrl] = useState("");

  // Step 2: Files
  const [uploadedFiles] = useState<string[]>([
    "spm.yaml",
    "index.ts",
    "README.md",
    "package.json",
  ]);

  // Step 4: Publish progress state
  const [publishing, setPublishing] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const descMaxLen = 200;
  const charsRemaining = descMaxLen - description.length;

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (keywords.includes(keywordInput.trim())) return;
    setKeywords([...keywords, keywordInput.trim()]);
    setKeywordInput("");
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handlePublishExecution = () => {
    setPublishing(true);
    setPipelineProgress(15);

    setTimeout(() => {
      setPipelineProgress(45); // Hashing
      setTimeout(() => {
        setPipelineProgress(75); // Signing
        setTimeout(() => {
          setPipelineProgress(100); // Indexing
          setTimeout(() => {
            // Add skill to global session store
            addSkill({
              id: `skl_${name}_${Date.now()}`,
              scope,
              name: name || "custom-skill",
              version,
              status: "published",
              visibility: "public",
              description: description || "Autonomous agent procedural execution package.",
              license,
              readme: `# ${scope}/${name}\n\n${description}\n\n## Capabilities\n- Automated agent task execution\n- Full audit trail`,
              repositoryUrl: repoUrl || undefined,
              keywords,
              agentCompatibility: agents,
              totalDownloads: 0,
              downloadSparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              updatedAt: "Just now",
              versions: [
                {
                  version,
                  digest: "sha256:7b9a1e0f2d3c4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
                  signature: "spm_sig_ed25519:9e2b1c...",
                  tarballSize: "128 KB",
                  downloads: 0,
                  publishedAt: new Date().toISOString(),
                  publishedBy: "Alex Chen",
                },
              ],
            });
            setPublishing(false);
            setShowSuccessModal(true);
          }, 400);
        }, 500);
      }, 400);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-black">
      {/* ── 4-STEP STEPPER HEADER ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, label: "Manifest", icon: FileText },
            { step: 2, label: "Files", icon: Upload },
            { step: 3, label: "Review", icon: ShieldCheck },
            { step: 4, label: "Publish", icon: Rocket },
          ].map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-[#1B5FED]/10 border border-[#1B5FED]/30 text-[#1B5FED]"
                    : isCompleted
                      ? "text-emerald-700 font-medium"
                      : "text-black/40"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                    isCurrent
                      ? "bg-[#1B5FED] text-white shadow-sm"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-black/5 text-black/50"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.step}
                </div>
                <div className="hidden sm:block">
                  <div className="font-mono text-xs font-semibold text-black">{s.label}</div>
                  <div className="text-[10px] text-black/50 font-mono">Step {s.step}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: MANIFEST ── */}
      {currentStep === 1 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold font-sans text-black">1. Package Manifest Specifications</h2>
            <p className="text-xs font-mono text-black/60 mt-1">Configure package identifiers, semver, and model compatibility</p>
          </div>

          <div className="space-y-4">
            {/* Scope & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  Scope *
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none"
                >
                  <option value={currentOrg.slug}>{currentOrg.slug}</option>
                  <option value="@personal-dev">@personal-dev</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  Skill Name *
                </label>
                <div className="flex rounded-xl border border-black/15 bg-white focus-within:border-[#1B5FED] focus-within:ring-2 focus-within:ring-[#1B5FED]/20 overflow-hidden">
                  <span className="px-3 py-2 font-mono text-xs text-black/60 bg-black/[0.03] border-r border-black/10 flex items-center">
                    {scope}/
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="e.g. data-analyst"
                    className="w-full bg-transparent px-3 py-2 text-xs font-mono text-black placeholder:text-black/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Version & License */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  Semver Version *
                </label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="0.1.0"
                  className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2 text-xs font-mono text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                  License *
                </label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none"
                >
                  <option value="MIT">MIT License (Open Source)</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="BSD-3-Clause">BSD 3-Clause</option>
                  <option value="Proprietary">Proprietary / Organization Only</option>
                </select>
              </div>
            </div>

            {/* Description with live remaining counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <label className="uppercase tracking-wider text-black/70 font-semibold">
                  Description *
                </label>
                <span className={`text-[11px] ${charsRemaining < 20 ? "text-amber-600 font-bold" : "text-black/50"}`}>
                  {charsRemaining} chars remaining
                </span>
              </div>
              <textarea
                required
                maxLength={descMaxLen}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what capabilities this skill equips your AI agents with..."
                className="w-full rounded-xl border border-black/15 bg-white p-3 text-xs text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none font-sans"
              />
            </div>

            {/* Keywords Tag Input */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                Keywords & Category Tags
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-black/15 bg-white focus-within:border-[#1B5FED] focus-within:ring-2 focus-within:ring-[#1B5FED]/20">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 font-mono text-xs bg-black/5 text-black border border-black/10 px-2 py-0.5 rounded-lg"
                  >
                    #{kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(kw)}
                      className="hover:text-red-600 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleKeywordKeyDown}
                  onBlur={handleAddKeyword}
                  placeholder="Type keyword and press Enter..."
                  className="flex-1 bg-transparent text-xs text-black placeholder:text-black/40 focus:outline-none min-w-32 font-mono"
                />
              </div>
            </div>

            {/* Agent Compatibility Checkboxes */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-2 font-semibold">
                Agent Compatibility *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "gpt4", label: "GPT-4 / 4o" },
                  { key: "claude", label: "Claude 3.5" },
                  { key: "gemini", label: "Gemini 1.5" },
                  { key: "llama", label: "LLaMA 3.3" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-black/10 bg-white hover:bg-black/[0.02] cursor-pointer text-xs font-mono shadow-xs"
                  >
                    <input
                      type="checkbox"
                      checked={(agents as any)[item.key]}
                      onChange={(e) => setAgents({ ...agents, [item.key]: e.target.checked })}
                      className="rounded border-black/20 text-[#1B5FED] focus:ring-0"
                    />
                    <span className="text-black font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Repository URL */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1.5 font-semibold">
                Repository URL (Optional)
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/acme-labs/my-skill"
                className="w-full rounded-xl border border-black/15 bg-white px-3.5 py-2 text-xs font-mono text-black placeholder:text-black/40 focus:border-[#1B5FED] focus:ring-2 focus:ring-[#1B5FED]/20 focus:outline-none"
              />
            </div>
          </div>

          {/* Stepper Buttons: Cancel, Continue to Files [N] */}
          <div className="pt-4 border-t border-black/10 flex items-center justify-between">
            <Link
              href="/app/skills"
              className="px-4 py-2 rounded-xl font-mono text-xs text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="button"
              disabled={!name.trim() || !description.trim()}
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-md"
            >
              <span>Continue to Files</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded">[N]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: FILES ── */}
      {currentStep === 2 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold font-sans text-black">2. Skill Artifacts & File Tree</h2>
            <p className="text-xs font-mono text-black/60 mt-1">Upload your compiled procedural scripts and manifest assets</p>
          </div>

          {/* Dropzone */}
          <div className="border-2 border-dashed border-black/20 hover:border-[#1B5FED] rounded-2xl p-8 text-center transition-colors bg-black/[0.01]">
            <Upload className="mx-auto w-10 h-10 text-black/40 mb-3" />
            <div className="font-mono text-xs text-black font-semibold">
              Drag & Drop your <code className="text-[#1B5FED] bg-sky-50 px-1 rounded border border-sky-200">spm.yaml</code> and tool scripts
            </div>
            <p className="text-xs text-black/60 mt-1 font-sans">
              Supports .ts, .js, .py, .yaml, and .md files (tarball estimated size: ~128 KB)
            </p>
          </div>

          {/* File Tree Inspector */}
          <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4 font-mono text-xs">
            <div className="text-black/60 text-[11px] uppercase tracking-wider mb-2 font-bold">Package Contents ({uploadedFiles.length} files)</div>
            <div className="space-y-1">
              {uploadedFiles.map((f) => (
                <div key={f} className="flex items-center justify-between text-black py-1.5 border-b border-black/5 last:border-0">
                  <span className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-[#1B5FED]" />
                    <span>{f}</span>
                  </span>
                  <span className="text-emerald-700 font-semibold text-[11px]">Ready</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-black/10 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Manifest</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-md"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: REVIEW & SECURITY SCAN ── */}
      {currentStep === 3 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold font-sans text-black">3. Review & Automated Security Scan</h2>
            <p className="text-xs font-mono text-black/60 mt-1">Pre-flight verification checks passed before cryptographic signing</p>
          </div>

          {/* Security Results Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero Secret Leaks</span>
              </div>
              <p className="text-xs text-emerald-900 mt-1 font-sans">No API keys or tokens found in source</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Schema Valid</span>
              </div>
              <p className="text-xs text-emerald-900 mt-1 font-sans">spm.yaml matches standard v1.2 spec</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>License Approved</span>
              </div>
              <p className="text-xs text-emerald-900 mt-1 font-sans">{license} compliant with org policy</p>
            </div>
          </div>

          {/* Package Summary Box */}
          <div className="p-4 rounded-xl border border-black/10 bg-black/[0.02] font-mono text-xs space-y-2">
            <div className="flex justify-between text-black/80">
              <span className="text-black/60">Target Identifier:</span>
              <span className="text-black font-bold">{scope}/{name || "skill"}</span>
            </div>
            <div className="flex justify-between text-black/80">
              <span className="text-black/60">Version:</span>
              <span className="text-[#1B5FED] font-semibold">v{version}</span>
            </div>
            <div className="flex justify-between text-black/80">
              <span className="text-black/60">Visibility:</span>
              <span className="text-emerald-700 font-semibold">Public Registry</span>
            </div>
          </div>

          <div className="pt-4 border-t border-black/10 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Files</span>
            </button>

            <button
              onClick={() => {
                setCurrentStep(4);
                handlePublishExecution();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider shadow-md cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>Sign & Publish to Registry</span>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: PUBLISH EXECUTION ── */}
      {currentStep === 4 && (
        <div className="rounded-2xl border border-black/10 bg-white p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-[#1B5FED] animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-sans text-black">Publishing {scope}/{name || "skill"}</h2>
            <p className="text-xs font-mono text-black/60 mt-1">Executing cryptographic build pipeline</p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="h-2.5 w-full rounded-full bg-black/5 overflow-hidden">
              <div
                style={{ width: `${pipelineProgress}%` }}
                className="h-full rounded-full bg-[#1B5FED] transition-all duration-300"
              />
            </div>
            <div className="flex justify-between font-mono text-xs text-black/60">
              <span>
                {pipelineProgress < 50
                  ? "Hashing SHA-256 artifacts..."
                  : pipelineProgress < 80
                    ? "Signing Ed25519 payload..."
                    : "Indexing to global registry CDN..."}
              </span>
              <span className="text-black font-bold">{pipelineProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal upon completion */}
      <PublishSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/app/skills");
        }}
        skillScope={scope}
        skillName={name || "skill"}
        version={version}
        elapsedTimeMs={121}
      />
    </div>
  );
}