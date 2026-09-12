"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EntryForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const response = await fetch("/api/weekly", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: formData.get("content") }) });
    setPending(false);
    if (!response.ok) return setError("We couldn’t save your entry. Please try again.");
    router.refresh();
  }
  return <form action={submit} className="mt-6 space-y-3"><textarea name="content" required minLength={3} rows={7} placeholder="Write honestly—your entry stays private until you both finish…" className="field resize-y" />{error && <p className="text-sm text-rose-700">{error}</p>}<button type="submit" disabled={pending} className="primary-button w-full">{pending ? "Saving…" : "Save my reflection"}</button></form>;
}
