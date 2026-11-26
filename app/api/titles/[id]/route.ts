import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getTitleDetail } from "@/lib/queries";
import { resolveActiveProfile } from "@/lib/session";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/titles/[id]">,
) {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);

    const { id } = await context.params;
    const result = await getTitleDetail(id, profile);
    if (result.state === "not-found") return fail("Title not found", 404);
    if (result.state === "forbidden") {
      return fail("This title is above your profile's rating limit", 403);
    }
    return ok({ title: result.data });
  } catch (error) {
    return handleError(error);
  }
}
