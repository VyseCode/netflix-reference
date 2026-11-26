import { Types } from "mongoose";
import { maturityLabel } from "@/lib/maturity";
import type { RecommendationDTO } from "@/lib/types";
import { Progress } from "@/models/Progress";
import { Reaction } from "@/models/Reaction";
import { Title, type Maturity } from "@/models/Title";

interface LeanReaction {
  title: Types.ObjectId;
  value: "like" | "dislike";
}

interface LeanProgress {
  title: Types.ObjectId;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

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
}

export async function rankRecommendations(
  profileId: string,
  maxRating: number,
  limit = 20,
): Promise<RecommendationDTO[]> {
  const [reactions, progress] = await Promise.all([
    Reaction.find({ profile: profileId })
      .select("title value")
      .limit(400)
      .lean() as unknown as Promise<LeanReaction[]>,
    Progress.find({ profile: profileId })
      .select("title positionSeconds durationSeconds completed")
      .limit(400)
      .lean() as unknown as Promise<LeanProgress[]>,
  ]);

  const weights = new Map<string, number>();
  const addGenre = (genre: string, amount: number) => {
    const key = genre.trim().toLowerCase();
    if (!key) return;
    weights.set(key, (weights.get(key) ?? 0) + amount);
  };

  const likedIds = new Set(
    reactions.filter((r) => r.value === "like").map((r) => r.title.toString()),
  );
  const dislikedIds = reactions
    .filter((r) => r.value === "dislike")
    .slice(0, 200)
    .map((r) => r.title);

  const signalIds = new Set([
    ...likedIds,
    ...dislikedIds.map((id) => id.toString()),
    ...progress.map((p) => p.title.toString()),
  ]);

  if (signalIds.size > 0) {
    const related = (await Title.find({ _id: { $in: [...signalIds].slice(0, 300) } })
      .select("genres")
      .lean()) as unknown as Array<{ _id: Types.ObjectId; genres: string[] }>;
    const genresById = new Map(related.map((doc) => [doc._id.toString(), doc.genres]));

    for (const reaction of reactions) {
      const genres = genresById.get(reaction.title.toString()) ?? [];
      for (const genre of genres) {
        addGenre(genre, reaction.value === "like" ? 3.5 : -4);
      }
    }
    for (const item of progress) {
      const genres = genresById.get(item.title.toString()) ?? [];
      const amount = item.completed
        ? 2
        : item.positionSeconds / Math.max(1, item.durationSeconds) > 0.2
          ? 1
          : 0;
      for (const genre of genres) addGenre(genre, amount);
    }
  }

  const candidates = (await Title.find({
    maturity: { $lte: maxRating as Maturity },
    _id: { $nin: dislikedIds },
  })
    .select(
      "type title genres year rating maturity cast description thumbnailUrl durationMinutes trendingScore",
    )
    .sort({ trendingScore: -1 })
    .limit(400)
    .lean()) as unknown as LeanTitle[];

  const scored = candidates.map((title) => {
    let genreTotal = 0;
    let bestGenre = "";
    let bestWeight = 0;
    for (const genre of title.genres) {
      const weight = weights.get(genre.toLowerCase()) ?? 0;
      genreTotal += weight;
      if (weight > bestWeight) {
        bestWeight = weight;
        bestGenre = genre;
      }
    }
    const score =
      48 +
      genreTotal * 7 +
      (title.rating - 7) * 1.8 +
      title.trendingScore / 180;
    const matchScore = Math.max(5, Math.min(99, Math.round(score)));
    const reason =
      bestWeight > 0
        ? `Because you enjoy ${bestGenre}`
        : title.trendingScore > 650
          ? "Trending in REELROOM"
          : "A highly rated pick";
    return { title, matchScore, reason, sortScore: score };
  });

  scored.sort((a, b) => b.sortScore - a.sortScore || b.title.year - a.title.year);

  return scored.slice(0, Math.min(limit, 100)).map(({ title, matchScore, reason }) => ({
    id: title._id.toString(),
    type: title.type,
    title: title.title,
    genres: title.genres,
    year: title.year,
    rating: title.rating,
    maturity: title.maturity as RecommendationDTO["maturity"],
    maturityLabel: maturityLabel(title.maturity),
    cast: title.cast,
    description: title.description,
    thumbnailUrl: title.thumbnailUrl,
    durationMinutes: title.durationMinutes,
    matchScore,
    reason,
  }));
}
