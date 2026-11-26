import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { mediaAdapter } from "@/lib/media-adapter";
import { resolveActiveProfile } from "@/lib/session";
import type { Maturity } from "@/models/Title";
import { Episode } from "@/models/Episode";
import { Progress } from "@/models/Progress";
import { Title } from "@/models/Title";

const paramsSchema = z.object({
  titleId: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid title id"),
});

export async function GET(
  request: Request,
  context: RouteContext<"/api/player/[titleId]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const { titleId } = paramsSchema.parse(await context.params);
    await connectDB();

    const title = await Title.findById(titleId)
      .select("title type maturity thumbnailUrl durationMinutes")
      .lean();
    if (!title) return fail("Title not found", 404);
    if (title.maturity > (profile.maxRating as Maturity)) {
      return fail("This title is above your profile's rating limit", 403);
    }

    const episodeId = new URL(request.url).searchParams.get("episode");
    let episode: { id: string; name: string; episodeNumber: number; durationMinutes: number } | null = null;
    if (episodeId) {
      if (!Types.ObjectId.isValid(episodeId)) return fail("Invalid episode id", 400);
      const doc = await Episode.findOne({ _id: episodeId, title: titleId })
        .select("name episodeNumber durationMinutes")
        .lean();
      if (!doc) return fail("Episode not found for this title", 404);
      episode = {
        id: doc._id.toString(),
        name: doc.name,
        episodeNumber: doc.episodeNumber,
        durationMinutes: doc.durationMinutes,
      };
    }

    const progress = await Progress.findOne({ profile: profile.id, title: titleId })
      .select("positionSeconds durationSeconds completed episode")
      .lean();

    return ok({
      title: {
        id: titleId,
        name: title.title,
        type: title.type,
        thumbnailUrl: title.thumbnailUrl,
        durationMinutes: title.durationMinutes,
      },
      episode,
      playback: mediaAdapter.getPlaybackUrl({ titleId, episodeId }),
      progress: progress
        ? {
            positionSeconds: progress.positionSeconds,
            durationSeconds: progress.durationSeconds,
            completed: progress.completed,
            episodeId: progress.episode?.toString() ?? null,
          }
        : null,
    });
  } catch (error) {
    return handleError(error);
  }
}
