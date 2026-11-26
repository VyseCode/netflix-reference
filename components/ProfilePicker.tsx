"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PencilIcon, ShieldIcon } from "@/components/Icons";
import type { ProfileDTO } from "@/lib/types";

export function ProfilePicker({
  profiles,
  activeId,
}: {
  profiles: ProfileDTO[];
  activeId: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");

  async function choose(id: string) {
    setPending(id);
    setError("");
    try {
      const response = await fetch(`/api/profiles/${id}/switch`, { method: "POST" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Could not switch profile");
      router.push("/browse");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not switch profile");
      setPending("");
    }
  }

  return (
    <div className="mx-auto max-w-4xl py-10 text-center md:py-16">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-accent">REELROOM</p>
      <h1 className="display mb-3 text-4xl md:text-5xl">Who&apos;s watching?</h1>
      <p className="mb-12 text-muted">Each profile keeps its own list, history and recommendations.</p>

      {error && (
        <p role="alert" className="mx-auto mb-8 max-w-md rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            onClick={() => choose(profile.id)}
            disabled={pending === profile.id}
            className="group flex w-36 flex-col items-center gap-3 rounded-2xl p-4 transition hover:bg-raised disabled:opacity-60"
          >
            <span
              className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-transparent text-3xl font-bold text-ink transition group-hover:border-cream group-focus-visible:border-accent"
              style={{ backgroundColor: profile.avatarColor }}
              aria-hidden="true"
            >
              {profile.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-sm font-medium text-cream">{profile.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              {profile.kids ? (<><ShieldIcon className="h-3.5 w-3.5 text-good" /> Kids · max {profile.maxRating}</>) : "All profiles"}
            </span>
            {profile.id === activeId && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-ink">
                Active
              </span>
            )}
          </button>
        ))}
      </div>

      <Link
        href="/profiles/manage"
        className="mt-14 inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-cream transition hover:border-accent"
      >
        <PencilIcon className="h-4 w-4" /> Manage profiles <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
