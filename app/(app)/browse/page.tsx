import { requireProfile } from "@/lib/session";

export const metadata = { title: "Browse" };

export default async function BrowsePage() {
  const { profile } = await requireProfile();
  return <h1 className="display text-2xl">Browsing as {profile.name}</h1>;
}
