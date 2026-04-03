import { formatDate } from "@/lib/utils";
import type { TeamMember } from "@/types/billing";
import { MoreHorizontal, Shield, User, Crown } from "lucide-react";

interface TeamTableProps {
  members: TeamMember[];
}

const roleConfig = {
  owner: {
    icon: Crown,
    label: "Owner",
    color:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50",
  },
  admin: {
    icon: Shield,
    label: "Admin",
    color:
      "text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-950/50",
  },
  member: {
    icon: User,
    label: "Member",
    color:
      "text-surface-600 bg-surface-100 dark:text-surface-400 dark:bg-surface-800",
  },
};

export function TeamTable({ members }: TeamTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950">
      <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-800">
        <thead className="bg-surface-50 dark:bg-surface-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
              Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
              Joined
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
              Seat
            </th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
          {members.map((member) => {
            const role = roleConfig[member.role];
            const RoleIcon = role.icon;

            return (
              <tr
                key={member.id}
                className="transition-colors hover:bg-surface-50 dark:hover:bg-surface-900/50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-semibold text-white">
                      {member.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-surface-50">
                        {member.name}
                      </p>
                      <p className="text-xs text-surface-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${role.color}`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {role.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-surface-500">
                  {formatDate(member.joinedAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      member.seatAssigned
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-surface-100 text-surface-400 dark:bg-surface-800"
                    }`}
                  >
                    {member.seatAssigned ? "Assigned" : "Unassigned"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <button className="rounded-lg p-1 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 dark:hover:bg-surface-800">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
