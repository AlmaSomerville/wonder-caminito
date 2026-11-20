import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav } from "../ui";
import { ProductEditor } from "./editor";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  requireAdmin();
  const products = await prisma.product.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight">Productos adicionales</h1>
        <p className="text-[15px] text-rock/80">
          Camisetas y otros extras. Están <b>ocultos</b> hasta que los actives. Cuando un producto está visible aparece en la web
          y como extra opcional al reservar; el cliente lo paga junto con el tour y tú lo ves en la reserva (con la talla).
        </p>
        <ProductEditor products={JSON.parse(JSON.stringify(products))} />
      </main>
    </>
  );
}
