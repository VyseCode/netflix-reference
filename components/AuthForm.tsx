"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, LockIcon } from "@/components/Icons";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/profiles");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {mode === "register" && (
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-cream">Your name</label>
          <input
            id="name" name="name" type="text" autoComplete="name" required
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Alex Morgan"
            className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-cream placeholder:text-muted/60 focus:border-accent focus:outline-none"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-cream">Email address</label>
        <input
          id="email" name="email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-cream placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-cream">Password</label>
        <input
          id="password" name="password" type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
          className="w-full rounded-xl border border-line bg-ink px-4 py-3 text-cream placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-sm text-bad">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-accent-ink transition hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LockIcon className="h-4 w-4" />
        {pending ? "One moment…" : mode === "register" ? "Create account" : "Sign in"}
        {!pending && <ArrowRight className="h-4 w-4" />}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "register" ? (
          <>Already a member? <Link href="/login" className="font-semibold text-accent hover:underline">Sign in</Link></>
        ) : (
          <>New here? <Link href="/register" className="font-semibold text-accent hover:underline">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
