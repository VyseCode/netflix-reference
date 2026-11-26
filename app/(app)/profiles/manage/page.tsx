import { ProfileManager } from "@/components/ProfileManager";
import { requireAccount } from "@/lib/session";

export const metadata = { title: "Manage profiles" };

export default async function ManageProfilesPage() {
  const account = await requireAccount();
  return <ProfileManager profiles={account.profiles} activeId={account.activeProfileId} />;
}
