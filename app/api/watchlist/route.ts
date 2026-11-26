import { Types } from "mongoose";
import { z } from "zod";
import { fail, handleError, isDuplicateKeyError, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getWatchlistPage, titleToDTO } from "@/lib/queries";
import { resolveActiveProfile } from "@/lib/session";
import { paginationSchema } from "@/lib/validation";
import type { Maturity } from "@/models/Title";
import { Title } from "@/models/Title";
import { WatchlistItem } from "@/models/WatchlistItem";

const addSchema = z.object({
  titleId: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid title id"),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    await connectDB();
    const params = new URL(request.url).searchParams;
    const number = (key: string) => {
      const value = params.get(key);
      if (value === null || value === "") return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };
    const { page, limit } = paginationSchema.parse({
      page: number("page"),
      limit: number("limit"),
    });
    return ok(await getWatchlistPage(profile, page, limit));
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const { titleId } = addSchema.parse(await readJson(request));
    await connectDB();

    const title = await Title.findById(titleId).lean();
    if (!title) return fail("Title not found", 404);
    if (title.maturity > (profile.maxRating as Maturity)) {
      return fail("This title is above your profile's rating limit", 403);
    }
    if (await WatchlistItem.exists({ profile: profile.id, title: titleId })) {
      return fail("This title is already in your list", 409);
    }
    const count = await WatchlistItem.countDocuments({ profile: profile.id });
    if (count >= 100) return fail("Your list is full (100 titles)", 409);

    const item = await WatchlistItem.create({ profile: profile.id, title: titleId });
    return ok(
      {
        item: {
          id: titleId,
          titleId,
          addedAt: item.addedAt.toISOString(),
          unavailable: false,
          title: titleToDTO(title as unknown as Parameters<typeof titleToDTO>[0]),
        },
      },
      201,
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) return fail("This title is already in your list", 409);
    return handleError(error);
  }
}
