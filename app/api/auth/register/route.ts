import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { fail, handleError, isDuplicateKeyError, ok, readJson } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export async function POST(request: Request) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000, prefix: "register" });
  if (limited) return limited;
  try {
    const body = schema.parse(await readJson(request));
    await connectDB();

    const user = await User.create({
      name: body.name,
      email: body.email,
      password: await bcrypt.hash(body.password, 12),
    });
    const profile = await Profile.create({
      account: user._id,
      name: body.name.split(" ")[0].slice(0, 24),
      avatarColor: "#e8a33d",
      kids: false,
      maxRating: 18,
    });
    await User.updateOne({ _id: user._id }, { $set: { activeProfile: profile._id } });

    const token = await signSession({ userId: user._id.toString(), email: user.email });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());

    return ok(
      {
        user: { id: user._id.toString(), name: user.name, email: user.email },
        profile: { id: profile._id.toString(), name: profile.name },
      },
      201,
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("An account with that email already exists", 409);
    }
    return handleError(error);
  }
}
