"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "@/components/Icons";

export function ReactionButtons({
  titleId,
  initial,
}: {
  titleId: string;
  initial: "like" | "dislike" | null;
}) {
  const [value, setValue] = useState(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function react(next: "like" | "dislike") {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/titles/${titleId}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: value === next ? "clear" : next }),
      });
      const data = (await response.json()) as { value?: "like" | "dislike" | null; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not save your reaction");
      setValue(data.value ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your reaction");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={() => react("like")} disabled={pending}
          aria-pressed={value === "like"} aria-label="Like this title"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold transition disabled:opacity-50 ${
            value === "like" ? "border-good/50 bg-good/10 text-good" : "border-cream/30 bg-ink/40 text-cream hover:border-accent"
          }`}>
          <ThumbsUp className="h-4 w-4" /> Like
        </button>
        <button type="button" onClick={() => react("dislike")} disabled={pending}
          aria-pressed={value === "dislike"} aria-label="Dislike this title"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 font-semibold transition disabled:opacity-50 ${
            value === "dislike" ? "border-bad/50 bg-bad/10 text-bad" : "border-cream/30 bg-ink/40 text-cream hover:border-accent"
          }`}>
          <ThumbsDown className="h-4 w-4" /> Not for me
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-bad">{error}</p>}
    </div>
  );
}
