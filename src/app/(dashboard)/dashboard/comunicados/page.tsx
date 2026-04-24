import { auth } from "@/auth";
import { getComunicadosRecibidos } from "@/service/comunicado.service";
import { Plus } from "lucide-react";
import Link from "next/link";
import db from "@/lib/db";
import FiltroComunicados from "@/components/modules/comunicados/FiltroComunicados";
import { redirect } from "next/navigation";
import { Comunicado, Usuario, ComunicadoVisto } from "@prisma/client";

type ComunicadoWithIncludes = Comunicado & {
  usuario: Usuario & {
    persona: {
      nombre: string;
      apellido: string;
    };
    roles: Array<{
      idUsuario: number;
      idRol: number;
      rol: {
        nombre: string;
      };
    }>;
  };
  vistos: ComunicadoVisto[];
};

export default async function ComunicadosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const idUsuario = session.user.idUsuario;
  const idPadre = session.user.idPadre;
  const roles = session.user.roles || [];
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

  // Filtrar comunicados para que SOLO sean de ADMINS en bandeja de entrada
  const comunicadosFiltrados = comunicados.filter((c: ComunicadoWithIncludes) => {
    return c.usuario?.roles?.some((ur) => ur.rol?.nombre === "ADMIN") ?? false;
  });

  // Obtener IDs de cursos y profesores después si es necesario
  let idsCursosHijos: number[] = [];
  let idsProfesoresHijos: number[] = [];
  
  if (rolPrincipal === "PADRE" && hijos.length > 0) {
    idsCursosHijos = hijos.flatMap((h: typeof hijos[number]) => h.alumno.matriculas.map((m: typeof h.alumno.matriculas[number]) => m.idCurso));
    
    // Obtener IDs de usuarios de profesores que enseñan en los cursos de los hijos
    if (idsCursosHijos.length > 0) {
      const profesoresEnCursos = await db.asignacionAcademica.findMany({
        where: {
          idCurso: { in: idsCursosHijos },
          estado: true,
          idProfesor: { not: null }
        },
        distinct: ['idProfesor'],
        select: {
          profesor: {
            select: {
              persona: {
                select: {
                  idPersona: true
                }
              }
            }
          }
        }
      });

      // Obtener IDs de usuarios de esos profesores
      if (profesoresEnCursos.length > 0) {
        const idspersonasProfs = profesoresEnCursos
          .map((p: typeof profesoresEnCursos[number]) => p.profesor?.persona?.idPersona)
          .filter((id: number | undefined): id is number => id !== undefined);

        if (idspersonasProfs.length > 0) {
          const usuariosProfs = await db.usuario.findMany({
            where: { idPersona: { in: idspersonasProfs } },
            select: { idUsuario: true }
          });
          idsProfesoresHijos = usuariosProfs.map((u: typeof usuariosProfs[number]) => u.idUsuario);
        }
      }
      
      const comunicadosActualizados = await getComunicadosRecibidos(idUsuario, rolPrincipal, idsCursosHijos);
      const comunicadosFiltradosActualizados = comunicadosActualizados.filter((c: ComunicadoWithIncludes) => {
        return c.usuario?.roles?.some((ur) => ur.rol?.nombre === "ADMIN") ?? false;
      });
      return (
        <ComunicadosContent 
          comunicados={comunicadosFiltradosActualizados}
          puedeCrear={puedeCrear}
          rolPrincipal={rolPrincipal}
          idsProfesoresHijos={idsProfesoresHijos}
        />
      );
    }
  }

  return (
    <ComunicadosContent 
      comunicados={comunicadosFiltrados}
      puedeCrear={puedeCrear}
      rolPrincipal={rolPrincipal}
      idsProfesoresHijos={idsProfesoresHijos}
    />
  );
}

function ComunicadosContent({ comunicados, puedeCrear, rolPrincipal, idsProfesoresHijos }: { comunicados: ComunicadoWithIncludes[]; puedeCrear: boolean; rolPrincipal: string; idsProfesoresHijos: number[] }) {
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
        <FiltroComunicados data={comunicados} isEnviados={false} rolPrincipal={rolPrincipal} idsProfesoresHijos={idsProfesoresHijos} />
      </main>
    </div>
  );
}