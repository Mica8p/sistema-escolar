import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    // Verificación: Usuario autenticado
    if (!session?.user?.idUsuario) {
      return Response.json(
        { error: "Debes estar autenticado" },
        { status: 403 }
      );
    }

    // Obtener todos los profesores
    const profesores = await db.profesor.findMany({
      include: {
        persona: true,
        asignaciones: {
          where: { estado: true },
          include: {
            materia: true,
            curso: true,
          },
        },
      },
      orderBy: {
        persona: {
          apellido: "asc",
        },
      },
    });

    return Response.json({
      total: profesores.length,
      profesores: profesores.map((p) => ({
        idProfesor: p.idProfesor,
        nombre: p.persona.nombre,
        apellido: p.persona.apellido,
        nombreCompleto: `${p.persona.apellido}, ${p.persona.nombre}`,
        asignacionesActivas: p.asignaciones.length,
        asignaciones: p.asignaciones.map((a) => ({
          materia: a.materia.nombre,
          curso: `${a.curso.grado}° "${a.curso.seccion}"`,
        })),
      })),
    });
  } catch (error) {
    console.error("Error listando profesores:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
