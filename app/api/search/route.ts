import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { listTitles } from "@/lib/queries";
import { resolveActiveProfile } from "@/lib/session";
import { searchSchema } from "@/lib/validation";

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
    const query = searchSchema.parse({
      q: params.get("q") ?? "",
      type: params.get("type") ?? "all",
      genre: params.get("genre") ?? "",
      yearFrom: number("yearFrom"),
      yearTo: number("yearTo"),
      sort: params.get("sort") ?? "relevance",
      page: number("page") ?? 1,
      limit: number("limit") ?? 20,
    });
    return ok(await listTitles(profile, query));
  } catch (error) {
    return handleError(error);
  }
}
