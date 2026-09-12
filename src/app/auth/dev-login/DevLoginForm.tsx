"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function DevLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("percycpcpc@gmail.com");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), secret }),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Dev login failed");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Dev login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-rose-950" htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="field" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-rose-950" htmlFor="secret">Secret pin</label>
        <input id="secret" name="secret" type="password" autoComplete="off" required value={secret} onChange={(event) => setSecret(event.target.value)} className="field" />
      </div>
      {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      <button type="submit" disabled={loading} className="primary-button w-full">{loading ? "Signing in…" : "Dev login"}</button>
    </form>
  );
}
