import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getPartnerSession } from "@/lib/session";
import { PartnerView } from "./ui";

export const dynamic = "force-dynamic";

export default async function PartnerDashboard() {
  const session = getPartnerSession();
  if (!session) redirect("/partner/login");
  const aff = await prisma.affiliate.findUnique({ where: { id: session.id } });
  if (!aff || !aff.approved) redirect("/partner/login");

  const bookings = await prisma.booking.findMany({
    where: { affiliateId: aff.id },
    include: { slot: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://wondercaminito.com";
  return (
    <PartnerView
      company={aff.companyName}
      code={aff.code}
      link={`${site}/a/${aff.code}`}
      bookings={bookings.map((b) => ({
        id: b.id,
        ref: b.ref,
        name: b.name,
        date: b.slot.date,
        time: b.slot.time,
        pax: b.adults + b.children,
        total: b.totalEUR,
        status: b.status,
        month: b.createdAt.toISOString().slice(0, 7),
      }))}
    />
  );
}
