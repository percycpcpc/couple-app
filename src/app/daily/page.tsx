import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dailyData } from "@/lib/core-loop";
import { AnswerForm } from "./AnswerForm";

export default async function DailyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  const data = await dailyData(session.user.id);
  if (data.needsSetup) redirect("/setup");
  return <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10"><div className="mx-auto max-w-2xl"><Link href="/dashboard" className="text-sm font-semibold text-rose-700 hover:text-rose-950">← Dashboard</Link><section className="card mt-7 p-6 sm:p-9"><p className="text-xs font-bold uppercase tracking-[.18em] text-rose-500">Daily connection · +10 hearts</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-rose-950">Today’s question</h1>{!data.question ? <p className="mt-6 rounded-2xl bg-rose-50 p-5 text-rose-800">Today’s question isn’t ready yet.</p> : <><p className="mt-6 text-xl font-semibold leading-8 text-rose-950">{data.question.text}</p>{!data.answered ? <AnswerForm options={data.question.options} /> : <div className="mt-6 space-y-4"><Answer label="Your pick" value={data.answer ?? ""} />{data.revealed ? <><Answer label="Your partner’s pick" value={data.partnerAnswer ?? ""} /><p className="rounded-2xl bg-rose-100 p-4 text-center font-semibold text-rose-800">Both answered — 10 hearts for your shared space! ♥</p></> : <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">Waiting for your partner. Their answer stays private until you both finish.</p>}</div>}</>}</section></div></main>;
}

function Answer({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-rose-100 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-rose-500">{label}</p><p className="mt-2 font-semibold text-rose-950">{value}</p></div>; }
