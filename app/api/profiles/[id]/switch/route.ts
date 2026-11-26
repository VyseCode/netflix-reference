import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import type { Maturity } from "@/lib/types";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

const idSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid profile id"),
});

export async function POST(
  _request: Request,
  context: RouteContext<"/api/profiles/[id]/switch">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const { id } = idSchema.parse(await context.params);
    await connectDB();

    const profile = await Profile.findOne({ _id: id, account: session.userId })
      .select("name avatarColor kids maxRating")
      .lean();
    if (!profile) return fail("That profile does not belong to this account", 404);

    await User.updateOne(
      { _id: session.userId },
      { $set: { activeProfile: profile._id } },
    );

    return ok({
      profile: {
        id: profile._id.toString(),
        name: profile.name,
        avatarColor: profile.avatarColor,
        kids: profile.kids,
        maxRating: profile.maxRating as Maturity,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
