import { prisma } from "@/lib/db";
import { requireAdmin } from "../lib";
import { AdminNav } from "../ui";
import { TeamEditor } from "./editor";

export const dynamic = "force-dynamic";

export default async function AdminTeam() {
  requireAdmin();
  const guides = await prisma.guide.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-5 py-8">
        <h1 className="text-[26px] font-extrabold tracking-tight">Equipo</h1>
        <p className="text-[15px] text-rock/80">
          Los guías que aparecen en «Conoce al equipo» de la web. Añade a cada guía con quien trabajes: su foto, los idiomas que habla
          (salen como banderas) y una frase sobre él o ella. Ocúltalo cuando deje de trabajar contigo.
        </p>
        <TeamEditor guides={JSON.parse(JSON.stringify(guides))} />
      </main>
    </>
  );
}
