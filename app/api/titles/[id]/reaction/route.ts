import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { resolveActiveProfile } from "@/lib/session";
import { reactionSchema } from "@/lib/validation";
import type { Maturity } from "@/models/Title";
import { Reaction } from "@/models/Reaction";
import { Title } from "@/models/Title";

const paramsSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid title id"),
});

export async function POST(
  request: Request,
  context: RouteContext<"/api/titles/[id]/reaction">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const { id } = paramsSchema.parse(await context.params);
    const { value } = reactionSchema.parse(await readJson(request));
    await connectDB();

    const title = await Title.findById(id).select("maturity").lean();
    if (!title) return fail("Title not found", 404);
    if (title.maturity > (profile.maxRating as Maturity)) {
      return fail("This title is above your profile's rating limit", 403);
    }

    if (value === "clear") {
      await Reaction.deleteOne({ profile: profile.id, title: id });
      return ok({ titleId: id, value: null });
    }

    await Reaction.updateOne(
      { profile: profile.id, title: id },
      { $set: { value } },
      { upsert: true },
    );
    return ok({ titleId: id, value });
  } catch (error) {
    return handleError(error);
  }
}
