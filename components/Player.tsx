"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, InfoIcon, PlayIcon, ShieldIcon } from "@/components/Icons";
import type { PlaybackInfo } from "@/lib/media-adapter";

interface PlayerData {
  title: {
    id: string;
    name: string;
    type: "movie" | "series";
    thumbnailUrl: string;
    durationMinutes: number;
  };
  episode: { id: string; name: string; episodeNumber: number; durationMinutes: number } | null;
  playback: PlaybackInfo;
  progress: {
    positionSeconds: number;
    durationSeconds: number;
    completed: boolean;
    episodeId: string | null;
  } | null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function Player({
  titleId,
  episodeId,
  profileName,
}: {
  titleId: string;
  episodeId: string | null;
  profileName: string;
}) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(0);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(0);
  const positionRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const query = episodeId ? `?episode=${encodeURIComponent(episodeId)}` : "";
        const response = await fetch(`/api/player/${titleId}${query}`);
        const result = (await response.json()) as PlayerData & { error?: string };
        setStatus(response.status);
        if (!response.ok) throw new Error(result.error ?? "Could not open the player");
        if (cancelled) return;
        setData(result);
        const resume =
          result.progress && result.progress.episodeId === (result.episode?.id ?? null)
            ? result.progress.positionSeconds
            : 0;
        setPosition(resume);
        positionRef.current = resume;
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not open the player");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [titleId, episodeId]);

  const duration = data?.episode
    ? data.episode.durationMinutes * 60
    : (data?.title.durationMinutes ?? 0) * 60;

  const save = useCallback(async (value: number) => {
    if (!data) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/progress/${titleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionSeconds: Math.min(Math.round(value), duration),
          durationSeconds: duration,
          episodeId: data.episode?.id ?? null,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save progress");
      setMessage(`Progress saved at ${formatTime(value)} for ${profileName}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save progress");
    } finally {
      setSaving(false);
    }
  }, [data, titleId, duration, profileName]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const next = Math.min(positionRef.current + 1, duration);
      positionRef.current = next;
      setPosition(next);
      if (next >= duration && duration > 0) {
        setPlaying(false);
        void save(duration);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing, duration, save]);

  function pause() {
    setPlaying(false);
    void save(position);
  }

  if (loading) {
    return (
      <div className="animate-pulse" aria-busy="true">
        <div className="mb-5 h-8 w-52 rounded bg-raised" />
        <div className="aspect-video rounded-2xl bg-raised" />
        <div className="mt-6 h-3 rounded bg-raised" />
      </div>
    );
  }

  if (status === 403 || error.includes("rating limit")) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-good/15 text-good"><ShieldIcon /></span>
        <h1 className="display mb-2 text-2xl">Not available for {profileName}</h1>
        <p className="mb-6 text-sm text-muted">{error}</p>
        <Link href="/browse" className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink">Back to Browse</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-bad/40 bg-bad/10 px-5 py-8 text-center">
        <p className="mb-2 font-semibold text-bad">The player could not load</p>
        <p className="mb-4 text-sm text-muted">{error}</p>
        <Link href="/browse" className="rounded-lg border border-line px-4 py-2 text-sm">Back to Browse</Link>
      </div>
    );
  }

  return (
    <div className="rr-fade">
      <Link href={`/title/${titleId}`} className="mb-5 inline-flex items-center gap-2 text-sm text-muted hover:text-cream">
        <ChevronLeft className="h-4 w-4" /> Back to details
      </Link>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Now playing · {profileName}</p>
          <h1 className="display text-3xl">{data.title.name}</h1>
          {data.episode && <p className="mt-1 text-sm text-muted">S{data.episode.episodeNumber} · {data.episode.name}</p>}
        </div>
        <span className="rounded-lg border border-line px-3 py-2 text-xs text-muted">
          {data.playback.simulated ? "Simulated playback" : data.playback.provider}
        </span>
      </header>

      <section
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-line bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(14,17,22,.55),rgba(14,17,22,.82)), url(${data.title.thumbnailUrl})` }}
        aria-label={`Playback surface for ${data.title.name}`}
      >
        <button type="button" onClick={() => (playing ? pause() : setPlaying(true))}
          disabled={duration > 0 && position >= duration}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-ink transition hover:scale-105 disabled:opacity-40">
          <PlayIcon className="h-8 w-8" />
        </button>
        <span className="absolute bottom-4 left-5 text-xs text-cream/70">
          {playing ? "Playing" : position >= duration && duration > 0 ? "Finished" : "Ready"}
        </span>
      </section>

      <div className="mt-6 rounded-2xl border border-line bg-raised p-5">
        <label htmlFor="seek" className="mb-3 flex items-center justify-between text-sm">
          <span className="text-cream">Timeline</span>
          <span className="text-muted">{formatTime(position)} / {formatTime(duration)}</span>
        </label>
        <input
          id="seek" type="range" min={0} max={Math.max(1, duration)} value={Math.min(position, duration)}
          onChange={(e) => {
            const value = Number(e.target.value);
            positionRef.current = value;
            setPosition(value);
          }}
          aria-label="Seek playback position"
          className="w-full accent-[#e8a33d]"
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => void save(position)} disabled={saving}
            className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-ink disabled:opacity-50">
            {saving ? "Saving…" : "Save progress"}
          </button>
          <button type="button" onClick={() => { positionRef.current = duration; setPosition(duration); void save(duration); }} disabled={saving}
            className="rounded-lg border border-line px-5 py-2.5 font-semibold text-cream hover:border-accent disabled:opacity-50">
            Mark as watched
          </button>
          <button type="button" onClick={() => window.location.reload()} className="rounded-lg border border-line px-5 py-2.5 text-sm text-muted hover:text-cream">
            Reload player
          </button>
        </div>
        {message && <p role="status" className="mt-4 text-sm text-good">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-bad">{error}</p>}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-dashed border-line px-5 py-4 text-xs text-muted">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p className="text-cream">Media is simulated; progress is real.</p>
          <p className="mt-1 break-all">Playback URL: {data.playback.url}</p>
          <p className="mt-1">{data.playback.note}</p>
        </div>
      </div>
    </div>
  );
}
