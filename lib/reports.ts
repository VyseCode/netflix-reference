import { Types } from "mongoose";
import { getContinueWatching } from "@/lib/queries";
import type { DashboardDTO, Maturity } from "@/lib/types";
import { Profile } from "@/models/Profile";
import { Progress } from "@/models/Progress";
import { Reaction } from "@/models/Reaction";
import { Title } from "@/models/Title";
import { WatchlistItem } from "@/models/WatchlistItem";

interface AggregateRow {
  _id: null;
  started: number;
  completed: number;
  seconds: number;
}

interface ProgressRow {
  title: Types.ObjectId;
  positionSeconds: number;
  completed: boolean;
}

interface TitleRow {
  _id: Types.ObjectId;
  type: "movie" | "series";
  genres: string[];
}

export async function getDashboard(profileId: string): Promise<DashboardDTO | null> {
  const profile = await Profile.findById(profileId)
    .select("name avatarColor kids maxRating createdAt")
    .lean();
  if (!profile) return null;

  const [watchlist, liked, disliked, aggregate, rows, recent] = await Promise.all([
    WatchlistItem.countDocuments({ profile: profileId }),
    Reaction.countDocuments({ profile: profileId, value: "like" }),
    Reaction.countDocuments({ profile: profileId, value: "dislike" }),
    Progress.aggregate<AggregateRow>([
      { $match: { profile: new Types.ObjectId(profileId) } },
      {
        $group: {
          _id: null,
          started: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] } },
          seconds: { $sum: "$positionSeconds" },
        },
      },
    ]),
    Progress.find({ profile: profileId })
      .select("title positionSeconds completed")
      .limit(200)
      .lean() as unknown as Promise<ProgressRow[]>,
    getContinueWatching(profileId, 8),
  ]);

  const ids = [...new Set(rows.map((row) => row.title.toString()))].slice(0, 200);
  const titles = ids.length
    ? (await Title.find({ _id: { $in: ids } })
        .select("type genres")
        .limit(200)
        .lean()) as unknown as TitleRow[]
    : [];
  const titleById = new Map(titles.map((title) => [title._id.toString(), title]));

  const genreMinutes = new Map<string, number>();
  let seriesFinished = 0;
  for (const row of rows) {
    const title = titleById.get(row.title.toString());
    if (!title) continue;
    if (row.completed && title.type === "series") seriesFinished += 1;
    const minutes = row.positionSeconds / 60;
    for (const genre of title.genres) {
      genreMinutes.set(genre, (genreMinutes.get(genre) ?? 0) + minutes);
    }
  }

  const stats = aggregate[0] ?? { started: 0, completed: 0, seconds: 0 };
  return {
    profile: {
      id: profile._id.toString(),
      name: profile.name,
      avatarColor: profile.avatarColor,
      kids: profile.kids,
      maxRating: profile.maxRating as Maturity,
      createdAt: profile.createdAt.toISOString(),
    },
    totals: {
      watchlist,
      liked,
      disliked,
      started: stats.started,
      completed: stats.completed,
      minutesWatched: Math.round(stats.seconds / 60),
      seriesFinished,
    },
    topGenres: [...genreMinutes.entries()]
      .map(([genre, minutes]) => ({ genre, minutes: Math.round(minutes) }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6),
    recent,
    completionRate: stats.started ? Math.round((stats.completed / stats.started) * 100) : 0,
  };
}
