import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { buyAndPlaceItem, removePlacedItem } from "@/app/actions";
import { SignOutButton } from "@/components/SignOutButton";
import { PixelRoomBackground } from "./RoomSvg";

const slotPositions = [
  "left-[24%] top-[65%]",
  "left-[74%] top-[70%]",
  "left-[22%] top-[30%]",
  "left-[78%] top-[30%]",
  "left-[50%] top-[55%]",
];

export default async function RoomPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.coupleId) redirect("/setup");
  const [couple, items] = await Promise.all([
    prisma.couple.findUnique({
      where: { id: user.coupleId },
      include: {
        room: {
          include: {
            slots: {
              include: { placedItem: { include: { item: true } } },
            },
          },
        },
      },
    }),
    prisma.item.findMany({ orderBy: [{ price: "asc" }, { name: "asc" }] }),
  ]);
  if (!couple?.room) redirect("/setup");
  const room = couple.room;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-rose-700 hover:text-rose-950">← Dashboard</Link>
          <SignOutButton />
        </header>

        <section className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[.16em] text-rose-500">Our little corner</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-rose-950">{room.name} 🏡</h1><p className="mt-2 text-rose-950/55">Choose the details that make this place feel like yours.</p></div>
          <div className="card flex items-center gap-3 px-5 py-3"><span className="text-2xl text-rose-600">♥</span><div><p className="text-xl font-bold text-rose-950">{couple.currency}</p><p className="text-xs text-rose-950/45">hearts to spend</p></div></div>
        </section>

        <section className="card mt-7 overflow-hidden p-3 sm:p-6">
          <div className="mb-4 flex items-center justify-between px-1"><h2 className="font-bold text-rose-950">Your room</h2><p className="text-xs text-rose-950/45">Tap remove to clear a spot</p></div>
          <div className="relative mx-auto aspect-[800/743] w-full max-w-[760px] overflow-hidden rounded-[1.25rem] border-4 border-[#523638] bg-[#fbf4dd] shadow-[inset_0_0_0_3px_#d99a68,8px_10px_0_rgba(82,54,56,.14)]">
            <PixelRoomBackground />
            {room.slots.map((slot, index) => (
              <article key={slot.id} className={`absolute z-10 flex h-28 w-[17%] min-w-16 -translate-x-1/2 flex-col items-center justify-end text-center sm:h-40 ${slotPositions[index] ?? slotPositions[0]}`}>
                {slot.placedItem ? (
                  <>
                    <div className="grid size-16 place-items-center drop-shadow-[3px_4px_0_rgba(55,39,39,.3)] sm:size-24 [&_svg]:size-full [&_svg]:[image-rendering:pixelated]" dangerouslySetInnerHTML={{ __html: slot.placedItem.item.svg }} />
                    <div className="mt-1 rounded-lg border-2 border-[#765044] bg-[#fff4dc]/95 px-2 py-1 shadow-[2px_2px_0_#765044]">
                      <p className="hidden text-[10px] font-bold text-[#5c3e39] sm:block">{slot.placedItem.item.name}</p>
                      <form action={removePlacedItem}><input type="hidden" name="slotId" value={slot.id} /><button type="submit" className="text-[10px] font-bold text-rose-700 hover:text-rose-950">Remove</button></form>
                    </div>
                  </>
                ) : (
                  <div className="grid size-16 place-items-center rounded-lg border-2 border-dashed border-[#8f6655] bg-[#fff4dc]/55 text-[#765044] shadow-[2px_2px_0_rgba(118,80,68,.35)] sm:size-20"><div><span className="text-xl font-bold">＋</span><p className="hidden text-[9px] font-bold uppercase tracking-wide sm:block">{slot.name}</p></div></div>
                )}
              </article>
            ))}
            <div className="absolute bottom-3 left-3 rounded-md bg-[#5c3e39]/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-[#fff4dc]">Our cozy room</div>
          </div>
        </section>

        <section className="mt-10">
          <div><p className="text-sm font-bold uppercase tracking-[.16em] text-rose-500">The heart shop</p><h2 className="mt-2 text-2xl font-bold text-rose-950">Find something cozy</h2><p className="mt-1 text-sm text-rose-950/55">Buying an item places it directly into your chosen spot.</p></div>
          {items.length ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const affordable = couple.currency >= item.price;
                return (
                  <article key={item.id} className="card flex flex-col p-5">
                    <div className="relative grid h-40 place-items-center overflow-hidden rounded-2xl border-2 border-[#604044] bg-[#f8edcf] p-4 shadow-inner before:absolute before:inset-x-0 before:bottom-0 before:h-12 before:bg-[#bd7545] before:[clip-path:polygon(0_35%,50%_0,100%_35%,100%_100%,0_100%)] before:content-['']">
                      <div className="relative z-10 size-28 drop-shadow-[3px_4px_0_rgba(55,39,39,.28)] [&_svg]:size-full [&_svg]:[image-rendering:pixelated]" dangerouslySetInnerHTML={{ __html: item.svg }} />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="font-bold text-rose-950">{item.name}</h3><p className="mt-1 text-xs leading-5 text-rose-950/50">{item.description}</p></div><span className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-sm font-bold text-rose-700">♥ {item.price}</span></div>
                    <form action={buyAndPlaceItem} className="mt-auto pt-5"><input type="hidden" name="itemId" value={item.id} /><label htmlFor={`slot-${item.id}`} className="sr-only">Place {item.name} in</label><select id={`slot-${item.id}`} name="slotId" required className="field py-2.5 text-sm"><option value="">Choose a spot…</option>{room.slots.map((slot) => <option key={slot.id} value={slot.id}>{slot.name}{slot.placedItem ? ` · replace ${slot.placedItem.item.name}` : ""}</option>)}</select><button type="submit" disabled={!affordable} className="primary-button mt-3 w-full">{affordable ? "Buy & place" : `Need ${item.price - couple.currency} more hearts`}</button></form>
                  </article>
                );
              })}
            </div>
          ) : <p className="card mt-5 p-6 text-rose-950/60">The shop is being stocked. Check back soon.</p>}
        </section>
      </div>
    </main>
  );
}
