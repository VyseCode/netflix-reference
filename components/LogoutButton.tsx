"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutIcon } from "@/components/Icons";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button" onClick={logout} disabled={pending}
      aria-label="Sign out"
      className={
        compact
          ? "rounded-lg p-2 text-muted transition hover:bg-raised hover:text-cream"
          : "flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-raised hover:text-cream"
      }
    >
      <LogoutIcon className="h-5 w-5" />
      {!compact && (pending ? "Signing out…" : "Sign out")}
    </button>
  );
}
