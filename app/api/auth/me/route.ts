import { fail, handleError, ok } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return fail("Not signed in", 401);
    await connectDB();
    const user = await User.findById(session.userId)
      .select("name email activeProfile")
      .lean();
    if (!user) return fail("Not signed in", 401);
    return ok({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        activeProfile: user.activeProfile?.toString() ?? null,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
