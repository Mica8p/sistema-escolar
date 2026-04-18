import db from "@/lib/db";

/**
 * Función de diagnóstico para verificar por qué una profesora
 * no ve notificación de notas pendientes
 */
export async function diagnosticarNotasPendientes(idProfesor: number) {
  console.log(`\n========== DIAGNOSTICO DE NOTAS PENDIENTES ==========`);
  console.log(`ID Profesor: ${idProfesor}\n`);

  try {
    // 1. Obtener información del profesor
    const profesor = await db.profesor.findUnique({
      where: { idProfesor },
      include: {
        persona: true,
        asignaciones: {
          where: { estado: true },
          include: {
            ciclo: true,
            materia: true,
            curso: true,
          },
        },
      },
    });

    if (!profesor) {
      console.log("❌ Profesor no encontrado");
      return;
    }

    console.log(`✅ Profesor: ${profesor.persona.nombre} ${profesor.persona.apellido}`);
    console.log(`   Asignaciones activas: ${profesor.asignaciones.length}`);

    // 2. Obtener períodos próximos a cerrar (próximas 72 horas)
    const ahora = new Date();
    const hace72horas = new Date(ahora.getTime() - 72 * 60 * 60 * 1000);

    const periodosProximos = await db.periodoAcademico.findMany({
      where: {
        cerrado: false,
        fechaFin: {
          gte: hace72horas,
          lte: new Date(ahora.getTime() + 72 * 60 * 60 * 1000),
        },
      },
      orderBy: { fechaFin: "asc" },
    });

    console.log(`\n📅 Períodos abiertos próximos a cerrar: ${periodosProximos.length}`);

    for (const periodo of periodosProximos) {
      const diasFaltantes = Math.ceil(
        (periodo.fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`\n   📌 ${periodo.nombre}`);
      console.log(`      Fecha inicio: ${periodo.fechaInicio.toISOString().split("T")[0]}`);
      console.log(`      Fecha fin: ${periodo.fechaFin.toISOString().split("T")[0]}`);
      console.log(`      Dias faltantes: ${diasFaltantes}`);
      console.log(`      Cerrado: ${periodo.cerrado}`);

      // 3. Para cada asignación del profesor en este ciclo
      const asignacionesEnPeriodo = profesor.asignaciones.filter(
        (a) => a.idCiclo === periodo.idCiclo
      );

      console.log(`      Asignaciones del profesor en este ciclo: ${asignacionesEnPeriodo.length}`);

      for (const asignacion of asignacionesEnPeriodo) {
        // 4. Obtener alumnos del curso
        const matriculasCurso = await db.matricula.findMany({
          where: {
            idCurso: asignacion.idCurso,
            idCiclo: periodo.idCiclo,
            estadoAcademico: "Activo",
          },
          include: {
            alumno: { include: { persona: true } },
          },
        });

        console.log(`\n         📚 ${asignacion.materia.nombre} (${asignacion.curso.grado}° "${asignacion.curso.seccion}")`);
        console.log(`            Alumnos activos: ${matriculasCurso.length}`);

        let alumnosSinNota = 0;
        for (const matricula of matriculasCurso) {
          const notaExistente = await db.nota.findFirst({
            where: {
              idMatricula: matricula.idMatricula,
              idAsignacion: asignacion.idAsignacion,
              idPeriodo: periodo.idPeriodo,
            },
          });

          if (!notaExistente) {
            alumnosSinNota++;
            console.log(
              `               ❌ SIN NOTA: ${matricula.alumno.persona.apellido}, ${matricula.alumno.persona.nombre}`
            );
          }
        }

        console.log(`            Alumnos sin nota: ${alumnosSinNota}/${matriculasCurso.length}`);
      }
    }

    console.log(`\n========== FIN DEL DIAGNOSTICO ==========\n`);
  } catch (error) {
    console.error("Error en diagnostico:", error);
  }
}
