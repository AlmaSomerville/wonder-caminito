import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { requireAdmin } from "../lib";
import { AdminNav, ActionButton } from "../ui";
import { AddDatesForm } from "./form";

export const dynamic = "force-dynamic";

export default async function AdminAvailability() {
  requireAdmin();
  const settings = await getSettings();
  const today = new Date().toISOString().slice(0, 10);
  const slots = await prisma.slot.findMany({
    where: { date: { gte: today } },
    orderBy: [{ date: "asc" }, { time: "asc" }],
    include: { bookings: { where: { status: { not: "CANCELLED" } } } },
  });

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="font-serif text-[26px] font-bold">Availability</h1>
        <p className="text-[13px] opacity-60">Open the dates you can get tickets for. Guests only see open dates with space, inside the booking window.</p>

        <AddDatesForm defaultTime={settings.defaultTime} defaultCapacity={settings.defaultCapacity} />

        <div className="mt-6 space-y-2">
          {slots.map((s) => {
            const pax = s.bookings.reduce((n, b) => n + b.adults + b.children, 0);
            return (
              <div key={s.id} className={`card flex flex-wrap items-center justify-between gap-2 p-4 ${s.closed ? "opacity-50" : ""}`}>
                <div>
                  <p className="font-bold">
                    {s.date} · {s.time}
                    {s.note && <span className="ml-2 rounded-full bg-peach px-2 py-0.5 text-[11px] text-terracotta">{s.note}</span>}
                    {s.closed && <span className="ml-2 text-[11px] font-bold text-terracotta">CLOSED</span>}
                  </p>
                  <p className="text-[13px] opacity-70">{pax}/{s.capacity} booked</p>
                </div>
                <div className="flex gap-2">
                  <ActionButton url="/api/admin/slots" body={{ id: s.id, closed: !s.closed }}>
                    {s.closed ? "Reopen" : "Close"}
                  </ActionButton>
                  {pax === 0 && (
                    <ActionButton url="/api/admin/slots" method="DELETE" body={{ id: s.id }} confirmText="Delete this date?">
                      Delete
                    </ActionButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
