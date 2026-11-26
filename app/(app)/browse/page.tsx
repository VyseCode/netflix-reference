import { BrowseView } from "@/components/BrowseView";
import { getBrowse } from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata = { title: "Browse" };

export default async function BrowsePage() {
  const { profile } = await requireProfile();
  const data = await getBrowse(profile);
  return <BrowseView data={data} />;
}
