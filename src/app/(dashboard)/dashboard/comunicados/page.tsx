import { auth } from "@/auth";
import { getComunicadosRecibidos } from "@/service/comunicado.service";
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

  // Obtener hijos, cursos del docente y comunicados en paralelo
  const [hijos, cursosDocente] = await Promise.all([
    rolPrincipal === "PADRE" && idPadre
      ? db.alumnoPadre.findMany({
          where: { idPadre: idPadre },
          include: {
            alumno: {
              include: {
                matriculas: { where: { estadoAcademico: "Activo" }, select: { idCurso: true } }
              }
            }
          }
        })
      : Promise.resolve([]),
    rolPrincipal === "DOCENTE" && session.user.idProfesor
      ? db.asignacionAcademica.findMany({
          where: {
            idProfesor: session.user.idProfesor,
            estado: true
          },
          select: { idCurso: true },
          distinct: ['idCurso']
        })
      : Promise.resolve([])
  ]);

  // Obtener comunicados con los cursos correspondientes
  let idsCursos: number[] = [];
  if (rolPrincipal === "PADRE" && hijos.length > 0) {
    idsCursos = hijos.flatMap((h: typeof hijos[number]) => h.alumno.matriculas.map((m: typeof h.alumno.matriculas[number]) => m.idCurso));
  } else if (rolPrincipal === "DOCENTE" && cursosDocente.length > 0) {
    idsCursos = cursosDocente.map((c: typeof cursosDocente[number]) => c.idCurso);
  }

  const comunicados = await getComunicadosRecibidos(idUsuario, rolPrincipal, idsCursos);
  const comunicadosFiltrados = comunicados;

  // Obtener IDs de profesores de cursos del padre (para poder filtrar después)
  let idsProfesoresHijos: number[] = [];
  
  if (rolPrincipal === "PADRE" && hijos.length > 0) {
    const idsCursosHijos = hijos.flatMap((h: typeof hijos[number]) => h.alumno.matriculas.map((m: typeof h.alumno.matriculas[number]) => m.idCurso));
    
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
    }
  }

  return (
    <ComunicadosContent 
      comunicados={comunicadosFiltrados}
      rolPrincipal={rolPrincipal}
      idsProfesoresHijos={idsProfesoresHijos}
    />
  );
}

function ComunicadosContent({ comunicados, rolPrincipal, idsProfesoresHijos }: { comunicados: ComunicadoWithIncludes[]; rolPrincipal: string; idsProfesoresHijos: number[] }) {
  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Bandeja de Entrada
          </h1>
          <p className="text-slate-500 font-medium italic">Información oficial de la institución</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full">
        <FiltroComunicados data={comunicados} isEnviados={false} rolPrincipal={rolPrincipal} idsProfesoresHijos={idsProfesoresHijos} />
      </main>
    </div>
  );
}