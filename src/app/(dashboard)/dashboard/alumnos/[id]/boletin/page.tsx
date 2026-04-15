import { getBoletinCompleto } from "@/service/calificaciones.service";
import BoletinView from "@/components/modules/alumnos/BoletinView";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";

export default async function BoletinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const idMatricula = Number(id);

  if (!session?.user) redirect("/login");

  const userRoles = session.user.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isDocente = userRoles.includes("DOCENTE");
  const idPersona = session.user.idPersona;

  // Ejecutar validación y obtención de boletín en paralelo
  const [relacion, matricula] = await Promise.all([
    !isAdmin && !isDocente
      ? db.alumnoPadre.findFirst({
          where: {
            padre: { idPersona: idPersona },
            alumno: {
              matriculas: {
                some: { idMatricula: idMatricula }
              }
            }
          }
        })
      : Promise.resolve(null),
    getBoletinCompleto(idMatricula)
  ]);

  if (!isAdmin && !isDocente) {
    if (!relacion) {
      console.log(`🚫 Intento de acceso no autorizado: Padre ${idPersona} buscó Boletín ${idMatricula}`);
      return notFound();
    }
  }

  if (!matricula) return notFound();

  return (
    <div className="min-h-screen bg-slate-50">
       <BoletinView matricula={matricula} />
    </div>
  );
}