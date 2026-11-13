"use client";

import React, { useState } from "react";
import { useSession } from "@/lib/data/session-context";
import { SEED_WEBHOOK_DELIVERIES } from "@/lib/data/mock-store";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Plus,
  RotateCcw,
  ChevronRight,
  Settings,
  KeyRound,
  Play,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";

export default function IntegrationsPage() {
  const { webhooks } = useSession();
  const { showToast } = useToast();
  const [deliveries, setDeliveries] = useState(SEED_WEBHOOK_DELIVERIES);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>("del_1");
  const [isSendingPing, setIsSendingPing] = useState(false);

  // Pre-built integration cards
  const [integrations, setIntegrations] = useState([
    {
      id: "slack",
      name: "Slack",
      desc: "Post instant notifications to engineering channels on publish or fatal errors.",
      connected: true,
      statusLine: "Connected to #agent-releases (Last synced 14 mins ago)",
    },
    {
      id: "github",
      name: "GitHub",
      desc: "Link source repositories and auto-publish skills on Git Release tagging.",
      connected: true,
      statusLine: "Linked to 4 repositories (acme-labs/*)",
    },
    {
      id: "discord",
      name: "Discord",
      desc: "Bot webhook integration for engineering team discussion channels.",
      connected: false,
    },
    {
      id: "gitlab",
      name: "GitLab",
      desc: "Trigger automated CI/CD security validation pipelines.",
      connected: false,
    },
    {
      id: "jira",
      name: "Jira Software",
      desc: "Automatically file bug tickets when agent execution error rates spike.",
      connected: false,
    },
    {
      id: "pagerduty",
      name: "PagerDuty",
      desc: "High-priority on-call alerts for registry downtime and downstream API failures.",
      connected: false,
    },
  ]);

  const handleRedeliver = (id: string) => {
    showToast({
      title: "Webhook Redelivery Dispatched",
      message: `Event ${id} resent to subscriber. Response: HTTP 200 OK (54ms).`,
      type: "success",
    });
  };

  const handleSendTestPing = () => {
    setIsSendingPing(true);
    setTimeout(() => {
      setIsSendingPing(false);
      const newDel = {
        id: `del_sim_${Date.now()}`,
        webhookId: "wh_1",
        event: "skill.published",
        timestamp: new Date().toISOString(),
        statusCode: 200,
        latencyMs: 76,
        requestBody: JSON.stringify(
          {
            event: "skill.published",
            timestamp: new Date().toISOString(),
            actor: "alex@acme.labs",
            data: {
              scope: "@acme-labs",
              name: "browser-tools",
              version: "1.2.1",
              tarballSha: "sha256:7b9a1c4f0e...",
            },
          },
          null,
          2
        ),
        responseBody: JSON.stringify(
          {
            received: true,
            status: "ok",
            processedBy: "webhook-receiver-v2",
          },
          null,
          2
        ),
      };
      setDeliveries([newDel, ...deliveries]);
      setExpandedDelivery(newDel.id);
      showToast({
        title: "Test Webhook Ping Delivered",
        message: "POST https://api.acme.labs/spm-events responded HTTP 200 OK in 76ms.",
        type: "success",
      });
    }, 600);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.connected;
          showToast({
            title: next ? `${item.name} Connected` : `${item.name} Disconnected`,
            message: next ? "Authentication token verified & linked." : "Integration disabled.",
            type: next ? "success" : "info",
          });
          return {
            ...item,
            connected: next,
            statusLine: next ? "Connected (Just now)" : undefined,
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6 text-black">
      {/* ── WEBHOOK ENDPOINTS TABLE ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/10">
          <div>
            <h2 className="text-base font-semibold text-black">Configured Webhook Endpoints</h2>
            <p className="text-xs font-mono text-black/60 mt-0.5">
              Receive signed JSON webhooks when registry events trigger
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSendTestPing}
              disabled={isSendingPing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#1B5FED] font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSendingPing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#1B5FED] border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Ping</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                showToast({
                  title: "Endpoint Creation Wizard",
                  message: "Webhook endpoint configuration opened.",
                  type: "info",
                });
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Webhook [W]</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-4">Endpoint URL</th>
                <th className="py-3 px-4">Subscribed Events</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Triggered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {webhooks.map((wh) => (
                <tr key={wh.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-black truncate max-w-xs">
                    {wh.url}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="text-[10px] bg-black/5 text-black border border-black/10 px-1.5 py-0.5 rounded-md font-semibold">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      wh.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}>
                      {wh.status} {wh.retryCount ? `(${wh.retryCount} retries)` : ""}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-black/60">
                    <span className="text-black font-bold">{wh.lastStatusCode}</span> • {wh.lastTriggered}
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() =>
                        showToast({
                          title: "Edit Webhook",
                          message: `Configuring ${wh.url}`,
                          type: "info",
                        })
                      }
                      className="text-black/60 hover:text-black font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        showToast({
                          title: "Webhook State Updated",
                          message: `Toggled state for ${wh.url}`,
                          type: "info",
                        })
                      }
                      className="text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      Pause
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RECENT DELIVERIES (LAST 50) PER SPEC ── */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-[#F5F5F7]/50">
          <div>
            <h3 className="text-base font-semibold text-black">Recent Deliveries (Last 50)</h3>
            <p className="text-xs font-mono text-black/60 mt-0.5">Click any delivery to inspect payload headers and response</p>
          </div>
          <span className="font-mono text-xs text-black/60 font-semibold">Delivery Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#F5F5F7]/80 uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-4 w-6"></th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Status Code</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Redeliver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {deliveries.map((del) => {
                const isExpanded = expandedDelivery === del.id;
                return (
                  <React.Fragment key={del.id}>
                    <tr
                      onClick={() => setExpandedDelivery(isExpanded ? null : del.id)}
                      className="hover:bg-black/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-black/40">
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90 text-[#1B5FED]" : ""}`} />
                      </td>
                      <td className="py-3 px-4 text-black/60">{del.timestamp.replace("T", " ").substring(0, 19)}</td>
                      <td className="py-3 px-4 text-[#1B5FED] font-bold">[{del.event}]</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          del.statusCode === 200 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-red-100 text-red-800 border border-red-300"
                        }`}>
                          HTTP {del.statusCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-black/60">{del.latencyMs} ms</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRedeliver(del.id);
                          }}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded-xl bg-white border border-black/10 hover:bg-black/5 text-black text-[11px] shadow-xs cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-[#1B5FED]" />
                          <span>Redeliver</span>
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-black/[0.02] border-b border-black/5">
                        <td colSpan={6} className="p-4 pl-12 space-y-3">
                          <div>
                            <div className="text-black/60 text-[10px] uppercase font-bold mb-1 font-mono">Request Payload (JSON):</div>
                            <pre className="p-3 rounded-xl bg-[#09090B] text-[#7ECEFF] text-[11px] overflow-x-auto shadow-inner leading-relaxed font-mono">{del.requestBody}</pre>
                          </div>
                          <div>
                            <div className="text-black/60 text-[10px] uppercase font-bold mb-1 font-mono">Response Body:</div>
                            <pre className="p-3 rounded-xl bg-[#09090B] text-emerald-300 text-[11px] overflow-x-auto shadow-inner leading-relaxed font-mono">{del.responseBody}</pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PRE-BUILT INTEGRATIONS ── */}
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-black/10">
          <h3 className="text-base font-semibold text-black">Pre-built Enterprise Connectors</h3>
          <p className="text-xs font-mono text-black/60 mt-0.5">Native 1-click sync with issue trackers and alerting software</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {integrations.map((integ) => (
            <div key={integ.id} className="p-4 rounded-xl border border-black/10 bg-black/[0.01] hover:bg-black/[0.03] flex flex-col justify-between space-y-3 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-black">{integ.name}</span>
                  {integ.connected ? (
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      CONNECTED
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded-full bg-black/5 text-black/60 border border-black/10">
                      UNCONNECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-black/70 mt-1 font-sans">{integ.desc}</p>
                {integ.statusLine && (
                  <div className="text-[10px] font-mono text-emerald-700 mt-2 font-medium">
                    {integ.statusLine}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-black/10 flex items-center justify-between">
                {integ.connected ? (
                  <>
                    <button
                      onClick={() =>
                        showToast({
                          title: `${integ.name} Settings`,
                          message: `Viewing preferences for ${integ.name}`,
                          type: "info",
                        })
                      }
                      className="text-black/60 hover:text-black font-mono text-xs flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => toggleIntegration(integ.id)}
                      className="text-red-600 hover:underline font-mono text-xs font-semibold cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => toggleIntegration(integ.id)}
                    className="w-full py-1.5 rounded-lg bg-black text-white hover:bg-black/80 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    Connect {integ.name}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
