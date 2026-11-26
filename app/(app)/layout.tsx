import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { requireAccount } from "@/lib/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const account = await requireAccount();
  const profile = account.profiles.find((item) => item.id === account.activeProfileId) ?? null;

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} userName={account.userName} />
      <main className="mx-auto max-w-[1500px] px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}
