import { Types } from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldIcon } from "@/components/Icons";
import { Player } from "@/components/Player";
import { connectDB } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import type { Maturity } from "@/models/Title";
import { Title } from "@/models/Title";

export const metadata = { title: "Player" };

export default async function WatchPage(props: PageProps<"/watch/[id]">) {
  const { profile } = await requireProfile();
  const { id } = await props.params;
  if (!Types.ObjectId.isValid(id)) notFound();
  await connectDB();

  const title = await Title.findById(id).select("maturity title").lean();
  if (!title) notFound();
  if (title.maturity > (profile.maxRating as Maturity)) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-good/15 text-good"><ShieldIcon /></span>
        <h1 className="display mb-2 text-2xl">This title is above {profile.name}&apos;s limit</h1>
        <p className="mb-6 text-sm text-muted">Switch to an adult profile to play it.</p>
        <Link href="/browse" className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink">Back to Browse</Link>
      </div>
    );
  }

  const params = await props.searchParams;
  const raw = params.episode;
  const episodeId = typeof raw === "string" && Types.ObjectId.isValid(raw) ? raw : null;
  return <Player titleId={id} episodeId={episodeId} profileName={profile.name} />;
}
