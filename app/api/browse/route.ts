import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getBrowse } from "@/lib/queries";
import { resolveActiveProfile } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    return ok(await getBrowse(profile));
  } catch (error) {
    return handleError(error);
  }
}
