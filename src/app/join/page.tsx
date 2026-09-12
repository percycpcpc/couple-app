import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { JoinCoupleForm } from "@/components/CoupleForms";

export default async function JoinPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/auth/signin");
  if (user.coupleId) redirect("/dashboard");
  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="card w-full max-w-md p-6 sm:p-9"><span className="text-3xl">💌</span><p className="mt-5 text-sm font-bold uppercase tracking-[.18em] text-rose-500">Your invitation</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-rose-950">Join your partner</h1><p className="mt-3 leading-7 text-rose-950/60">One code connects you both to the same private space.</p><JoinCoupleForm /></section></main>;
}
