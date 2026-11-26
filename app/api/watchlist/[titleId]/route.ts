import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { resolveActiveProfile } from "@/lib/session";
import { WatchlistItem } from "@/models/WatchlistItem";

const paramsSchema = z.object({
  titleId: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid title id"),
});

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/watchlist/[titleId]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const { titleId } = paramsSchema.parse(await context.params);
    await connectDB();

    const result = await WatchlistItem.deleteOne({ profile: profile.id, title: titleId });
    if (result.deletedCount === 0) return fail("Title is not in your list", 404);
    return ok({ removed: true, titleId });
  } catch (error) {
    return handleError(error);
  }
}
