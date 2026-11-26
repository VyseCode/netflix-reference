import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { resolveActiveProfile } from "@/lib/session";
import { progressSchema } from "@/lib/validation";
import type { Maturity } from "@/models/Title";
import { Episode } from "@/models/Episode";
import { Progress } from "@/models/Progress";
import { Title } from "@/models/Title";

const paramsSchema = z.object({
  titleId: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid title id"),
});

export async function PUT(
  request: Request,
  context: RouteContext<"/api/progress/[titleId]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const { titleId } = paramsSchema.parse(await context.params);
    const body = progressSchema.parse(await readJson(request));
    await connectDB();

    const title = await Title.findById(titleId).select("maturity durationMinutes").lean();
    if (!title) return fail("Title not found", 404);
    if (title.maturity > (profile.maxRating as Maturity)) {
      return fail("This title is above your profile's rating limit", 403);
    }

    let expectedDuration = title.durationMinutes * 60;
    if (body.episodeId) {
      const episode = await Episode.findOne({ _id: body.episodeId, title: titleId })
        .select("durationMinutes")
        .lean();
      if (!episode) return fail("Episode not found for this title", 404);
      expectedDuration = episode.durationMinutes * 60;
    }
    if (body.durationSeconds !== expectedDuration) {
      return fail("Duration does not match this title", 400);
    }
    if (body.positionSeconds > body.durationSeconds) {
      return fail("Position cannot be greater than the duration", 400);
    }

    const completed = body.positionSeconds >= body.durationSeconds;
    await Progress.updateOne(
      { profile: profile.id, title: titleId },
      {
        $set: {
          episode: body.episodeId ?? null,
          positionSeconds: body.positionSeconds,
          durationSeconds: body.durationSeconds,
          completed,
        },
      },
      { upsert: true },
    );

    const progress = await Progress.findOne({ profile: profile.id, title: titleId })
      .select("positionSeconds durationSeconds completed updatedAt")
      .lean();
    return ok({
      titleId,
      episodeId: body.episodeId ?? null,
      positionSeconds: progress?.positionSeconds ?? body.positionSeconds,
      durationSeconds: progress?.durationSeconds ?? body.durationSeconds,
      completed,
      percent: Math.round((body.positionSeconds / body.durationSeconds) * 100),
    });
  } catch (error) {
    return handleError(error);
  }
}
