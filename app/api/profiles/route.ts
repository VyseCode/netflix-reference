import { fail, handleError, isDuplicateKeyError, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import type { Maturity, ProfileDTO } from "@/lib/types";
import { profileCreateSchema } from "@/lib/validation";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

function dto(profile: {
  _id: { toString(): string };
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

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    await connectDB();
    const [user, profiles] = await Promise.all([
      User.findById(session.userId).select("activeProfile").lean(),
      Profile.find({ account: session.userId })
        .select("name avatarColor kids maxRating createdAt")
        .sort({ createdAt: 1 })
        .limit(5)
        .lean(),
    ]);
    return ok({
      activeProfileId: user?.activeProfile?.toString() ?? null,
      profiles: profiles.map(dto),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const body = profileCreateSchema.parse(await readJson(request));
    await connectDB();

    const count = await Profile.countDocuments({ account: session.userId });
    if (count >= 5) return fail("An account can have at most five profiles", 409);

    const profile = await Profile.create({
      account: session.userId,
      name: body.name,
      avatarColor: body.avatarColor,
      kids: body.kids,
      maxRating: body.maxRating as Maturity,
    });
    return ok({ profile: dto(profile) }, 201);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("That profile name is already in use on this account", 409);
    }
    return handleError(error);
  }
}
