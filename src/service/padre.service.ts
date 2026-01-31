import db from "@/lib/db";

export async function getHijosConAsistenciaCompleta(idPersona: number, idCiclo: number) {
  const padreData = await db.padre.findUnique({
    where: { idPersona: idPersona },
    include: {
      alumnos: {
        include: {
          alumno: {
            include: {
              persona: true,
              matriculas: {
                where: { idCiclo: idCiclo },
                include: {
                  curso: true,
                  asistencias: {
                    orderBy: { fecha: 'desc' },
                    include: {
                      horario: {
                        include: {
                          asignacion: {
                            include: { materia: true }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!padreData) return [];

  const hijosProcesados = padreData.alumnos.map(relacion => {
    const alumno = relacion.alumno;
    const matriculaActual = alumno.matriculas[0];

    if (!matriculaActual) return null;

    const asistenciasLimpias = matriculaActual.asistencias.map(a => ({
      id: a.idAsistencia,
      fecha: a.fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
      estado: a.estado,
      materia: a.horario.asignacion.materia.nombre,
      horaInicio: a.horario.horaInicio, // Ej: "08:00"
    }));

    const presentes = asistenciasLimpias.filter(a => a.estado === 'Presente').length;
    const ausentes = asistenciasLimpias.filter(a => a.estado === 'Ausente').length;
    const tardes = asistenciasLimpias.filter(a => a.estado === 'Tarde').length;
    const justificadas = asistenciasLimpias.filter(a => a.estado === 'Justificado').length;

    return {
      idAlumno: alumno.idAlumno,
      nombreCompleto: `${alumno.persona.nombre} ${alumno.persona.apellido}`,
      curso: `${matriculaActual.curso.grado}° "${matriculaActual.curso.seccion}"`,
      asistencias: asistenciasLimpias,
      stats: {
        presentismo: presentes,
        ausencias: ausentes,
        llegadasTarde: tardes,
        faltasJustificadas: justificadas
      }
    };
  }).filter(hijo => hijo !== null);

  return hijosProcesados;
}

export async function getAsistenciaDetallada(idAlumno: number, idCiclo: number) {
  return await db.asistencia.findMany({
    where: {
      matricula: {
        idAlumno,
        idCiclo
      }
    },
    include: {
      horario: {
        include: {
          asignacion: {
            include: {
              materia: true
            }
          }
        }
      }
    },
    orderBy: { fecha: 'desc' }
  });
}