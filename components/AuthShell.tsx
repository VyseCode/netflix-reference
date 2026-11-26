import type { ReactNode } from "react";
import { FilmIcon, ListIcon, PlayIcon, ShieldIcon } from "@/components/Icons";

export function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: ReactNode;
}) {
  const isRegister = mode === "register";
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden border-r border-line bg-raised px-12 py-14 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-accent/20" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full border border-accent/10" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-ink">
            <FilmIcon />
          </span>
          <span className="display text-xl font-bold tracking-[0.18em]">REELROOM</span>
        </div>
        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {isRegister ? "Your room, your rules" : "Welcome back"}
          </p>
          <h1 className="display mb-6 text-5xl leading-[1.08] text-cream">
            {isRegister
              ? "A better seat for every story."
              : "Pick up where you left off."}
          </h1>
          <p className="mb-10 text-lg leading-relaxed text-muted">
            {isRegister
              ? "Build profiles for the whole household, keep a list that is actually yours, and let the recommendations learn from what you finish."
              : "Your watchlist, your progress and your profiles are exactly where you left them."}
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm text-cream">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-accent"><PlayIcon /></span>
              Five profiles, each with its own history
            </li>
            <li className="flex items-center gap-3 text-sm text-cream">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-accent"><ListIcon /></span>
              A watchlist that follows the right profile
            </li>
            <li className="flex items-center gap-3 text-sm text-cream">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-accent"><ShieldIcon /></span>
              Parental controls with real maturity limits
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-muted">
          Reference implementation · local demo data · no external services
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 md:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <span className="display text-xl font-bold tracking-[0.18em] text-accent">REELROOM</span>
          </div>
          <div className="rounded-2xl border border-line bg-raised p-7 shadow-2xl shadow-black/30 md:p-10">
            <h2 className="display mb-2 text-3xl text-cream">
              {isRegister ? "Create your account" : "Sign in to REELROOM"}
            </h2>
            <p className="mb-8 text-sm text-muted">
              {isRegister
                ? "One account. Up to five personal profiles."
                : "Use a demo account or your own credentials."}
            </p>
            {children}
          </div>
          {!isRegister && (
            <p className="mt-6 rounded-lg border border-line bg-card px-4 py-3 text-xs leading-relaxed text-muted">
              Demo: <span className="text-cream">alex@reelroom.dev</span> / password123
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
