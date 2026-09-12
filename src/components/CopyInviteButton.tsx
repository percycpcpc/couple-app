"use client";

import { useState } from "react";

export function CopyInviteButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <button type="button" onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); }} className="secondary-button w-full sm:w-auto">{copied ? "Copied! ✓" : "Copy code"}</button>;
}
