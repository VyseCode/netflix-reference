import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { rankRecommendations } from "@/lib/recommend";
import { resolveActiveProfile } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);

    const raw = Number(new URL(request.url).searchParams.get("limit") ?? 20);
    const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 100) : 20;
    const items = await rankRecommendations(profile.id, profile.maxRating, limit);
    return ok({ items });
  } catch (error) {
    return handleError(error);
  }
}
