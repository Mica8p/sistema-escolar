import db from "@/lib/db";

// Esta función trae TODO lo necesario para el panel del padre en una sola consulta eficiente.
export async function getHijosConAsistenciaCompleta(idPersona: number, idCiclo: number) {
  // 1. Buscamos al padre
  const padreData = await db.padre.findUnique({
    where: { idPersona: idPersona },
    include: {
      // 2. Incluimos la relación con sus hijos (AlumnoPadre)
      alumnos: {
        include: {
          alumno: {
            include: {
              persona: true, // Para el nombre del hijo (ej: Mateo)
              // 3. Buscamos SOLO la matrícula del ciclo actual (2026)
              matriculas: {
                where: { idCiclo: idCiclo },
                include: {
                  curso: true, // Para mostrar "2° B"
                  // 4. Traemos todas las asistencias de esa matrícula
                  asistencias: {
                    orderBy: { fecha: 'desc' }, // Las más recientes primero
                    include: {
                      // 5. Necesitamos llegar al nombre de la materia
                      horario: {
                        include: {
                           // La asignación conecta horario con materia
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

  // LIMPIEZA DE DATOS:
  // Transformamos la respuesta compleja de Prisma en una lista de hijos más fácil de usar en el front.
  const hijosProcesados = padreData.alumnos.map(relacion => {
    const alumno = relacion.alumno;
    // Tomamos la matrícula de este año (si existe)
    const matriculaActual = alumno.matriculas[0];

    if (!matriculaActual) return null; // Si no está inscripto en 2026, lo ignoramos

    // Aplanamos la estructura de las asistencias
    const asistenciasLimpias = matriculaActual.asistencias.map(a => ({
      id: a.idAsistencia,
      fecha: a.fecha.toISOString().split('T')[0], // Formato YYYY-MM-DD
      estado: a.estado,
      materia: a.horario.asignacion.materia.nombre, // Ej: "Matemática"
      horaInicio: a.horario.horaInicio, // Ej: "08:00"
    }));

    // Calculamos estadísticas rápidas
    const totalPresentes = asistenciasLimpias.filter(a => a.estado === 'Presente' || a.estado === 'Tarde').length;
    const totalAusentes = asistenciasLimpias.filter(a => a.estado === 'Ausente' || a.estado === 'Justificado').length;

    return {
      idAlumno: alumno.idAlumno,
      nombreCompleto: `${alumno.persona.nombre} ${alumno.persona.apellido}`,
      curso: `${matriculaActual.curso.grado}° "${matriculaActual.curso.seccion}"`,
      asistencias: asistenciasLimpias,
      stats: { presentismo: totalPresentes, ausentismo: totalAusentes }
    };
  }).filter(hijo => hijo !== null); // Filtramos los nulos

  return hijosProcesados;
}