"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PosterCard } from "@/components/PosterCard";
import { ChevronLeft, ChevronRight, SearchIcon } from "@/components/Icons";
import type { Paginated, TitleDTO } from "@/lib/types";

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music",
  "Mystery", "Romance", "Sci-Fi", "Sport", "Thriller", "Western",
];

export interface SearchQuery {
  q: string;
  type: string;
  genre: string;
  sort: string;
  yearFrom: string;
  yearTo: string;
  page: number;
}

export function SearchView({
  initial,
  initialQuery,
}: {
  initial: Paginated<TitleDTO>;
  initialQuery: SearchQuery;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(page: number) {
    const next = { ...query, page };
    setQuery(next);
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: next.q,
        type: next.type,
        genre: next.genre,
        sort: next.sort,
        page: String(next.page),
        limit: "24",
      });
      if (next.yearFrom) params.set("yearFrom", next.yearFrom);
      if (next.yearTo) params.set("yearTo", next.yearTo);
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = (await response.json()) as Paginated<TitleDTO> & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Search failed");
      setResults(data);
      router.replace(`/search?${params.toString()}`, { scroll: false });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(1);
  }

  return (
    <div className="rr-fade">
      <header className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.28em] text-accent">Catalogue</p>
        <h1 className="display text-3xl md:text-4xl">Find your next watch</h1>
        <p className="mt-1 text-sm text-muted">Search titles, cast and descriptions. Results respect this profile&apos;s rating limit.</p>
      </header>

      <form onSubmit={submit} className="mb-8 rounded-2xl border border-line bg-raised p-5" aria-label="Search filters">
        <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
          <label className="block text-sm text-cream">
            Search
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-line bg-ink px-3 py-2">
              <SearchIcon className="h-4 w-4 text-muted" />
              <input
                value={query.q} onChange={(e) => setQuery({ ...query, q: e.target.value })}
                placeholder="Title, genre or cast member"
                className="w-full bg-transparent text-cream outline-none placeholder:text-muted/60"
              />
            </span>
          </label>
          <label className="block text-sm text-cream">
            Type
            <select value={query.type} onChange={(e) => setQuery({ ...query, type: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream">
              <option value="all">Movies and series</option>
              <option value="movie">Movies</option>
              <option value="series">Series</option>
            </select>
          </label>
          <label className="block text-sm text-cream">
            Genre
            <select value={query.genre} onChange={(e) => setQuery({ ...query, genre: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream">
              <option value="">All genres</option>
              {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <label className="block text-sm text-cream">
            From year
            <input type="number" min={1930} max={2100} value={query.yearFrom}
              onChange={(e) => setQuery({ ...query, yearFrom: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream" />
          </label>
          <label className="block text-sm text-cream">
            To year
            <input type="number" min={1930} max={2100} value={query.yearTo}
              onChange={(e) => setQuery({ ...query, yearTo: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream" />
          </label>
          <label className="block text-sm text-cream">
            Sort by
            <select value={query.sort} onChange={(e) => setQuery({ ...query, sort: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-cream">
              <option value="relevance">Relevance</option>
              <option value="rating">Highest rated</option>
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
            </select>
          </label>
          <button type="submit" disabled={loading}
            className="rounded-lg bg-accent px-6 py-2 font-semibold text-accent-ink hover:bg-accent-bright disabled:opacity-50">
            {loading ? "Searching…" : "Apply"}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="mb-5 rounded-lg border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>}

      <div className="mb-4 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>{results.total} title{results.total === 1 ? "" : "s"} found</span>
        <span>Page {results.page} of {results.pages}</span>
      </div>

      {results.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-raised px-6 py-14 text-center">
          <p className="display mb-2 text-xl">No matches in this room</p>
          <p className="text-sm text-muted">Try a broader genre, a different decade, or clear the filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.items.map((title) => <PosterCard key={title.id} title={title} />)}
        </div>
      )}

      {results.pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Search results pages">
          <button type="button" onClick={() => run(results.page - 1)} disabled={results.page <= 1 || loading}
            aria-label="Previous page"
            className="rounded-lg border border-line p-2 text-muted hover:border-accent hover:text-cream disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-muted">{results.page} / {results.pages}</span>
          <button type="button" onClick={() => run(results.page + 1)} disabled={results.page >= results.pages || loading}
            aria-label="Next page"
            className="rounded-lg border border-line p-2 text-muted hover:border-accent hover:text-cream disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
