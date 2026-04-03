import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardTopbar
          userName={
            user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "User"
          }
          userEmail={user?.email}
          userAvatarUrl={user?.user_metadata?.avatar_url}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
