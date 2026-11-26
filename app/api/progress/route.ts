import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getProgressPage } from "@/lib/queries";
import { resolveActiveProfile } from "@/lib/session";
import { paginationSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
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
    return ok(await getProgressPage(profile.id, page, limit));
  } catch (error) {
    return handleError(error);
  }
}
