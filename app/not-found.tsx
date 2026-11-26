import Link from "next/link";
import { FilmIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-ink">
          <FilmIcon className="h-7 w-7" />
        </span>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">404 · Off the reel</p>
        <h1 className="display mb-3 text-3xl">This title is not in the catalogue</h1>
        <p className="mb-7 text-sm text-muted">It may have been removed, or the link is out of date.</p>
        <Link href="/browse" className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-bright">
          Back to Browse
        </Link>
      </div>
    </main>
  );
}
