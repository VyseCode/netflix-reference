import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getEpisodeRows } from "@/lib/queries";
import { resolveActiveProfile } from "@/lib/session";
import type { Maturity } from "@/models/Title";
import { Title } from "@/models/Title";

const idSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid title id"),
});

export async function GET(
  _request: Request,
  context: RouteContext<"/api/titles/[id]/episodes">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const { id } = idSchema.parse(await context.params);
    await connectDB();

    const title = await Title.findById(id).select("type maturity").lean();
    if (!title) return fail("Title not found", 404);
    if (title.maturity > (profile.maxRating as Maturity)) {
      return fail("This title is above your profile's rating limit", 403);
    }
    if (title.type !== "series") return fail("This title has no episodes", 400);

    return ok({ seasons: await getEpisodeRows(id) });
  } catch (error) {
    return handleError(error);
  }
}
