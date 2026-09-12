"use client";

import { createCouple, joinCouple, type ActionState } from "@/app/actions";
import Link from "next/link";
import { useActionState } from "react";

const initialState: ActionState = {};

export function CreateCoupleForm() {
  const [state, action, pending] = useActionState(createCouple, initialState);
  return <form action={action} className="mt-7 space-y-5">
    {state.error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.error}</p>}
    <div><label className="mb-2 block text-sm font-semibold text-rose-950" htmlFor="startDate">When did your story begin?</label><input id="startDate" name="startDate" type="date" max={new Date().toISOString().split("T")[0]} required defaultValue={new Date().toISOString().split("T")[0]} className="field" /><p className="mt-2 text-xs text-rose-950/45">We use this to tailor prompts to your relationship stage.</p></div>
    <button type="submit" disabled={pending} className="primary-button w-full">{pending ? "Creating your space…" : "Create our space"}</button>
  </form>;
}

export function JoinCoupleForm() {
  const [state, action, pending] = useActionState(joinCouple, initialState);
  return <form action={action} className="mt-7 space-y-5">
    {state.error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{state.error}</p>}
    <div><label className="mb-2 block text-sm font-semibold text-rose-950" htmlFor="inviteCode">Invite code</label><input id="inviteCode" name="inviteCode" type="text" autoCapitalize="none" autoCorrect="off" required placeholder="Paste your partner’s code" className="field font-mono text-sm" /><p className="mt-2 text-xs text-rose-950/45">Ask your partner to copy this from their dashboard.</p></div>
    <button type="submit" disabled={pending} className="primary-button w-full">{pending ? "Joining your partner…" : "Join our space"}</button>
    <p className="text-center text-sm text-rose-950/55">Starting fresh? <Link href="/setup" className="font-semibold text-rose-700 hover:underline">Create a space</Link></p>
  </form>;
}
