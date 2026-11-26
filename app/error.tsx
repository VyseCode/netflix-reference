"use client";

import { useEffect } from "react";
import { InfoIcon } from "@/components/Icons";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md rounded-2xl border border-line bg-raised p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-card text-accent">
          <InfoIcon />
        </span>
        <h1 className="display mb-2 text-2xl">Something interrupted the show</h1>
        <p className="mb-6 text-sm text-muted">
          We could not load this page. Try again — your list and progress are safe.
        </p>
        <button
          type="button" onClick={reset}
          className="rounded-lg bg-accent px-5 py-3 font-semibold text-accent-ink hover:bg-accent-bright"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
