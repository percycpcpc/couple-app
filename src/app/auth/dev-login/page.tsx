import { DevLoginForm } from "./DevLoginForm";

export const dynamic = "force-dynamic";

export default function DevLoginPage() {
  const enabled = Boolean(process.env.DEV_LOGIN_SECRET);

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="card w-full max-w-md p-6 sm:p-9">
        <div className="grid size-12 place-items-center rounded-2xl bg-rose-600 text-xl text-white">QA</div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-rose-950">Dev login</h1>
        <p className="mt-2 leading-7 text-rose-950/60">Temporary QA access. Normal sign-in is unchanged.</p>
        {enabled ? <DevLoginForm /> : <div role="status" className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-900">Dev login disabled</div>}
      </section>
    </main>
  );
}
