import { Types } from "mongoose";
import { maturityLabel } from "@/lib/maturity";
import { rankRecommendations } from "@/lib/recommend";
import type {
  BrowseDTO,
  BrowseRowDTO,
  Paginated,
  ProfileDTO,
  ProgressDTO,
  SeasonDTO,
  TitleDTO,
  TitleDetailDTO,
} from "@/lib/types";
import type { Maturity } from "@/models/Title";
import { Episode } from "@/models/Episode";
import { Progress } from "@/models/Progress";
import { Reaction } from "@/models/Reaction";
import { Season } from "@/models/Season";
import { Title } from "@/models/Title";

interface LeanTitle {
  _id: Types.ObjectId;
  type: "movie" | "series";
  title: string;
  genres: string[];
  year: number;
  rating: number;
  maturity: number;
  cast: string[];
  description: string;
  thumbnailUrl: string;
  durationMinutes: number;
  trendingScore: number;
  addedAt: Date;
}

interface LeanProgress {
  _id: Types.ObjectId;
  title: Types.ObjectId;
  episode: Types.ObjectId | null;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: Date;
}

interface LeanEpisode {
  _id: Types.ObjectId;
  season: Types.ObjectId;
  episodeNumber: number;
  name: string;
  description: string;
  durationMinutes: number;
  thumbnailUrl: string;
}

const TITLE_FIELDS =
  "type title genres year rating maturity cast description thumbnailUrl durationMinutes trendingScore addedAt";

export function titleToDTO(title: LeanTitle): TitleDTO {
  return {
    id: title._id.toString(),
    type: title.type,
    title: title.title,
    genres: title.genres,
    year: title.year,
    rating: title.rating,
    maturity: title.maturity as Maturity,
    maturityLabel: maturityLabel(title.maturity),
    cast: title.cast,
    description: title.description,
    thumbnailUrl: title.thumbnailUrl,
    durationMinutes: title.durationMinutes,
  };
}

function allowed(profile: { maxRating: number }): Record<string, unknown> {
  return { maturity: { $lte: profile.maxRating as Maturity } };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface TitleQuery {
  q?: string;
  type?: "movie" | "series" | "all";
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  sort?: "relevance" | "rating" | "newest" | "trending";
  page?: number;
  limit?: number;
}

export async function listTitles(
  profile: { maxRating: number },
  query: TitleQuery,
): Promise<Paginated<TitleDTO>> {
  const page = Math.min(Math.max(query.page ?? 1, 1), 10000);
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
  const filter: Record<string, unknown> = allowed(profile);
  const term = (query.q ?? "").trim();

  if (term) filter.$text = { $search: term };
  if (query.type && query.type !== "all") filter.type = query.type;
  if (query.genre) filter.genres = new RegExp(escapeRegex(query.genre), "i");
  if (query.yearFrom || query.yearTo) {
    filter.year = {
      ...(query.yearFrom ? { $gte: query.yearFrom } : {}),
      ...(query.yearTo ? { $lte: query.yearTo } : {}),
    };
  }

  const sort: Record<string, 1 | -1 | { $meta: "textScore" }> =
    query.sort === "rating"
      ? { rating: -1 }
      : query.sort === "newest"
        ? { addedAt: -1 }
        : query.sort === "trending"
          ? { trendingScore: -1 }
          : term
            ? { score: { $meta: "textScore" } }
            : { rating: -1 };

  const projection: Record<string, 1 | { $meta: "textScore" }> = {};
  for (const field of TITLE_FIELDS.split(" ")) projection[field] = 1;
  if (term && query.sort === "relevance") projection.score = { $meta: "textScore" };

  const [total, docs] = await Promise.all([
    Title.countDocuments(filter),
    Title.find(filter)
      .select(projection)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as unknown as Promise<LeanTitle[]>,
  ]);

  return {
    items: docs.map(titleToDTO),
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getContinueWatching(
  profileId: string,
  limit = 12,
): Promise<ProgressDTO[]> {
  const rows = (await Progress.find({
    profile: profileId,
    completed: false,
    positionSeconds: { $gt: 0 },
  })
    .select("title episode positionSeconds durationSeconds completed updatedAt")
    .sort({ updatedAt: -1 })
    .limit(Math.min(limit, 100))
    .lean()) as unknown as LeanProgress[];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.title);
  const titles = (await Title.find({ _id: { $in: ids } })
    .select("type title thumbnailUrl")
    .lean()) as unknown as Array<{
    _id: Types.ObjectId;
    type: "movie" | "series";
    title: string;
    thumbnailUrl: string;
  }>;
  const byId = new Map(titles.map((title) => [title._id.toString(), title]));

  return rows.flatMap((row) => {
    const title = byId.get(row.title.toString());
    if (!title) return [];
    return [{
      id: row._id.toString(),
      titleId: row.title.toString(),
      titleName: title.title,
      thumbnailUrl: title.thumbnailUrl,
      type: title.type,
      episodeId: row.episode?.toString() ?? null,
      positionSeconds: row.positionSeconds,
      durationSeconds: row.durationSeconds,
      percent: Math.min(100, Math.round((row.positionSeconds / row.durationSeconds) * 100)),
      completed: row.completed,
      updatedAt: row.updatedAt.toISOString(),
    }];
  });
}

export async function getBrowse(profile: ProfileDTO): Promise<BrowseDTO> {
  const [trending, fresh, top, recommendations, liked, continueWatching] =
    await Promise.all([
      Title.find(allowed(profile)).select(TITLE_FIELDS).sort({ trendingScore: -1 }).limit(12).lean() as unknown as Promise<LeanTitle[]>,
      Title.find(allowed(profile)).select(TITLE_FIELDS).sort({ addedAt: -1 }).limit(12).lean() as unknown as Promise<LeanTitle[]>,
      Title.find(allowed(profile)).select(TITLE_FIELDS).sort({ rating: -1 }).limit(12).lean() as unknown as Promise<LeanTitle[]>,
      rankRecommendations(profile.id, profile.maxRating, 12),
      Reaction.find({ profile: profile.id, value: "like" })
        .select("title")
        .limit(200)
        .lean() as unknown as Promise<Array<{ title: Types.ObjectId }>>,
      getContinueWatching(profile.id),
    ]);

  const likedIds = liked.map((row) => row.title).slice(0, 100);
  const likedTitles = likedIds.length
    ? (await Title.find({ _id: { $in: likedIds }, ...allowed(profile) })
        .select(TITLE_FIELDS)
        .limit(100)
        .lean()) as unknown as LeanTitle[]
    : [];

  const rows: BrowseRowDTO[] = [
    { id: "trending", title: "Trending this week", subtitle: "What everyone in the room is watching", items: trending.map(titleToDTO) },
    { id: "for-you", title: `Picked for ${profile.name}`, subtitle: "Ranked from your genres, likes and finishes", items: recommendations },
    { id: "new", title: "Newly added", subtitle: "Fresh arrivals, picked for this profile", items: fresh.map(titleToDTO) },
    { id: "top", title: "Top rated", subtitle: "The best-scoring titles in the catalogue", items: top.map(titleToDTO) },
    { id: "from-likes", title: "From your likes", subtitle: likedIds.length ? "Titles you gave a thumbs up" : "Like a title to start this row", items: likedTitles.map(titleToDTO) },
  ];

  return { profile, rows, continueWatching };
}

export async function getEpisodeRows(titleId: string): Promise<SeasonDTO[]> {
  const seasons = (await Season.find({ title: titleId })
    .select("seasonNumber year episodeCount")
    .sort({ seasonNumber: 1 })
    .limit(50)
    .lean()) as unknown as Array<{
    _id: Types.ObjectId;
    seasonNumber: number;
    year: number;
    episodeCount: number;
  }>;
  if (seasons.length === 0) return [];

  const episodes = (await Episode.find({ season: { $in: seasons.map((season) => season._id) } })
    .select("season episodeNumber name description durationMinutes thumbnailUrl")
    .sort({ episodeNumber: 1 })
    .limit(1000)
    .lean()) as unknown as LeanEpisode[];

  const bySeason = new Map<string, LeanEpisode[]>();
  for (const episode of episodes) {
    const key = episode.season.toString();
    const list = bySeason.get(key) ?? [];
    list.push(episode);
    bySeason.set(key, list);
  }

  return seasons.map((season) => ({
    id: season._id.toString(),
    seasonNumber: season.seasonNumber,
    year: season.year,
    episodeCount: season.episodeCount,
    episodes: (bySeason.get(season._id.toString()) ?? []).map((episode) => ({
      id: episode._id.toString(),
      seasonId: season._id.toString(),
      episodeNumber: episode.episodeNumber,
      name: episode.name,
      description: episode.description,
      durationMinutes: episode.durationMinutes,
      thumbnailUrl: episode.thumbnailUrl,
    })),
  }));
}

export type TitleDetailResult =
  | { state: "ok"; data: TitleDetailDTO }
  | { state: "not-found" }
  | { state: "forbidden" };

export async function getTitleDetail(
  id: string,
  profile: { maxRating: number },
): Promise<TitleDetailResult> {
  if (!Types.ObjectId.isValid(id)) return { state: "not-found" };
  const doc = (await Title.findById(id).select(TITLE_FIELDS).lean()) as unknown as LeanTitle | null;
  if (!doc) return { state: "not-found" };
  if (doc.maturity > profile.maxRating) return { state: "forbidden" };

  const seasons = await getEpisodeRows(id);
  return {
    state: "ok",
    data: {
      ...titleToDTO(doc),
      seasons,
      inWatchlist: false,
      reaction: null,
    },
  };
}
