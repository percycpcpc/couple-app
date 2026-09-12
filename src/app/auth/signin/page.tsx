"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";

const authErrors: Record<string, string> = {
  Configuration: "Sign-in isn’t configured yet. Please try again later.",
  Verification: "That magic link has expired or was already used. Request a new one below.",
  AccessDenied: "We couldn’t sign you in with that email.",
};

function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ? authErrors[searchParams.get("error")!] ?? "Something went wrong. Please request a new link." : "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn("email", { email: normalizedEmail, callbackUrl: "/dashboard", redirect: false });
      if (result?.error) setError(authErrors[result.error] ?? "We couldn’t send your link. Please check the address and try again.");
      else setSentTo(normalizedEmail);
    } catch {
      setError("We couldn’t reach the sign-in service. Please try again in a moment.");
    } finally { setLoading(false); }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-900">← Back home</Link>
        <section className="card p-6 sm:p-9">
          <div className="grid size-12 place-items-center rounded-2xl bg-rose-600 text-xl text-white">♥</div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-rose-950">Welcome to your space</h1>
          <p className="mt-2 leading-7 text-rose-950/60">Enter your email and we’ll send you a secure, one-time link. No password to remember.</p>

          {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800">{error}</div>}

          {sentTo ? (
            <div className="mt-7">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
                <p className="font-bold">Check your inbox ✉️</p>
                <p className="mt-1 text-sm leading-6">We sent a sign-in link to <strong>{sentTo}</strong>. It may take a minute to arrive.</p>
              </div>
              <button type="button" onClick={() => setSentTo("")} className="secondary-button mt-4 w-full">Use a different email</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div><label className="mb-2 block text-sm font-semibold text-rose-950" htmlFor="email">Email address</label><input id="email" name="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field" /></div>
              <button type="submit" disabled={loading} className="primary-button w-full">{loading ? "Sending your link…" : "Email me a magic link"}</button>
            </form>
          )}
          <p className="mt-6 text-center text-xs leading-5 text-rose-950/45">By continuing, you’re creating a private space for you and your partner.</p>
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() { return <Suspense><SignInForm /></Suspense>; }
