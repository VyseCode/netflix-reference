"use client";

import Link from "next/link";
import { useState } from "react";
import { PosterCard } from "@/components/PosterCard";
import { ChevronLeft, ChevronRight, ListIcon, TrashIcon } from "@/components/Icons";
import type { Paginated, WatchlistDTO } from "@/lib/types";

export function WatchlistView({
  initial,
  profileName,
}: {
  initial: Paginated<WatchlistDTO> & { unavailableCount: number };
  profileName: string;
}) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load(page: number) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/watchlist?page=${page}&limit=24`);
      const next = (await response.json()) as typeof data & { error?: string };
      if (!response.ok) throw new Error(next.error ?? "Could not load your list");
      setData(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your list");
    } finally {
      setBusy(false);
    }
  }

  async function remove(titleId: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/watchlist/${titleId}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not remove title");
      await load(data.page);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not remove title");
      setBusy(false);
    }
  }

  return (
    <div className="rr-fade">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Saved for later</p>
        <h1 className="display text-3xl md:text-4xl">{profileName}&apos;s list</h1>
        <p className="mt-1 text-sm text-muted">Only this profile can see or change these titles.</p>
      </header>

      {error && <p role="alert" className="mb-5 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}

      <div className="mb-5 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>{data.total} saved title{data.total === 1 ? "" : "s"}</span>
        <span>Page {data.page} of {data.pages}</span>
      </div>

      {data.unavailableCount > 0 && (
        <p className="mb-5 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {data.unavailableCount} saved item{data.unavailableCount === 1 ? "" : "s"} no longer available for this profile and {data.unavailableCount === 1 ? "was" : "were"} hidden.
        </p>
      )}

      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-raised px-6 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-card text-accent"><ListIcon /></span>
          <p className="display mb-2 text-xl">Nothing saved yet</p>
          <p className="mb-6 text-sm text-muted">Add a title from its details page and it will be waiting here.</p>
          <Link href="/browse" className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-bright">Browse the catalogue</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.items.filter((item) => item.title !== null).map((item) => (
            <div key={item.id} className="group/item">
              <PosterCard title={item.title!} />
              <button type="button" onClick={() => remove(item.titleId)} disabled={busy}
                aria-label={`Remove ${item.title!.title} from list`}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2 text-xs text-muted transition hover:border-bad hover:text-bad disabled:opacity-40">
                <TrashIcon className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {data.pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Watchlist pages">
          <button type="button" onClick={() => load(data.page - 1)} disabled={data.page <= 1 || busy} aria-label="Previous page"
            className="rounded-lg border border-line p-2 text-muted hover:border-accent hover:text-cream disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted">{data.page} / {data.pages}</span>
          <button type="button" onClick={() => load(data.page + 1)} disabled={data.page >= data.pages || busy} aria-label="Next page"
            className="rounded-lg border border-line p-2 text-muted hover:border-accent hover:text-cream disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
