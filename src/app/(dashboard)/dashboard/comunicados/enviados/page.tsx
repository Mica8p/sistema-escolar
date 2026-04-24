import { auth } from "@/auth";
import { getComunicadosEnviados } from "@/service/comunicado.service";
import FiltroComunicados from "@/components/modules/comunicados/FiltroComunicados";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";

interface CursoAsignado {
  idCurso: number;
  grado: string;
  seccion: string;
  turno: string;
  nivel: string;
}

export default async function EnviadosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const idUsuario = session.user.idUsuario;
  const roles = session.user.roles || [];
  const rolPrincipal = roles[0] || "USUARIO";
  const enviados = await getComunicadosEnviados(idUsuario);

  // Si es docente, obtener los cursos asignados con sus datos
  let cursosAsignados: CursoAsignado[] = [];
  if (rolPrincipal === "DOCENTE") {
    const persona = await db.persona.findFirst({
      where: {
        usuario: {
          idUsuario
        }
      },
      include: {
        profesor: true
      }
    });

    if (persona?.profesor) {
      const asignaciones = await db.asignacionAcademica.findMany({
        where: {
          idProfesor: persona.profesor.idProfesor,
          estado: true
        },
        select: { 
          idCurso: true,
          curso: {
            select: {
              grado: true,
              seccion: true,
              turno: true,
              nivel: true
            }
          }
        },
        distinct: ['idCurso']
      });
      cursosAsignados = asignaciones.map(a => ({
        idCurso: a.idCurso,
        grado: a.curso.grado,
        seccion: a.curso.seccion,
        turno: a.curso.turno,
        nivel: a.curso.nivel
      }));
    }
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
            Comunicados Enviados
          </h1>
          <p className="text-slate-500 font-medium italic">Historial de notificaciones emitidas por tu cuenta</p>
        </div>

        <Link href="/dashboard/comunicados/nuevo">
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center gap-2">
            <Plus size={16} strokeWidth={3} /> Redactar
          </button>
        </Link>
      </header>

      <main>
        <FiltroComunicados data={enviados} isEnviados={true} rolPrincipal={rolPrincipal} cursosAsignados={cursosAsignados} />
      </main>
    </div>
  );
}