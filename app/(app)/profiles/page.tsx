import { redirect } from "next/navigation";
import { ProfilePicker } from "@/components/ProfilePicker";
import { requireAccount } from "@/lib/session";

export const metadata = { title: "Who's watching" };

export default async function ProfilesPage() {
  const account = await requireAccount();
  if (account.profiles.length === 0) redirect("/profiles/manage");
  return <ProfilePicker profiles={account.profiles} activeId={account.activeProfileId} />;
}
