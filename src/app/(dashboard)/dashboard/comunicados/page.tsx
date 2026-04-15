import { auth } from "@/auth";
import { getComunicadosRecibidos } from "@/service/comunicado.service";
import { Plus } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";
import FiltroComunicados from "@/components/modules/comunicados/FiltroComunicados";
import { redirect } from "next/navigation";

export default async function ComunicadosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const idUsuario = user.idUsuario as number;
  const idPadre = user.idPadre as number | null;
  const roles = user.roles || [];
  const rolPrincipal = roles[0] || "USUARIO";
  const puedeCrear = roles.includes("ADMIN") || roles.includes("DOCENTE");

  // Obtener hijos y comunicados en paralelo
  const [hijos, comunicados] = await Promise.all([
    rolPrincipal === "PADRE" && idPadre
      ? db.alumnoPadre.findMany({
          where: { idPadre: idPadre },
          include: {
            alumno: {
              include: {
                matriculas: { where: { estadoAcademico: "Activo" } }
              }
            }
          }
        })
      : Promise.resolve([]),
    getComunicadosRecibidos(idUsuario, rolPrincipal, []) // Inicializar con array vacío
  ]);

  // Obtener IDs de cursos después si es necesario
  let idsCursosHijos: number[] = [];
  if (rolPrincipal === "PADRE" && hijos.length > 0) {
    idsCursosHijos = hijos.flatMap(h => h.alumno.matriculas.map(m => m.idCurso));
    // Si hay cursos, obtener comunicados nuevamente con los IDs correctos
    if (idsCursosHijos.length > 0) {
      const comunicadosActualizados = await getComunicadosRecibidos(idUsuario, rolPrincipal, idsCursosHijos);
      return (
        <ComunicadosContent 
          comunicados={comunicadosActualizados}
          puedeCrear={puedeCrear}
        />
      );
    }
  }

  return (
    <ComunicadosContent 
      comunicados={comunicados}
      puedeCrear={puedeCrear}
    />
  );
}

function ComunicadosContent({ comunicados, puedeCrear }: { comunicados: any; puedeCrear: boolean }) {
  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Bandeja de Entrada
          </h1>
          <p className="text-slate-500 font-medium italic">Información oficial de la institución</p>
        </div>

        {puedeCrear && (
          <Link href="/dashboard/comunicados/nuevo">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center gap-2">
              <Plus size={16} strokeWidth={3} /> Redactar
            </button>
          </Link>
        )}
      </header>

      <main className="max-w-6xl mx-auto w-full">
        <FiltroComunicados data={comunicados} isEnviados={false} />
      </main>
    </div>
  );
}