import { TeamTable } from "@/components/dashboard/team-table";
import { UserPlus } from "lucide-react";
import type { TeamMember } from "@/types/billing";

// Development placeholder data
const mockMembers: TeamMember[] = [
  {
    id: "1",
    email: "alice@example.com",
    name: "Alice Chen",
    role: "owner",
    joinedAt: "2024-01-15T00:00:00Z",
    lastActiveAt: "2025-04-01T10:30:00Z",
    seatAssigned: true,
  },
  {
    id: "2",
    email: "bob@example.com",
    name: "Bob Martinez",
    role: "admin",
    joinedAt: "2024-03-22T00:00:00Z",
    lastActiveAt: "2025-03-30T14:00:00Z",
    seatAssigned: true,
  },
  {
    id: "3",
    email: "carol@example.com",
    name: "Carol Park",
    role: "member",
    joinedAt: "2024-06-10T00:00:00Z",
    lastActiveAt: "2025-03-28T09:15:00Z",
    seatAssigned: true,
  },
  {
    id: "4",
    email: "dave@example.com",
    name: "Dave Wilson",
    role: "member",
    joinedAt: "2025-01-08T00:00:00Z",
    seatAssigned: false,
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            Team
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage members and seat assignments.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      <TeamTable members={mockMembers} />
    </div>
  );
}
