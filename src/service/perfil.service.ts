import db from "@/lib/db";

function pickMatriculaActual(matriculas: any[]) {
  if (!matriculas?.length) return null;

  // Matrícula del ciclo activo
  const activa = matriculas.find((m) => m.ciclo?.estado === true);
  const m = activa ?? matriculas[0];

  if (!m?.curso || !m?.ciclo) return null;

  return {
    cicloAnio: m.ciclo.anio,
    curso: {
      grado: m.curso.grado,
      seccion: m.curso.seccion,
      nivel: m.curso.nivel,
      turno: m.curso.turno,
    },
    estadoAcademico: m.estadoAcademico,
  };
}

export async function getPerfilByIdPersona(idPersona: number) {
  const usuario = await db.usuario.findFirst({
    where: { idPersona },
    include: {
      persona: {
        include: {
          // PADRE
          padre: {
            include: {
              alumnos: {
                include: {
                  alumno: {
                    include: {
                      persona: true, // avatarUrl/idPersona del hijo (Persona)
                      matriculas: {
                        orderBy: { fechaInscripcion: "desc" },
                        include: {
                          ciclo: { select: { anio: true, estado: true } },
                          curso: {
                            select: {
                              grado: true,
                              seccion: true,
                              nivel: true,
                              turno: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          // DOCENTE
          profesor: {
            include: {
              asignaciones: {
                where: { estado: true },
                include: {
                  materia: { select: { nombre: true } },
                  curso: {
                    select: {
                      grado: true,
                      seccion: true,
                      nivel: true,
                      turno: true,
                    },
                  },
                  horarios: {
                    select: {
                      diaSemana: true,
                      horaInicio: true,
                      horaFin: true,
                      aula: true,
                    },
                    orderBy: { diaSemana: "asc" },
                  },
                },
                orderBy: { idAsignacion: "desc" },
              },
            },
          },
        },
      },

      roles: { include: { rol: true } },

      _count: {
        select: {
          pagosRegistrados: true,
          movimientos: true,
          comunicados: true,
          gastos: true,
        },
      },
    },
  });

  if (!usuario) return null;

  // Roles
  const roles = usuario.roles
    .map((r) => r.rol.nombre)
    .filter((r) => r !== "ALUMNO");

  const padre = usuario.persona.padre
    ? {
        hijos: usuario.persona.padre.alumnos.map((ap: any) => ({
          relacion: ap.relacion,
          alumno: {
            // AvatarEditor en hijos
            idPersona: ap.alumno.persona.idPersona,
            avatarUrl: ap.alumno.persona.avatarUrl ?? null,

            nombre: ap.alumno.persona.nombre,
            apellido: ap.alumno.persona.apellido,
            legajo: ap.alumno.legajo,
            matriculaActual: pickMatriculaActual(ap.alumno.matriculas),
          },
        })),
      }
    : null;

  const docente = usuario.persona.profesor
    ? {
        fechaIngreso: usuario.persona.profesor.fechaIngreso,
        asignacionesActivas: usuario.persona.profesor.asignaciones.map((a: any) => ({
          materia: a.materia.nombre,
          cargaHoraria: a.cargaHoraria,
          curso: a.curso,
          horarios: a.horarios,
        })),
      }
    : null;

  const adminStats = roles.includes("ADMIN")
    ? {
        pagosRegistrados: usuario._count.pagosRegistrados,
        movimientosStock: usuario._count.movimientos,
        comunicados: usuario._count.comunicados,
        gastos: usuario._count.gastos,
      }
    : null;

  return {
    // AvatarEditor del perfil
    idPersona: usuario.persona.idPersona,
    avatarUrl: usuario.persona.avatarUrl ?? null,

    nombre: usuario.persona.nombre,
    apellido: usuario.persona.apellido,
    dni: usuario.persona.dni,
    email: usuario.persona.email ?? null,
    telefono: usuario.persona.telefono ?? null,
    direccion: usuario.persona.direccion ?? null,
    estado: usuario.estado,
    createdAt: usuario.createdAt,
    roles,

    padre,
    docente,
    adminStats,
  };
}
