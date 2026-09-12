import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { weeklyData } from "@/lib/core-loop";
import { EntryForm } from "./EntryForm";

export default async function WeeklyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  const data = await weeklyData(session.user.id);
  if (data.needsSetup) redirect("/setup");
  return <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-2xl"><Link href="/dashboard" className="text-sm font-semibold text-rose-700 hover:text-rose-950">← Dashboard</Link><section className="card mt-7 p-6 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-rose-500">Weekly reflection · +25 hearts</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-rose-950">This week’s journal</h1>{!data.theme ? <p className="mt-6 rounded-2xl bg-rose-50 p-5 text-rose-800">This week’s theme isn’t ready yet.</p> : <><h2 className="mt-7 text-xl font-bold text-rose-950">{data.theme.title}</h2><p className="mt-2 leading-7 text-rose-950/60">{data.theme.prompt}</p>{!data.answered ? <EntryForm /> : <div className="mt-7 space-y-5">{data.revealed && <h2 className="text-xl font-bold text-rose-950">Both of you wrote</h2>}<Entry label="You wrote" content={data.content ?? ""} />{data.revealed ? <><Entry label="Your partner wrote" content={data.partnerContent ?? ""} /><p className="rounded-2xl bg-rose-100 p-4 text-center font-semibold text-rose-800">25 hearts added to your shared space! ♥</p></> : <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">Waiting for your partner. Both entries will be revealed together.</p>}</div>}</>}</section></div></main>;
}

function Entry({ label, content }: { label: string; content: string }) { return <article className="rounded-2xl border border-rose-100 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-rose-500">{label}</p><p className="mt-3 whitespace-pre-wrap leading-7 text-rose-950">{content}</p></article>; }
