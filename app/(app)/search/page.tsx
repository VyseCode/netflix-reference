import { SearchView, type SearchQuery } from "@/components/SearchView";
import { listTitles } from "@/lib/queries";
import { requireProfile } from "@/lib/session";

export const metadata = { title: "Search" };

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function numeric(value: string | string[] | undefined): number | undefined {
  const parsed = Number(first(value));
  return first(value) !== "" && Number.isFinite(parsed) ? parsed : undefined;
}

export default async function SearchPage(props: PageProps<"/search">) {
  const { profile } = await requireProfile();
  const params = await props.searchParams;

  const query: SearchQuery = {
    q: first(params.q),
    type: first(params.type) || "all",
    genre: first(params.genre),
    sort: first(params.sort) || "relevance",
    yearFrom: first(params.yearFrom),
    yearTo: first(params.yearTo),
    page: numeric(params.page) ?? 1,
  };

  const result = await listTitles(profile, {
    q: query.q,
    type: query.type as "movie" | "series" | "all",
    genre: query.genre,
    yearFrom: numeric(params.yearFrom),
    yearTo: numeric(params.yearTo),
    sort: query.sort as "relevance" | "rating" | "newest" | "trending",
    page: query.page,
    limit: 24,
  });

  return <SearchView initial={result} initialQuery={query} />;
}
