"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/data/session-context";
import { SEED_WEBHOOK_DELIVERIES } from "@/lib/data/mock-store";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Plus,
  RotateCcw,
  ChevronRight,
  Settings,
  KeyRound,
  Send,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function IntegrationsPage() {
  const { webhooks: initialWebhooks, currentOrg, userProfile } = useSession();
  const { showToast } = useToast();

  const [localWebhooks, setLocalWebhooks] = useState(initialWebhooks);
  const [deliveries, setDeliveries] = useState<typeof SEED_WEBHOOK_DELIVERIES>([]);
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);
  const [isSendingPing, setIsSendingPing] = useState(false);

  // Webhook Modal State
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    "skill.published",
    "security.cve_alert",
  ]);

  // Integration Connector Modal State
  const [connectorModal, setConnectorModal] = useState<{
    id: string;
    name: string;
    fieldLabel: string;
    placeholder: string;
    value: string;
  } | null>(null);

  // Pre-built integration cards
  const [integrations, setIntegrations] = useState([
    {
      id: "slack",
      name: "Slack",
      desc: "Post instant notifications to engineering channels on publish or fatal errors.",
      connected: true,
      statusLine: "Connected to #agent-releases (Last synced 14 mins ago)",
      fieldLabel: "Slack Incoming Webhook URL",
      placeholder: "https://hooks.slack.com/services/T00/B00/XXXX",
    },
    {
      id: "github",
      name: "GitHub",
      desc: "Link source repositories and auto-publish skills on Git Release tagging.",
      connected: true,
      statusLine: "Linked to organization agent-spm-registry (22 repositories)",
      fieldLabel: "GitHub Personal Access Token / App Installation ID",
      placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
    },
    {
      id: "discord",
      name: "Discord",
      desc: "Bot webhook integration for engineering team discussion channels.",
      connected: false,
      fieldLabel: "Discord Webhook URL",
      placeholder: "https://discord.com/api/webhooks/12345/abcdef",
    },
    {
      id: "gitlab",
      name: "GitLab",
      desc: "Trigger automated CI/CD security validation pipelines.",
      connected: false,
      fieldLabel: "GitLab Project Webhook URL",
      placeholder: "https://gitlab.com/api/v4/projects/123/ref/main/trigger/pipeline",
    },
    {
      id: "jira",
      name: "Jira Software",
      desc: "Automatically file bug tickets when agent execution error rates spike.",
      connected: false,
      fieldLabel: "Atlassian Webhook URL",
      placeholder: "https://automation.atlassian.com/pro/hooks/xxxxxxxx",
    },
    {
      id: "pagerduty",
      name: "PagerDuty",
      desc: "High-priority on-call alerts for registry downtime and downstream API failures.",
      connected: false,
      fieldLabel: "PagerDuty Events API v2 Integration Key",
      placeholder: "32-character routing key",
    },
  ]);

  // Keyboard shortcut [W] & Topbar event to open Add Webhook modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "w" || e.key === "W") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName) &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        openAddWebhookModal();
      }
    };
    const handleCustomEvent = () => openAddWebhookModal();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-add-webhook-modal", handleCustomEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-add-webhook-modal", handleCustomEvent);
    };
  }, []);

  const openAddWebhookModal = () => {
    setEditingWebhookId(null);
    setWebhookUrl("");
    setSelectedEvents(["skill.published", "security.cve_alert"]);
    setShowWebhookModal(true);
  };

  const openEditWebhookModal = (wh: typeof localWebhooks[0]) => {
    setEditingWebhookId(wh.id);
    setWebhookUrl(wh.url);
    setSelectedEvents(wh.events);
    setShowWebhookModal(true);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    if (editingWebhookId) {
      setLocalWebhooks((prev) =>
        prev.map((wh) =>
          wh.id === editingWebhookId
            ? { ...wh, url: webhookUrl.trim(), events: selectedEvents }
            : wh
        )
      );
      showToast({
        title: "Webhook Updated",
        message: `Endpoint ${webhookUrl} updated with ${selectedEvents.length} events.`,
        type: "success",
      });
    } else {
      const newWh = {
        id: `wh_${Date.now()}`,
        url: webhookUrl.trim(),
        events: selectedEvents,
        status: "Active" as const,
        lastStatusCode: 200,
        lastTriggered: "Just now",
        secretPrefix: "whsec_live",
      };
      setLocalWebhooks((prev) => [...prev, newWh]);
      showToast({
        title: "Webhook Endpoint Created",
        message: `Listening on ${selectedEvents.length} events. Ed25519 signing secret generated.`,
        type: "success",
      });
    }
    setShowWebhookModal(false);
  };

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
        endpointUrl: localWebhooks[0]?.url || "https://api.acme.labs/spm-events",
        event: "skill.published",
        timestamp: new Date().toISOString(),
        statusCode: 200,
        latencyMs: 76,
        requestBody: JSON.stringify(
          {
            event: "skill.published",
            timestamp: new Date().toISOString(),
            actor: userProfile?.email || "member@workspace",
            data: {
              scope: currentOrg.slug,
              name: "sample-skill",
              version: "1.0.0",
              tarballSha: "sha256:7b9a1c4f0e9b41a998b2c8",
            },
          },
          null,
          2
        ),
        responseBody: JSON.stringify(
          {
            received: true,
            status: "ok",
            processedBy: "spm-ingest-receiver",
          },
          null,
          2
        ),
      };
      setDeliveries([newDel, ...deliveries]);
      setExpandedDelivery(newDel.id);
      showToast({
        title: "Test Webhook Ping Delivered",
        message: `POST ${newDel.endpointUrl} responded HTTP 200 OK in 76ms.`,
        type: "success",
      });
    }, 600);
  };

  const handleSaveConnector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectorModal) return;

    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === connectorModal.id) {
          return {
            ...item,
            connected: true,
            statusLine: `Connected to ${item.name} (Live verification passed)`,
          };
        }
        return item;
      })
    );

    showToast({
      title: `${connectorModal.name} Integration Active`,
      message: `Credentials verified and connected.`,
      type: "success",
    });

    setConnectorModal(null);
  };

  const toggleDisconnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          showToast({
            title: `${item.name} Disconnected`,
            message: "Integration disabled.",
            type: "info",
          });
          return {
            ...item,
            connected: false,
            statusLine: undefined,
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
              onClick={openAddWebhookModal}
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
              {localWebhooks.map((wh) => (
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
                      onClick={() => openEditWebhookModal(wh)}
                      className="text-black/60 hover:text-black font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const nextStatus: typeof wh.status = wh.status === "Active" ? "Paused" : "Active";
                        setLocalWebhooks((prev) =>
                          prev.map((w) => (w.id === wh.id ? { ...w, status: nextStatus } : w))
                        );
                        showToast({
                          title: `Webhook ${nextStatus}`,
                          message: `${wh.url} is now ${nextStatus.toLowerCase()}.`,
                          type: "info",
                        });
                      }}
                      className="text-amber-700 hover:underline font-semibold cursor-pointer"
                    >
                      {wh.status === "Active" ? "Pause" : "Resume"}
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
                        setConnectorModal({
                          id: integ.id,
                          name: integ.name,
                          fieldLabel: integ.fieldLabel,
                          placeholder: integ.placeholder,
                          value: "",
                        })
                      }
                      className="text-black/60 hover:text-black font-mono text-xs flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Settings className="w-3 h-3" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => toggleDisconnect(integ.id)}
                      className="text-red-600 hover:underline font-mono text-xs font-semibold cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setConnectorModal({
                        id: integ.id,
                        name: integ.name,
                        fieldLabel: integ.fieldLabel,
                        placeholder: integ.placeholder,
                        value: "",
                      })
                    }
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

      {/* ── MODAL: ADD / EDIT WEBHOOK ENDPOINT ── */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">
                  {editingWebhookId ? "Edit Webhook Endpoint" : "Add Webhook Endpoint"}
                </h3>
              </div>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  Payload Destination URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/spm"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-2 font-semibold">
                  Subscribed Registry Events
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "skill.published",
                    "skill.deprecated",
                    "security.cve_alert",
                    "agent.policy_violation",
                    "key.revoked",
                    "member.invited",
                  ].map((ev) => {
                    const isSelected = selectedEvents.includes(ev);
                    return (
                      <label
                        key={ev}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "border-[#1B5FED] bg-[#1B5FED]/5 text-black font-bold"
                            : "border-black/10 bg-black/[0.01] text-black/70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEvents([...selectedEvents, ev]);
                            } else {
                              setSelectedEvents(selectedEvents.filter((item) => item !== ev));
                            }
                          }}
                          className="rounded border-black/20 text-[#1B5FED] focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>{ev}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1B5FED] shrink-0 mt-0.5" />
                <p className="text-[11px] text-sky-950 font-mono leading-relaxed">
                  Webhooks are signed using <code>X-SPM-Signature-256</code> HMAC hex digest. We retry failed 5xx deliveries with exponential backoff for up to 24 hours.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold shadow-md cursor-pointer"
                >
                  {editingWebhookId ? "Update Endpoint" : "Save Webhook"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONNECTOR CREDENTIALS ── */}
      {connectorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-2xl space-y-4 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex items-center justify-between pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#1B5FED]" />
                <h3 className="font-semibold text-black">Configure {connectorModal.name}</h3>
              </div>
              <button
                onClick={() => setConnectorModal(null)}
                className="text-black/50 hover:text-black cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConnector} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-black/70 mb-1 font-semibold">
                  {connectorModal.fieldLabel}
                </label>
                <input
                  type="text"
                  required
                  placeholder={connectorModal.placeholder}
                  defaultValue={connectorModal.value}
                  className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-black focus:border-[#1B5FED] focus:outline-none shadow-xs"
                  autoFocus
                />
              </div>

              <p className="text-[11px] text-black/60 font-sans leading-relaxed">
                Agent SPM securely stores integration credentials in vault encryption with automatic webhook payload verification.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setConnectorModal(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-black uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1B5FED] hover:bg-[#1B5FED]/90 text-white uppercase font-bold shadow-md cursor-pointer"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
