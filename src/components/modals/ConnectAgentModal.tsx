"use client";

import React, { useState } from "react";
import { X, Copy, Check, Terminal, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

interface ConnectAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillScope: string;
  skillName: string;
  version: string;
}

export const ConnectAgentModal: React.FC<ConnectAgentModalProps> = ({
  isOpen,
  onClose,
  skillScope,
  skillName,
  version,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"cursor" | "claude" | "langchain" | "llamaindex">("cursor");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const fullPkgName = `${skillScope}/${skillName}`;
  const serverName = skillName.replace(/^@?[a-z0-9-]+\//, "").replace(/[^a-z0-9_-]/gi, "-");

  const cursorConfig = `{
  "mcpServers": {
    "${serverName}": {
      "command": "npx",
      "args": ["-y", "@agent-spm/runner", "run", "${fullPkgName}@${version}"],
      "env": {
        "SPM_API_KEY": "\${env:SPM_API_KEY}"
      }
    }
  }
}`;

  const claudeConfig = `{
  "mcpServers": {
    "${serverName}": {
      "command": "npx",
      "args": ["-y", "@agent-spm/runner", "run", "${fullPkgName}@${version}"],
      "env": {
        "SPM_API_KEY": "\${env:SPM_API_KEY}"
      }
    }
  }
}`;

  const langchainCode = `import os
from langchain_core.tools import tool
from agent_spm import load_skill

# 1. Initialize ${fullPkgName}
skill = load_skill("${fullPkgName}@${version}", api_key=os.environ["SPM_API_KEY"])

# 2. Bind directly to your LangChain / LangGraph Agent
tools = skill.to_langchain_tools()
print(f"Loaded {len(tools)} verified tools: {[t.name for t in tools]}")`;

  const llamaindexCode = `import os
from llama_index.core.tools import FunctionTool
from agent_spm import SPMRegistry

# 1. Fetch package from registry
package = SPMRegistry.fetch("${fullPkgName}@${version}", token=os.environ["SPM_API_KEY"])

# 2. Convert to LlamaIndex FunctionTools
tools = package.to_llama_tools()
print(f"Ready for LlamaIndex Agent Workflow: {tools}")`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast({
      title: "Configuration Copied",
      message: `${label} copied to clipboard`,
      type: "success",
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-6 shadow-2xl text-black z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#1B5FED]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-black">Connect to Agent Runtime</h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase">
                  MCP READY
                </span>
              </div>
              <p className="text-xs text-black/60 font-sans mt-0.5">
                Inject <code className="text-[#1B5FED] font-mono font-semibold">{fullPkgName}</code> into Cursor, Claude, or Python frameworks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-black/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Runtime Selector Tabs */}
        <div className="flex items-center gap-1.5 pt-4 border-b border-black/10 pb-3 font-mono text-xs">
          {[
            { id: "cursor", label: "Cursor IDE (.cursor/mcp.json)" },
            { id: "claude", label: "Claude Desktop" },
            { id: "langchain", label: "LangChain / LangGraph" },
            { id: "llamaindex", label: "LlamaIndex" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === t.id
                  ? "bg-[#1B5FED] text-white shadow-xs"
                  : "bg-black/[0.03] text-black/70 hover:bg-black/10 hover:text-black"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panes */}
        <div className="pt-4 space-y-4">
          {activeTab === "cursor" && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black/70 font-mono">
                  Paste into <strong className="text-black">.cursor/mcp.json</strong> at project root:
                </span>
                <button
                  onClick={() => handleCopy(cursorConfig, "Cursor Configuration")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black font-mono text-xs font-semibold uppercase cursor-pointer"
                >
                  {copiedKey === "Cursor Configuration" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "Cursor Configuration" ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] overflow-x-auto shadow-inner">
                <pre>{cursorConfig}</pre>
              </div>

              <div className="p-3 rounded-lg border border-sky-200 bg-sky-50 text-[11px] text-[#1B5FED] flex items-center justify-between font-mono">
                <span>Supports dynamic variable interpolation for SPM_API_KEY.</span>
                <a
                  href={`cursor://anysphere.cursor-mcp/install?package=${encodeURIComponent(fullPkgName)}`}
                  className="inline-flex items-center gap-1 font-bold underline hover:opacity-80"
                >
                  <span>Launch in Cursor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === "claude" && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black/70 font-mono">
                  Config file for Claude Desktop:
                </span>
                <button
                  onClick={() => handleCopy(claudeConfig, "Claude Configuration")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black font-mono text-xs font-semibold uppercase cursor-pointer"
                >
                  {copiedKey === "Claude Configuration" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "Claude Configuration" ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] overflow-x-auto shadow-inner">
                <pre>{claudeConfig}</pre>
              </div>

              <div className="p-3 rounded-lg border border-black/10 bg-black/[0.02] text-xs text-black/70 font-mono space-y-1">
                <div>macOS Path: <code className="text-black font-bold">~/Library/Application Support/Claude/claude_desktop_config.json</code></div>
                <div>Windows Path: <code className="text-black font-bold">%APPDATA%\Claude\claude_desktop_config.json</code></div>
              </div>
            </div>
          )}

          {activeTab === "langchain" && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black/70 font-mono">Python LangChain / LangGraph binding:</span>
                <button
                  onClick={() => handleCopy(langchainCode, "LangChain Python Snippet")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black font-mono text-xs font-semibold uppercase cursor-pointer"
                >
                  {copiedKey === "LangChain Python Snippet" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "LangChain Python Snippet" ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] overflow-x-auto shadow-inner">
                <pre>{langchainCode}</pre>
              </div>
            </div>
          )}

          {activeTab === "llamaindex" && (
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-xs text-black/70 font-mono">Python LlamaIndex FunctionTool snippet:</span>
                <button
                  onClick={() => handleCopy(llamaindexCode, "LlamaIndex Python Snippet")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-black font-mono text-xs font-semibold uppercase cursor-pointer"
                >
                  {copiedKey === "LlamaIndex Python Snippet" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === "LlamaIndex Python Snippet" ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-black/10 bg-[#09090B] font-mono text-xs text-[#7ECEFF] overflow-x-auto shadow-inner">
                <pre>{llamaindexCode}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-black/10 flex items-center justify-between text-xs text-black/60 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero prompt data interception guaranteed by SPM Runtime.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 font-semibold text-black cursor-pointer uppercase text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
