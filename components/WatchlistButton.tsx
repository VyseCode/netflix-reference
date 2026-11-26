"use client";

import { useState } from "react";
import { CheckIcon, PlusIcon } from "@/components/Icons";

export function WatchlistButton({
  titleId,
  initialInList,
}: {
  titleId: string;
  initialInList: boolean;
}) {
  const [inList, setInList] = useState(initialInList);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        inList ? `/api/watchlist/${titleId}` : "/api/watchlist",
        {
          method: inList ? "DELETE" : "POST",
          headers: inList ? undefined : { "Content-Type": "application/json" },
          body: inList ? undefined : JSON.stringify({ titleId }),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok && !(inList && response.status === 404)) {
        throw new Error(data.error ?? "Could not update your list");
      }
      setInList(!inList);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update your list");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={toggle} disabled={pending}
        className={`flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold transition disabled:opacity-50 ${
          inList
            ? "border-good/50 bg-good/10 text-good hover:border-good"
            : "border-cream/30 bg-ink/40 text-cream backdrop-blur hover:border-accent"
        }`}>
        {inList ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
        {inList ? "In My List" : "Add to My List"}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-bad">{error}</p>}
    </div>
  );
}
