import { getBoletinCompleto } from "@/service/calificaciones.service";
import BoletinView from "@/components/modules/alumnos/BoletinView";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import db from "@/lib/db";

export default async function BoletinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const idMatricula = Number(id);

  console.log(`📋 Acceso a boletín: idMatricula=${idMatricula}, usuario=${session?.user?.email}`);

  if (!session?.user) redirect("/login");

  const userRoles = session.user.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isDocente = userRoles.includes("DOCENTE");
  const idPersona = session.user.idPersona;

  console.log(`👤 Roles: ${userRoles.join(", ")} | idPersona: ${idPersona}`);

  // Obtener matricula primero
  const matricula = await getBoletinCompleto(idMatricula);
  
  console.log(`📊 Matricula encontrada: ${matricula ? "✓" : "✗"}`);

  if (!matricula) {
    console.log(`❌ No existe matricula con ID ${idMatricula}`);
    return notFound();
  }

  // Si es padre, validar relación
  if (!isAdmin && !isDocente) {
    console.log(`🔐 Validando relación padre-alumno...`);
    
    const relacion = await db.alumnoPadre.findFirst({
      where: {
        padre: { idPersona: idPersona },
        alumno: {
          matriculas: {
            some: { idMatricula: idMatricula }
          }
        }
      }
    });

    if (!relacion) {
      console.log(`🚫 Intento de acceso no autorizado: Padre ${idPersona} buscó Boletín ${idMatricula}`);
      return notFound();
    }

    console.log(`✅ Padre autorizado para ver este boletín`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
       <BoletinView matricula={matricula} />
    </div>
  );
}