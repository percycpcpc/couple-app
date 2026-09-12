"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AnswerForm({ options }: { options: string[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const response = await fetch("/api/daily", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answer: formData.get("answer") }) });
    setPending(false);
    if (!response.ok) return setError("We couldn’t save that answer. Please try again.");
    router.refresh();
  }

  return <form action={submit} className="mt-6 space-y-3">{options.map((option) => <label key={option} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-rose-100 bg-white p-4 text-sm text-rose-950 hover:border-rose-300 hover:bg-rose-50"><input type="radio" name="answer" value={option} required className="size-4 accent-rose-600" /><span>{option}</span></label>)}{error && <p className="text-sm text-rose-700">{error}</p>}<button type="submit" disabled={pending} className="primary-button w-full">{pending ? "Sharing…" : "Share my answer"}</button></form>;
}
