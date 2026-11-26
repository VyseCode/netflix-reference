import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { isAllowed } from "@/lib/maturity";
import type { ProfileDTO } from "@/lib/types";
import { Profile } from "@/models/Profile";
import { User } from "@/models/User";

interface LeanProfile {
  _id: Types.ObjectId;
  name: string;
  avatarColor: string;
  kids: boolean;
  maxRating: 0 | 7 | 13 | 16 | 18;
  createdAt: Date;
}

export interface AccountContext {
  userId: string;
  userName: string;
  email: string;
  activeProfileId: string | null;
  profiles: ProfileDTO[];
}

export interface ProfileContext extends AccountContext {
  profile: ProfileDTO;
}

export function toProfileDTO(profile: LeanProfile): ProfileDTO {
  return {
    id: profile._id.toString(),
    name: profile.name,
    avatarColor: profile.avatarColor,
    kids: profile.kids,
    maxRating: profile.maxRating,
    createdAt: profile.createdAt.toISOString(),
  };
}

export async function requireAccount(): Promise<AccountContext> {
  const session = await getSession();
  if (!session) redirect("/login");
  await connectDB();
  const user = await User.findById(session.userId)
    .select("name email activeProfile")
    .lean();
  if (!user) redirect("/login");
  const profiles = (await Profile.find({ account: user._id })
    .select("name avatarColor kids maxRating createdAt")
    .sort({ createdAt: 1 })
    .limit(5)
    .lean()) as unknown as LeanProfile[];

  return {
    userId: user._id.toString(),
    userName: user.name,
    email: user.email,
    activeProfileId: user.activeProfile?.toString() ?? null,
    profiles: profiles.map(toProfileDTO),
  };
}

export async function requireProfile(): Promise<ProfileContext> {
  const account = await requireAccount();
  if (account.profiles.length === 0) redirect("/profiles/manage");
  const profile = account.profiles.find((item) => item.id === account.activeProfileId);
  if (!profile) redirect("/profiles");
  return { ...account, profile };
}

export function canWatch(profile: ProfileDTO, maturity: number): boolean {
  return isAllowed(profile.maxRating, maturity);
}
