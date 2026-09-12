"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-xl border border-rose-200 bg-white/70 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
    >
      Sign out
    </button>
  );
}
