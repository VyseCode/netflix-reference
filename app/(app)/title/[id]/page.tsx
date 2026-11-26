import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldIcon } from "@/components/Icons";
import { TitleDetailView } from "@/components/TitleDetailView";
import { getTitleDetail } from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata = { title: "Title details" };

export default async function TitlePage(props: PageProps<"/title/[id]">) {
  const { profile } = await requireProfile();
  const { id } = await props.params;
  const result = await getTitleDetail(id, profile);

  if (result.state === "not-found") notFound();
  if (result.state === "forbidden") {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-good/15 text-good">
          <ShieldIcon className="h-7 w-7" />
        </span>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Parental controls</p>
        <h1 className="display mb-3 text-3xl">This title is above your profile&apos;s limit</h1>
        <p className="mb-7 text-sm text-muted">
          {profile.name} is capped at {profile.maxRating}. An adult profile can open it from Profile settings.
        </p>
        <Link href="/browse" className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-bright">
          Back to Browse
        </Link>
      </div>
    );
  }

  return <TitleDetailView title={result.data} />;
}
