"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CheckIcon, CloseIcon, PencilIcon, PlusIcon, ShieldIcon, TrashIcon } from "@/components/Icons";
import type { Maturity, ProfileDTO } from "@/lib/types";

const colors = ["#e8a33d", "#74c69d", "#6fc3d6", "#ef8d6d", "#d8b653", "#c9d7dd"];
const ratings: Array<{ value: Maturity; label: string }> = [
  { value: 0, label: "G — General" },
  { value: 7, label: "PG — Parental guidance" },
  { value: 13, label: "PG-13 — Ages 13+" },
  { value: 16, label: "R — Ages 16+" },
  { value: 18, label: "NC-17 — Adults only" },
];

interface EditState {
  name: string;
  avatarColor: string;
  kids: boolean;
  maxRating: Maturity;
}

export function ProfileManager({
  profiles,
  activeId,
}: {
  profiles: ProfileDTO[];
  activeId: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [kids, setKids] = useState(false);
  const [maxRating, setMaxRating] = useState<Maturity>(18);
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function request(url: string, method: string, body?: unknown) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Something went wrong");
      router.refresh();
      return data;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    const result = await request("/api/profiles", "POST", { name, avatarColor: color, kids, maxRating });
    if (result) {
      setName("");
      setKids(false);
      setMaxRating(18);
    }
  }

  function startEdit(profile: ProfileDTO) {
    setEditing(profile.id);
    setEdit({
      name: profile.name,
      avatarColor: profile.avatarColor,
      kids: profile.kids,
      maxRating: profile.maxRating,
    });
  }

  async function save(id: string) {
    if (!edit) return;
    const result = await request(`/api/profiles/${id}`, "PATCH", edit);
    if (result) setEditing(null);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this profile and all of its list, reactions and progress?")) return;
    await request(`/api/profiles/${id}`, "DELETE");
  }

  return (
    <div className="mx-auto max-w-5xl py-4">
      <header className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Settings</p>
        <h1 className="display mb-2 text-4xl">Manage profiles</h1>
        <p className="text-sm text-muted">
          Up to five profiles per account. Kids profiles cannot open titles above their rating limit.
        </p>
      </header>

      {error && (
        <p role="alert" className="mb-6 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          {profiles.map((profile) => (
            <article key={profile.id} className="rounded-2xl border border-line bg-raised p-5">
              {editing === profile.id && edit ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl font-bold text-ink"
                      style={{ backgroundColor: edit.avatarColor }}
                      aria-hidden="true"
                    >
                      {edit.name.slice(0, 1).toUpperCase() || "?"}
                    </span>
                    <input
                      aria-label="Profile name" value={edit.name} maxLength={24}
                      onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-line bg-ink px-3 py-2 text-cream focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Avatar colour">
                    {colors.map((swatch) => (
                      <button
                        key={swatch} type="button" aria-label={`Colour ${swatch}`}
                        aria-pressed={edit.avatarColor === swatch}
                        onClick={() => setEdit({ ...edit, avatarColor: swatch })}
                        className={`h-8 w-8 rounded-full border-2 ${edit.avatarColor === swatch ? "border-cream" : "border-transparent"}`}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex items-center gap-3 text-sm text-cream">
                      <input type="checkbox" checked={edit.kids}
                        onChange={(e) => setEdit({
                          ...edit,
                          kids: e.target.checked,
                          maxRating: e.target.checked && edit.maxRating > 13 ? 13 : edit.maxRating,
                        })}
                        className="h-4 w-4 accent-[#e8a33d]"
                      />
                      Kids profile
                    </label>
                    <label className="text-sm text-cream">
                      Maximum rating
                      <select
                        value={edit.maxRating}
                        onChange={(e) => setEdit({ ...edit, maxRating: Number(e.target.value) as Maturity })}
                        className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream"
                      >
                        {ratings.filter((r) => !edit.kids || r.value <= 13).map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => save(profile.id)} disabled={busy}
                      className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50">
                      <CheckIcon className="h-4 w-4" /> Save
                    </button>
                    <button type="button" onClick={() => setEditing(null)}
                      className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm">
                      <CloseIcon className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-ink"
                    style={{ backgroundColor: profile.avatarColor }}
                    aria-hidden="true"
                  >
                    {profile.name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-cream">{profile.name}</h2>
                      {profile.id === activeId && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-accent-ink">Active</span>
                      )}
                      {profile.kids && <span className="flex items-center gap-1 text-xs text-good"><ShieldIcon className="h-3.5 w-3.5" /> Kids · max {profile.maxRating}</span>}
                    </div>
                    <p className="text-xs text-muted">Created {new Date(profile.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button type="button" onClick={() => startEdit(profile)} aria-label={`Edit ${profile.name}`}
                    className="rounded-lg border border-line p-2 text-muted hover:border-accent hover:text-cream">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => remove(profile.id)} disabled={busy || profiles.length <= 1} aria-label={`Delete ${profile.name}`}
                    className="rounded-lg border border-line p-2 text-muted hover:border-bad hover:text-bad disabled:opacity-30">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-2xl border border-line bg-raised p-6">
          <h2 className="display mb-1 text-xl">Add a profile</h2>
          <p className="mb-5 text-xs text-muted">{5 - profiles.length} slot{5 - profiles.length === 1 ? "" : "s"} remaining</p>
          <form onSubmit={create} className="space-y-4" noValidate>
            <div>
              <label htmlFor="new-name" className="mb-2 block text-sm text-cream">Name</label>
              <input id="new-name" value={name} onChange={(e) => setName(e.target.value)}
                maxLength={24} required placeholder="e.g. Jordan"
                className="w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream placeholder:text-muted/60 focus:border-accent focus:outline-none" />
            </div>
            <div>
              <span className="mb-2 block text-sm text-cream">Colour</span>
              <div className="flex gap-2" role="group" aria-label="Avatar colour">
                {colors.map((swatch) => (
                  <button key={swatch} type="button" aria-label={`Colour ${swatch}`}
                    aria-pressed={color === swatch}
                    onClick={() => setColor(swatch)}
                    className={`h-8 w-8 rounded-full border-2 ${color === swatch ? "border-cream" : "border-transparent"}`}
                    style={{ backgroundColor: swatch }} />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 text-sm text-cream">
              <input type="checkbox" checked={kids}
                onChange={(e) => {
                  setKids(e.target.checked);
                  if (e.target.checked && maxRating > 13) setMaxRating(13);
                }}
                className="h-4 w-4 accent-[#e8a33d]" />
              Kids profile
            </label>
            <label className="block text-sm text-cream">
              Maximum rating
              <select value={maxRating} onChange={(e) => setMaxRating(Number(e.target.value) as Maturity)}
                className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream">
                {ratings.filter((r) => !kids || r.value <= 13).map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy || profiles.length >= 5}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-accent-ink disabled:opacity-40">
              <PlusIcon className="h-4 w-4" /> Add profile
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
