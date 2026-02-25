import db from "@/lib/db";

export async function getComunicadosRecibidos(idUsuario: number, rol: string, idsCursos: number[] = []) {
  if (!idUsuario || isNaN(idUsuario)) {
    console.error("ID de usuario no válido en getComunicadosRecibidos");
    return [];
  }

  return await db.comunicado.findMany({
    where: {
      NOT: {
        idUsuario: idUsuario
      },
      OR: [
        { target: "TODOS" },

        { target: rol === "PADRE" ? "PADRES" : "DOCENTES" },

        {
          AND: [
            { idTarget: { in: idsCursos } },
            {
              target: {
                in: [
                  "CURSO",
                  rol === "PADRE" ? "CURSO_PADRES" : "CURSO_DOCENTES"
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

export async function getContadorNoLeidos(idUsuario: number, rol: string, idsCursos: number[] = []) {
  if (!idUsuario) return 0;

  return await db.comunicado.count({
    where: {
      NOT: { idUsuario },
      AND: [
        {
          OR: [
            { target: "TODOS" },
            { target: rol === "PADRE" ? "PADRES" : "DOCENTES" },
            {
              AND: [
                { idTarget: { in: idsCursos } },
                { target: { in: ["CURSO", rol === "PADRE" ? "CURSO_PADRES" : "CURSO_DOCENTES"] } }
              ]
            }
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
export async function getComunicadosEnviados(idUsuario: number) {
  return await db.comunicado.findMany({
    where: { idUsuario },
    include: {
      vistos: true,
      curso: true
    },
    orderBy: {
      fecha: "desc"
    }
  });
}

export async function getComunicadoById(id: number) {
  return await db.comunicado.findUnique({
    where: { idComunicado: id },
    include: {
      usuario: {
        include: {
          persona: { select: { nombre: true, apellido: true } }
        }
      }
    }
  });
}