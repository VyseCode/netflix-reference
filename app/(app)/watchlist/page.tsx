import { WatchlistView } from "@/components/WatchlistView";
import { getWatchlistPage } from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata = { title: "My List" };

export default async function WatchlistPage() {
  const { profile } = await requireProfile();
  const initial = await getWatchlistPage(profile, 1, 24);
  return <WatchlistView initial={initial} profileName={profile.name} />;
}
