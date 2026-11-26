import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, isDuplicateKeyError, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import type { Maturity, ProfileDTO } from "@/lib/types";
import { profileUpdateSchema } from "@/lib/validation";
import { Profile } from "@/models/Profile";
import { Progress } from "@/models/Progress";
import { Reaction } from "@/models/Reaction";
import { User } from "@/models/User";
import { WatchlistItem } from "@/models/WatchlistItem";

const idSchema = z.object({
  id: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid profile id"),
});

function dto(profile: {
  _id: Types.ObjectId;
  name: string;
  avatarColor: string;
  kids: boolean;
  maxRating: number;
  createdAt: Date;
}): ProfileDTO {
  return {
    id: profile._id.toString(),
    name: profile.name,
    avatarColor: profile.avatarColor,
    kids: profile.kids,
    maxRating: profile.maxRating as Maturity,
    createdAt: profile.createdAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  context: RouteContext<"/api/profiles/[id]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const { id } = idSchema.parse(await context.params);
    await connectDB();
    const profile = await Profile.findOne({ _id: id, account: session.userId })
      .select("name avatarColor kids maxRating createdAt")
      .lean();
    if (!profile) return fail("Profile not found", 404);
    return ok({ profile: dto(profile as Parameters<typeof dto>[0]) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/profiles/[id]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const { id } = idSchema.parse(await context.params);
    const body = profileUpdateSchema.parse(await readJson(request));
    await connectDB();

    const profile = await Profile.findOne({ _id: id, account: session.userId });
    if (!profile) return fail("Profile not found", 404);

    const nextKids = body.kids ?? profile.kids;
    const nextMax = body.maxRating ?? profile.maxRating;
    if (nextKids && nextMax > 13) {
      return fail("A kids profile can allow at most PG-13", 400);
    }

    if (body.name !== undefined) profile.name = body.name;
    if (body.avatarColor !== undefined) profile.avatarColor = body.avatarColor;
    if (body.kids !== undefined) profile.kids = body.kids;
    if (body.maxRating !== undefined) profile.maxRating = body.maxRating as Maturity;
    await profile.save();

    return ok({ profile: dto(profile) });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("That profile name is already in use on this account", 409);
    }
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/profiles/[id]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const { id } = idSchema.parse(await context.params);
    await connectDB();

    const [profile, count] = await Promise.all([
      Profile.findOne({ _id: id, account: session.userId }).lean(),
      Profile.countDocuments({ account: session.userId }),
    ]);
    if (!profile) return fail("Profile not found", 404);
    if (count <= 1) return fail("Keep at least one profile on your account", 409);

    await Promise.all([
      WatchlistItem.deleteMany({ profile: id }),
      Reaction.deleteMany({ profile: id }),
      Progress.deleteMany({ profile: id }),
    ]);
    await Profile.deleteOne({ _id: id });

    const user = await User.findById(session.userId).select("activeProfile").lean();
    if (user?.activeProfile?.toString() === id) {
      const next = await Profile.findOne({ account: session.userId })
        .select("_id")
        .sort({ createdAt: 1 })
        .lean();
      if (next) {
        await User.updateOne(
          { _id: session.userId },
          { $set: { activeProfile: next._id } },
        );
      }
    }
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
