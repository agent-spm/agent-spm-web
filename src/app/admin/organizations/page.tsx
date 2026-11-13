"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Plus, Shield, MoreVertical, Eye, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");

  const orgs = [
    { id: "org_1", slug: "@acme-labs", name: "Acme Labs", plan: "Pro", seats: "8 / 10", skills: 12, storage: "4.8 GB", status: "Active" },
    { id: "org_2", slug: "@acme-enterprise", name: "Acme Enterprise Global", plan: "Enterprise", seats: "42 / ∞", skills: 128, storage: "48.2 GB", status: "Active" },
    { id: "org_3", slug: "@personal-dev", name: "Personal Workspace", plan: "Free", seats: "1 / 3", skills: 3, storage: "240 MB", status: "Active" },
    { id: "org_4", slug: "@spammer-dev", name: "Spam Network", plan: "Free", seats: "1 / 3", skills: 1, storage: "12 MB", status: "Suspended" },
  ];

  const handleImpersonate = (slug: string) => {
    showToast({
      title: "Tenant Impersonation Active",
      message: `Browsing ${slug} in read-only audit mode. Staff audit log recording.`,
      type: "info",
    });
    router.push("/app");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
        <div>
          <h1 className="text-2xl font-bold font-sans text-black tracking-tight">Tenant Organizations</h1>
          <p className="text-xs font-mono text-black/60 mt-0.5">Manage 2,410 organizations registered across global registry clusters</p>
        </div>

        <button
          onClick={() => {
            showToast({
              title: "Tenant Provisioning Wizard",
              message: "Organization onboarding wizard opened.",
              type: "info",
            });
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#1B5FED] hover:bg-[#154ec4] text-white font-mono text-xs uppercase font-semibold shadow-sm cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Tenant</span>
        </button>
      </div>

      <div className="rounded-[8px] border border-black/10 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAFAFA] uppercase tracking-wider text-black/60 text-[11px]">
                <th className="py-3 px-6">Organization</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Seats Allocated</th>
                <th className="py-3 px-4">Skills Published</th>
                <th className="py-3 px-4">Storage Quota</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {orgs.map((o) => (
                <tr key={o.id} className="hover:bg-[#F0F7FF] transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-[#1B5FED] text-xs sm:text-sm">{o.slug}</div>
                    <div className="text-[11px] text-black/50 font-sans">{o.name}</div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/5 text-black/70 border border-black/10">
                      {o.plan}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-black/80 font-bold">{o.seats}</td>
                  <td className="py-3.5 px-4 text-[#1B5FED] font-bold">{o.skills}</td>
                  <td className="py-3.5 px-4 text-black/60">{o.storage}</td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      o.status === "Active" ? "bg-emerald-500/15 text-emerald-800" : "bg-red-500/15 text-red-800"
                    }`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleImpersonate(o.slug)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-black/10 hover:border-[#1B5FED] bg-white text-black hover:text-[#1B5FED] font-mono text-xs font-semibold uppercase cursor-pointer transition-colors shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#1B5FED]" />
                      <span>View As</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
