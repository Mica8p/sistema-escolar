import db from "@/lib/db";
import type { Prisma } from "@prisma/client";

type ComunicadoOrCondition = 
  | { target: string }
  | { AND: Prisma.ComunicadoWhereInput[] };

export async function getComunicadosRecibidos(idUsuario: number, rol: string, idsCursos: number[] = []) {
  if (!idUsuario || isNaN(idUsuario)) {
    console.error("ID de usuario no válido en getComunicadosRecibidos");
    return [];
  }

  // Construir la condición OR según el rol del usuario
  const orConditions: ComunicadoOrCondition[] = [
    { target: "TODOS" },
  ];

  if (rol === "ADMIN") {
    // Los admins reciben: TODOS, ADMINS
    orConditions.push({ target: "ADMINS" });
  } else if (rol === "PADRE") {
    // Los padres reciben: TODOS, PADRES, comunicados de sus cursos
    orConditions.push({ target: "PADRES" });
    if (idsCursos.length > 0) {
      orConditions.push({
        AND: [
          { idTarget: { in: idsCursos } },
          { target: { in: ["CURSO", "CURSO_PADRES"] } }
        ]
      });

      // Para comunicados PADRES_CURSOS_DOCENTE: verificar que el docente tiene cursos donde está el hijo del padre
      // Obtener profesores de los cursos del padre
      const asignacionesDelPadre = await db.asignacionAcademica.findMany({
        where: {
          idCurso: { in: idsCursos },
          estado: true,
          idProfesor: { not: null }
        },
        distinct: ['idProfesor'],
        select: { 
          profesor: {
            select: {
              idPersona: true
            }
          }
        }
      });

      // Obtener los idUsuario de esos profesores
      const idsPersonasProfs = asignacionesDelPadre
        .map(a => a.profesor?.idPersona)
        .filter((id): id is number => id !== undefined);

      if (idsPersonasProfs.length > 0) {
        const usuariosProfs = await db.usuario.findMany({
          where: {
            idPersona: { in: idsPersonasProfs }
          },
          select: { idUsuario: true }
        });

        const idsUsuariosProfs = usuariosProfs.map(u => u.idUsuario);

        if (idsUsuariosProfs.length > 0) {
          // El comunicado PADRES_CURSOS_DOCENTE debe venir de un docente que tiene cursos del padre
          // Usamos idUsuario en lugar de idTarget porque PADRES_CURSOS_DOCENTE no tiene idTarget específico
          orConditions.push({
            AND: [
              { target: "PADRES_CURSOS_DOCENTE" },
              { idUsuario: { in: idsUsuariosProfs } }
            ]
          });
        }
      }
    }
  } else if (rol === "DOCENTE") {
    // Los docentes reciben: TODOS, DOCENTES (pero NO ADMINS), y comunicados de sus cursos
    orConditions.push({ target: "DOCENTES" });
    if (idsCursos.length > 0) {
      orConditions.push({
        AND: [
          { idTarget: { in: idsCursos } },
          { target: { in: ["CURSO", "CURSO_DOCENTES"] } }
        ]
      });
    }
  }

  return await db.comunicado.findMany({
    where: {
      NOT: {
        idUsuario: idUsuario
      },
      OR: orConditions
    },
    include: {
      usuario: {
        include: {
          persona: {
            select: { nombre: true, apellido: true }
          },
          roles: {
            include: {
              rol: {
                select: { nombre: true }
              }
            }
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

  // Construir la condición OR según el rol del usuario
  const orConditions: ComunicadoOrCondition[] = [
    { target: "TODOS" },
  ];

  if (rol === "ADMIN") {
    // Los admins reciben: TODOS, ADMINS
    orConditions.push({ target: "ADMINS" });
  } else if (rol === "PADRE") {
    // Los padres reciben: TODOS, PADRES, comunicados de sus cursos
    orConditions.push({ target: "PADRES" });
    if (idsCursos.length > 0) {
      orConditions.push({
        AND: [
          { idTarget: { in: idsCursos } },
          { target: { in: ["CURSO", "CURSO_PADRES"] } }
        ]
      });

      // Para comunicados PADRES_CURSOS_DOCENTE: verificar que el docente tiene cursos donde está el hijo del padre
      // Obtener profesores de los cursos del padre
      const asignacionesDelPadre = await db.asignacionAcademica.findMany({
        where: {
          idCurso: { in: idsCursos },
          estado: true,
          idProfesor: { not: null }
        },
        distinct: ['idProfesor'],
        select: { 
          profesor: {
            select: {
              idPersona: true
            }
          }
        }
      });

      // Obtener los idUsuario de esos profesores
      const idsPersonasProfs = asignacionesDelPadre
        .map(a => a.profesor?.idPersona)
        .filter((id): id is number => id !== undefined);

      if (idsPersonasProfs.length > 0) {
        const usuariosProfs = await db.usuario.findMany({
          where: {
            idPersona: { in: idsPersonasProfs }
          },
          select: { idUsuario: true }
        });

        const idsUsuariosProfs = usuariosProfs.map(u => u.idUsuario);

        if (idsUsuariosProfs.length > 0) {
          // El comunicado PADRES_CURSOS_DOCENTE debe venir de un docente que tiene cursos del padre
          // Usamos idUsuario en lugar de idTarget porque PADRES_CURSOS_DOCENTE no tiene idTarget específico
          orConditions.push({
            AND: [
              { target: "PADRES_CURSOS_DOCENTE" },
              { idUsuario: { in: idsUsuariosProfs } }
            ]
          });
        }
      }
    }
  } else if (rol === "DOCENTE") {
    // Los docentes reciben: TODOS, DOCENTES (pero NO ADMINS), y comunicados de sus cursos
    orConditions.push({ target: "DOCENTES" });
    if (idsCursos.length > 0) {
      orConditions.push({
        AND: [
          { idTarget: { in: idsCursos } },
          { target: { in: ["CURSO", "CURSO_DOCENTES"] } }
        ]
      });
    }
  }

  return await db.comunicado.count({
    where: {
      NOT: { idUsuario },
      AND: [
        {
          OR: orConditions
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