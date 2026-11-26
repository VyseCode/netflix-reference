"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, FilmIcon } from "@/components/Icons";
import { PosterCard } from "@/components/PosterCard";
import type { BrowseRowDTO } from "@/lib/types";

export function Row({ row }: { row: BrowseRowDTO }) {
  const railRef = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    railRef.current?.scrollBy({ left: direction * 560, behavior: "smooth" });
  }

  return (
    <section className="mb-10" aria-labelledby={`row-${row.id}`}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 id={`row-${row.id}`} className="display text-xl md:text-2xl">{row.title}</h2>
          <p className="mt-0.5 text-xs text-muted">{row.subtitle}</p>
        </div>
        {row.items.length > 0 && (
          <div className="flex gap-1">
            <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${row.title} left`}
              className="rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-cream">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${row.title} right`}
              className="rounded-lg border border-line p-2 text-muted transition hover:border-accent hover:text-cream">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {row.items.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-raised px-5 py-6 text-sm text-muted">
          <FilmIcon className="h-5 w-5 shrink-0 text-accent" />
          <span>Nothing here yet. Your activity will fill this row in as you watch.</span>
        </div>
      ) : (
        <div ref={railRef} className="rail -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {row.items.map((title) => (
            <PosterCard
              key={title.id}
              title={title}
              matchScore={title.matchScore}
              reason={title.reason}
            />
          ))}
        </div>
      )}
    </section>
  );
}
