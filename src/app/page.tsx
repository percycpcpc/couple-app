import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const features = [
  ["💬", "A question a day", "Small prompts that make space for real conversation."],
  ["📖", "A private weekly ritual", "Reflect separately, then reveal your thoughts together."],
  ["🏡", "A room that grows with you", "Earn hearts and make a tiny shared space feel like yours."],
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-rose-950">
          <span className="grid size-9 place-items-center rounded-xl bg-rose-600 text-lg text-white">♥</span>
          Us Two
        </Link>
        <Link href="/auth/signin" className="text-sm font-semibold text-rose-700 hover:text-rose-900">Sign in</Link>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.08fr_.92fr] lg:py-32">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex rounded-full border border-rose-200 bg-white/70 px-4 py-2 text-sm font-semibold text-rose-700">Made for the two of you</p>
          <h1 className="text-5xl font-bold leading-[1.03] tracking-[-0.045em] text-rose-950 sm:text-7xl">
            A little closer,<br /><span className="text-rose-600">every day.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-rose-950/65 sm:text-xl">
            Us Two turns a few thoughtful minutes into a relationship ritual you’ll both look forward to.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/signin" className="primary-button px-6 py-4 text-base">Start with a magic link <span className="ml-2">→</span></Link>
            <a href="#how-it-works" className="secondary-button px-6 py-4 text-base">See how it works</a>
          </div>
          <p className="mt-4 text-sm text-rose-950/45">No passwords. No pressure. Just your private space.</p>
        </div>

        <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
          <div className="absolute -inset-8 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="card relative rotate-2 p-5 sm:p-7">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold text-rose-500">TODAY’S QUESTION</span><span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">🔥 12 days</span></div>
            <p className="mt-7 text-2xl font-bold leading-snug text-rose-950">What small thing did I do lately that made you feel loved?</p>
            <div className="mt-7 space-y-3">
              {["A thoughtful message", "Making time for us", "Remembering the little things"].map((option, i) => <div key={option} className={`rounded-2xl border p-4 text-sm font-medium ${i === 1 ? "border-rose-400 bg-rose-50 text-rose-800" : "border-rose-100 text-rose-950/55"}`}>{i === 1 ? "●" : "○"} <span className="ml-2">{option}</span></div>)}
            </div>
          </div>
          <div className="card absolute -bottom-8 -left-3 -rotate-3 px-5 py-4 sm:-left-10"><p className="text-xs font-semibold text-rose-500">OUR HEARTS</p><p className="mt-1 text-xl font-bold text-rose-950">♥ 245</p></div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl pb-20 pt-6">
        <div className="grid gap-4 md:grid-cols-3">{features.map(([icon, title, text]) => <article key={title} className="card p-6 sm:p-7"><span className="text-2xl">{icon}</span><h2 className="mt-4 text-lg font-bold text-rose-950">{title}</h2><p className="mt-2 leading-7 text-rose-950/60">{text}</p></article>)}</div>
      </section>
    </main>
  );
}
