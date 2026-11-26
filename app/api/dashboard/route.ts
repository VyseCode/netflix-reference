import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { getDashboard } from "@/lib/reports";
import { resolveActiveProfile } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("You must be signed in", 401);
    const profile = await resolveActiveProfile(session.userId);
    if (!profile) return fail("Choose a profile first", 409);
    const data = await getDashboard(profile.id);
    if (!data) return fail("Profile not found", 404);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
