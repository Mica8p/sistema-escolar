import db from "@/lib/db";

export async function getComunicadosRecibidos(idUsuario: number, rol: string, idCursoAlumno?: number) {

  if (!idUsuario || isNaN(idUsuario)) {
    console.error("ID de usuario no válido en getComunicadosRecibidos");
    return [];
  }

  return await db.comunicado.findMany({
    where: {
      OR: [
        { target: "TODOS" },

        { target: rol === "PADRE" ? "PADRES" : "DOCENTES" },

        {
          AND: [
            { idTarget: idCursoAlumno || 0 },
            {
              target: {
                in: [
                  "CURSO",
                  rol === "PADRE" ? "CURSO_PADRES" : "CURSO_DOCENTES" // Específico por rol dentro del curso
                ]
              }
            }
          ]
        }
      ]
    },
    include: {
      usuario: {
        include: {
          persona: {
            select: { nombre: true, apellido: true }
          }
        }
      },
      vistos: {
        where: { idUsuario }
      }
    },
    orderBy: { fecha: 'desc' }
  });
}

export async function getContadorNoLeidos(idUsuario: number, rol: string) {
  if (!idUsuario) return 0;

  return await db.comunicado.count({
    where: {
      AND: [
        {
          OR: [
            { target: "TODOS" },
            { target: rol === "PADRE" ? "PADRES" : "DOCENTES" },
          ]
        },
        {
          vistos: {
            none: { idUsuario }
          }
        }
      ]
    }
  });
}