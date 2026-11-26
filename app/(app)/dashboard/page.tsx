import { DashboardView } from "@/components/DashboardView";
import { getDashboard } from "@/lib/reports";
import { requireProfile } from "@/lib/session";

export const metadata = { title: "Activity" };

export default async function DashboardPage() {
  const { profile } = await requireProfile();
  const data = await getDashboard(profile.id);
  if (!data) return <p className="text-muted">Profile not found.</p>;
  return <DashboardView data={data} />;
}
