import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcryptjs from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

// Helper para generar nombres aleatorios
function nombre() {
  const nombres = [
    "Juan",
    "María",
    "Carlos",
    "Ana",
    "Pedro",
    "Laura",
    "Miguel",
    "Sofia",
    "Luis",
    "Carmen",
    "Diego",
    "Elena",
    "Jorge",
    "Patricia",
    "Francisco",
  ];
  return nombres[Math.floor(Math.random() * nombres.length)];
}

function apellido() {
  const apellidos = [
    "García",
    "Rodríguez",
    "Martínez",
    "López",
    "González",
    "Pérez",
    "Hernández",
    "Díaz",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Flores",
    "Rivera",
    "Morales",
    "Gutierrez",
  ];
  return apellidos[Math.floor(Math.random() * apellidos.length)];
}

function dni(): string {
  return Math.floor(Math.random() * 40000000 + 5000000).toString();
}

function email(): string {
  return `usuario${Math.random().toString(36).substring(7)}@escuela.local`;
}

async function main() {
  console.log("🌱 Iniciando seed con datos de 2024 y 2025...");

  try {
    // ============================================
    // 1. CREAR CICLOS LECTIVOS
    // ============================================
    console.log("\n📚 Creando ciclos lectivos...");

    const ciclo2024 = await prisma.cicloLectivo.upsert({
      where: { anio: 2024 },
      update: {},
      create: {
        anio: 2024,
        estado: false, // Cerrado
      },
    });

    const ciclo2025 = await prisma.cicloLectivo.upsert({
      where: { anio: 2025 },
      update: {},
      create: {
        anio: 2025,
        estado: true, // Activo
      },
    });

    const ciclo2026 = await prisma.cicloLectivo.upsert({
      where: { anio: 2026 },
      update: {},
      create: {
        anio: 2026,
        estado: true, // Actual
      },
    });

    // ============================================
    // 2. CREAR PERÍODOS ACADÉMICOS
    // ============================================
    console.log("📅 Creando períodos académicos...");

    // Períodos 2024
    const periodos2024Data = [
      {
        idCiclo: ciclo2024.idCiclo,
        nombre: "TRIMESTRE_1",
        fechaInicio: new Date("2024-03-01"),
        fechaFin: new Date("2024-05-31"),
        cerrado: true,
      },
      {
        idCiclo: ciclo2024.idCiclo,
        nombre: "TRIMESTRE_2",
        fechaInicio: new Date("2024-06-01"),
        fechaFin: new Date("2024-08-31"),
        cerrado: true,
      },
      {
        idCiclo: ciclo2024.idCiclo,
        nombre: "TRIMESTRE_3",
        fechaInicio: new Date("2024-09-01"),
        fechaFin: new Date("2024-11-30"),
        cerrado: true,
      },
      {
        idCiclo: ciclo2024.idCiclo,
        nombre: "DICIEMBRE",
        fechaInicio: new Date("2024-12-01"),
        fechaFin: new Date("2024-12-31"),
        cerrado: true,
      },
    ];

    for (const periodo of periodos2024Data) {
      try {
        await prisma.periodoAcademico.create({ data: periodo });
      } catch (e) {
        // Ignorar si ya existe
      }
    }

    // Períodos 2025
    const periodos2025Data = [
      {
        idCiclo: ciclo2025.idCiclo,
        nombre: "TRIMESTRE_1",
        fechaInicio: new Date("2025-03-01"),
        fechaFin: new Date("2025-05-31"),
        cerrado: true,
      },
      {
        idCiclo: ciclo2025.idCiclo,
        nombre: "TRIMESTRE_2",
        fechaInicio: new Date("2025-06-01"),
        fechaFin: new Date("2025-08-31"),
        cerrado: true,
      },
      {
        idCiclo: ciclo2025.idCiclo,
        nombre: "TRIMESTRE_3",
        fechaInicio: new Date("2025-09-01"),
        fechaFin: new Date("2025-11-30"),
        cerrado: false,
      },
      {
        idCiclo: ciclo2025.idCiclo,
        nombre: "DICIEMBRE",
        fechaInicio: new Date("2025-12-01"),
        fechaFin: new Date("2025-12-31"),
        cerrado: false,
      },
    ];

    for (const periodo of periodos2025Data) {
      try {
        await prisma.periodoAcademico.create({ data: periodo });
      } catch (e) {
        // Ignorar si ya existe
      }
    }

    // Períodos 2026
    const periodos2026Data = [
      {
        idCiclo: ciclo2026.idCiclo,
        nombre: "TRIMESTRE_1",
        fechaInicio: new Date("2026-03-01"),
        fechaFin: new Date("2026-05-31"),
        cerrado: false,
      },
    ];

    for (const periodo of periodos2026Data) {
      try {
        await prisma.periodoAcademico.create({ data: periodo });
      } catch (e) {
        // Ignorar si ya existe
      }
    }

    // ============================================
    // 3. CREAR ROLES
    // ============================================
    console.log("👥 Creando roles...");

    const rolAdmin = await prisma.rol.upsert({
      where: { nombre: "Admin" },
      update: {},
      create: { nombre: "Admin" },
    });

    const rolDirector = await prisma.rol.upsert({
      where: { nombre: "Director" },
      update: {},
      create: { nombre: "Director" },
    });

    const rolProfesor = await prisma.rol.upsert({
      where: { nombre: "Profesor" },
      update: {},
      create: { nombre: "Profesor" },
    });

    const rolPadre = await prisma.rol.upsert({
      where: { nombre: "Padre" },
      update: {},
      create: { nombre: "Padre" },
    });

    const rolAlumno = await prisma.rol.upsert({
      where: { nombre: "Alumno" },
      update: {},
      create: { nombre: "Alumno" },
    });

    // ============================================
    // 4. CREAR PERSONAS Y USUARIOS
    // ============================================
    console.log("👤 Creando personas y usuarios...");

    // Usuario Admin
    const personaAdmin = await prisma.persona.upsert({
      where: { dni: "12345678" },
      update: {},
      create: {
        nombre: "Admin",
        apellido: "Sistema",
        dni: "12345678",
        email: "admin@escuela.local",
        telefono: "0000000000",
      },
    });

    const usuarioAdmin = await prisma.usuario.upsert({
      where: { idPersona: personaAdmin.idPersona },
      update: {},
      create: {
        idPersona: personaAdmin.idPersona,
        passwordHash: await bcryptjs.hash("admin123", 10),
        estado: true,
        defaultPassword: false,
      },
    });

    await prisma.usuarioRol.upsert({
      where: {
        idUsuario_idRol: {
          idUsuario: usuarioAdmin.idUsuario,
          idRol: rolAdmin.idRol,
        },
      },
      update: {},
      create: {
        idUsuario: usuarioAdmin.idUsuario,
        idRol: rolAdmin.idRol,
      },
    });

    // Crear profesores
    console.log("🧑‍🏫 Creando profesores...");
    const profesoresDatos = [
      { nombre: "María", apellido: "García", dni: "23456789" },
      { nombre: "Carlos", apellido: "López", dni: "34567890" },
      { nombre: "Ana", apellido: "Martínez", dni: "45678901" },
      { nombre: "Pedro", apellido: "Rodríguez", dni: "56789012" },
      { nombre: "Laura", apellido: "Pérez", dni: "67890123" },
    ];

    const profesores = await Promise.all(
      profesoresDatos.map(async (datos) => {
        const persona = await prisma.persona.upsert({
          where: { dni: datos.dni },
          update: {},
          create: {
            nombre: datos.nombre,
            apellido: datos.apellido,
            dni: datos.dni,
            email: email(),
            telefono: "0" + Math.random().toString().slice(2, 12),
          },
        });

        const usuario = await prisma.usuario.upsert({
          where: { idPersona: persona.idPersona },
          update: {},
          create: {
            idPersona: persona.idPersona,
            passwordHash: await bcryptjs.hash("prof123", 10),
            estado: true,
          },
        });

        await prisma.usuarioRol.upsert({
          where: {
            idUsuario_idRol: {
              idUsuario: usuario.idUsuario,
              idRol: rolProfesor.idRol,
            },
          },
          update: {},
          create: {
            idUsuario: usuario.idUsuario,
            idRol: rolProfesor.idRol,
          },
        });

        const profesor = await prisma.profesor.upsert({
          where: { idPersona: persona.idPersona },
          update: {},
          create: {
            idPersona: persona.idPersona,
            fechaIngreso: new Date("2023-01-01"),
          },
        });

        return profesor;
      })
    );

    // ============================================
    // 5. CREAR CURSOS
    // ============================================
    console.log("🏫 Creando cursos...");

    const cursosData = [
      { grado: "1", seccion: "A", nivel: "Primario", turno: "Mañana" },
      { grado: "1", seccion: "B", nivel: "Primario", turno: "Mañana" },
      { grado: "2", seccion: "A", nivel: "Primario", turno: "Tarde" },
      { grado: "2", seccion: "B", nivel: "Primario", turno: "Tarde" },
      { grado: "3", seccion: "A", nivel: "Primario", turno: "Mañana" },
      { grado: "1", seccion: "A", nivel: "Secundario", turno: "Mañana" },
      { grado: "2", seccion: "A", nivel: "Secundario", turno: "Tarde" },
      { grado: "3", seccion: "A", nivel: "Secundario", turno: "Mañana" },
    ];

    const cursos = [];
    for (const datos of cursosData) {
      try {
        const curso = await prisma.curso.create({
          data: datos as any,
        });
        cursos.push(curso);
      } catch (e) {
        // Si ya existe, buscar y devolver
        const existente = await prisma.curso.findFirst({
          where: {
            grado: datos.grado,
            seccion: datos.seccion,
            nivel: datos.nivel,
            turno: datos.turno,
          },
        });
        if (existente) {
          cursos.push(existente);
        }
      }
    }

    // ============================================
    // 6. CREAR MATERIAS
    // ============================================
    console.log("📖 Creando materias...");

    const materiasData = [
      { nombre: "Matemática", descripcion: "Matemáticas" },
      { nombre: "Lengua", descripcion: "Lenguaje y Comunicación" },
      { nombre: "Ciencias Naturales", descripcion: "Biología y Física" },
      { nombre: "Ciencias Sociales", descripcion: "Historia y Geografía" },
      { nombre: "Educación Física", descripcion: "Educación Física" },
      { nombre: "Educación Artística", descripcion: "Artes Plásticas" },
      { nombre: "Inglés", descripcion: "Idioma Inglés" },
      { nombre: "Informática", descripcion: "Tecnología" },
    ];

    const materias = [];
    for (const datos of materiasData) {
      try {
        const materia = await prisma.materia.create({
          data: datos,
        });
        materias.push(materia);
      } catch (e) {
        // Si ya existe, buscar y devolver
        const existente = await prisma.materia.findFirst({
          where: { nombre: datos.nombre },
        });
        if (existente) {
          materias.push(existente);
        }
      }
    }

    // ============================================
    // 7. CREAR ASIGNACIONES ACADÉMICAS Y HORARIOS
    // ============================================
    console.log("📝 Creando asignaciones académicas y horarios...");

    const diasSemana = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];

    // Asignar 2-3 materias por profesor
    const profesoresConMaterias = profesores.map((prof, idx) => ({
      profesor: prof,
      materias: [materias[idx % materias.length], materias[(idx + 1) % materias.length]],
    }));

    for (const ciclo of [ciclo2024, ciclo2025, ciclo2026]) {
      for (const curso of cursos) {
        // Asignar 4-5 materias diferentes a este curso
        const materiasDelCurso = materias.slice(0, 5);

        for (let i = 0; i < materiasDelCurso.length; i++) {
          // Rotar profesores para que cada materia sea enseñada por profesores diferentes
          const profesor = profesores[(i + curso.idCurso) % profesores.length];
          const materia = materiasDelCurso[i];

          try {
            const asignacion = await prisma.asignacionAcademica.create({
              data: {
                idProfesor: profesor.idProfesor,
                idMateria: materia.idMateria,
                idCurso: curso.idCurso,
                idCiclo: ciclo.idCiclo,
                cargaHoraria: 6,
                estado: ciclo.estado,
              },
            });

            // Crear horarios
            for (let j = 0; j < 2; j++) {
              const diaSemana = diasSemana[(i + j) % diasSemana.length];
              const horaInicio = curso.turno === "Mañana" ? "08:00" : "13:00";
              const horaFin = curso.turno === "Mañana" ? "09:00" : "14:00";

              await prisma.horario.create({
                data: {
                  idAsignacion: asignacion.idAsignacion,
                  diaSemana: diaSemana as any,
                  horaInicio,
                  horaFin,
                  aula: `Aula ${curso.grado}${curso.seccion}`,
                },
              });
            }
          } catch (e) {
            // Ignorar si ya existe
          }
        }
      }
    }

    // ============================================
    // 8. CREAR PADRES Y ALUMNOS
    // ============================================
    console.log("👨‍👩‍👧 Creando padres y alumnos...");

    const padres = [];
    for (let i = 0; i < 10; i++) {
      const persona = await prisma.persona.create({
        data: {
          nombre: nombre(),
          apellido: apellido(),
          dni: dni(),
          email: email(),
          telefono: "0" + Math.random().toString().slice(2, 12),
        },
      });

      const usuario = await prisma.usuario.create({
        data: {
          idPersona: persona.idPersona,
          passwordHash: await bcryptjs.hash("padre123", 10),
          estado: true,
        },
      });

      await prisma.usuarioRol.create({
        data: {
          idUsuario: usuario.idUsuario,
          idRol: rolPadre.idRol,
        },
      });

      const padre = await prisma.padre.create({
        data: {
          idPersona: persona.idPersona,
        },
      });

      padres.push(padre);
    }

    // Crear alumnos
    const alumnos = [];
    for (let i = 0; i < 60; i++) {
      const personaAlumno = await prisma.persona.create({
        data: {
          nombre: nombre(),
          apellido: apellido(),
          dni: dni(),
          email: email(),
          telefono: "0" + Math.random().toString().slice(2, 12),
        },
      });

      const usuarioAlumno = await prisma.usuario.create({
        data: {
          idPersona: personaAlumno.idPersona,
          passwordHash: await bcryptjs.hash("alumno123", 10),
          estado: true,
        },
      });

      await prisma.usuarioRol.create({
        data: {
          idUsuario: usuarioAlumno.idUsuario,
          idRol: rolAlumno.idRol,
        },
      });

      const alumno = await prisma.alumno.create({
        data: {
          idPersona: personaAlumno.idPersona,
          fechaNacimiento: new Date(
            2008 + Math.floor(Math.random() * 5),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          legajo: `LEG${Date.now()}_${i}`,
        },
      });

      alumnos.push(alumno);

      // Asignar padres al alumno (máximo 2 padres diferentes)
      const numPadres = Math.random() > 0.5 ? 1 : 2;
      const padresAsignados = new Set<number>();
      for (let j = 0; j < numPadres && padresAsignados.size < padres.length; j++) {
        let padre;
        let intentos = 0;
        do {
          padre = padres[Math.floor(Math.random() * padres.length)];
          intentos++;
        } while (padresAsignados.has(padre.idPadre) && intentos < 5);

        if (!padresAsignados.has(padre.idPadre)) {
          try {
            await prisma.alumnoPadre.create({
              data: {
                idAlumno: alumno.idAlumno,
                idPadre: padre.idPadre,
                relacion: j === 0 ? "Padre" : "Madre",
              },
            });
            padresAsignados.add(padre.idPadre);
          } catch (e) {
            // Ignorar si ya está asignado
          }
        }
      }
    }

    // ============================================
    // 9. CREAR MATRÍCULAS
    // ============================================
    console.log("✅ Creando matrículas...");

    for (const ciclo of [ciclo2024, ciclo2025]) {
      for (const alumno of alumnos.slice(0, 40)) {
        const cursoAleatorio = cursos[Math.floor(Math.random() * cursos.length)];
        const estado = ciclo.anio === 2024 ? "Egresado" : "Activo";

        await prisma.matricula.create({
          data: {
            idAlumno: alumno.idAlumno,
            idCurso: cursoAleatorio.idCurso,
            idCiclo: ciclo.idCiclo,
            fechaInscripcion: new Date(`${ciclo.anio}-02-01`),
            estadoAcademico: estado,
            promedioFinal: ciclo.anio === 2024 ? 7.5 + Math.random() * 2 : null,
          },
        });
      }
    }

    // Matrículas para 2026
    for (const alumno of alumnos) {
      const cursoAleatorio = cursos[Math.floor(Math.random() * cursos.length)];

      await prisma.matricula.create({
        data: {
          idAlumno: alumno.idAlumno,
          idCurso: cursoAleatorio.idCurso,
          idCiclo: ciclo2026.idCiclo,
          fechaInscripcion: new Date("2026-02-01"),
          estadoAcademico: "Activo",
        },
      });
    }

    // ============================================
    // 10. CREAR NOTAS
    // ============================================
    console.log("📊 Creando notas...");

    const matriculas = await prisma.matricula.findMany();
    const periodos2024 = await prisma.periodoAcademico.findMany({
      where: { idCiclo: ciclo2024.idCiclo },
    });
    const periodos2025 = await prisma.periodoAcademico.findMany({
      where: { idCiclo: ciclo2025.idCiclo },
    });

    // Notas 2024
    for (const matricula of matriculas.filter(
      (m) => m.idCiclo === ciclo2024.idCiclo
    )) {
      const asignaciones = await prisma.asignacionAcademica.findMany({
        where: {
          idCiclo: ciclo2024.idCiclo,
          idCurso: matricula.idCurso,
        },
      });

      for (const asignacion of asignaciones) {
        for (const periodo of periodos2024) {
          await prisma.nota.create({
            data: {
              idMatricula: matricula.idMatricula,
              idAsignacion: asignacion.idAsignacion,
              idPeriodo: periodo.idPeriodo,
              tipo: "Parcial",
              nota: 4 + Math.random() * 6,
              observacion:
                Math.random() > 0.7 ? "Necesita mejora" : undefined,
              fechaRegistro: new Date(
                `${periodo.fechaInicio.getFullYear()}-${(periodo.fechaInicio.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-15`
              ),
            },
          });
        }
      }
    }

    // Notas 2025
    for (const matricula of matriculas.filter(
      (m) => m.idCiclo === ciclo2025.idCiclo
    )) {
      const asignaciones = await prisma.asignacionAcademica.findMany({
        where: {
          idCiclo: ciclo2025.idCiclo,
          idCurso: matricula.idCurso,
        },
      });

      for (const asignacion of asignaciones) {
        for (const periodo of periodos2025.slice(0, 3)) {
          // Solo primeros 3 trimestres
          await prisma.nota.create({
            data: {
              idMatricula: matricula.idMatricula,
              idAsignacion: asignacion.idAsignacion,
              idPeriodo: periodo.idPeriodo,
              tipo: "Parcial",
              nota: 5 + Math.random() * 5,
              observacion: undefined,
              fechaRegistro: new Date(
                `${periodo.fechaInicio.getFullYear()}-${(periodo.fechaInicio.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-15`
              ),
            },
          });
        }
      }
    }

    // ============================================
    // 11. CREAR ASISTENCIAS
    // ============================================
    console.log("📋 Creando asistencias...");

    const horarios = await prisma.horario.findMany();
    const matriculas2024 = await prisma.matricula.findMany({
      where: { idCiclo: ciclo2024.idCiclo },
    });

    for (const matricula of matriculas2024.slice(0, 20)) {
      for (const horario of horarios.slice(0, 10)) {
        for (let dia = 1; dia <= 30; dia++) {
          const fecha = new Date(2024, 3, dia); // Abril 2024
          const estado =
            Math.random() > 0.9
              ? "Ausente"
              : Math.random() > 0.95
                ? "Tarde"
                : "Presente";

          try {
            await prisma.asistencia.create({
              data: {
                idMatricula: matricula.idMatricula,
                idHorario: horario.idHorario,
                fecha,
                estado: estado as any,
                idUsuario: usuarioAdmin.idUsuario,
                fechaRegistro: new Date(),
              },
            });
          } catch (e) {
            // Ignorar si ya existe
          }
        }
      }
    }

    // ============================================
    // 12. CREAR CONCEPTOS DE PAGO
    // ============================================
    console.log("💰 Creando conceptos de pago...");

    const conceptosData = [
      {
        nombre: "Cuota Mensual",
        descripcion: "Cuota mensual de escolaridad",
        montoFijo: 5000,
      },
      {
        nombre: "Material Didáctico",
        descripcion: "Compra de material didáctico",
        montoFijo: 1000,
      },
      {
        nombre: "Uniforme",
        descripcion: "Compra de uniforme",
        montoFijo: 3000,
      },
      {
        nombre: "Actividades Extracurriculares",
        descripcion: "Actividades extracurriculares",
        montoFijo: 2000,
      },
    ];

    const conceptos = [];
    for (const concepto of conceptosData) {
      try {
        const c = await prisma.conceptoDePago.create({ data: concepto });
        conceptos.push(c);
      } catch (e) {
        const existente = await prisma.conceptoDePago.findFirst({
          where: { nombre: concepto.nombre },
        });
        if (existente) {
          conceptos.push(existente);
        }
      }
    }

    // ============================================
    // 13. CREAR CARGOS Y PAGOS
    // ============================================
    console.log("🧾 Creando cargos y pagos...");

    for (const alumno of alumnos.slice(0, 30)) {
      // Cargos 2024
      for (const concepto of conceptos) {
        for (let mes = 1; mes <= 12; mes++) {
          const fechaVencimiento = new Date(2024, mes, 10);

          await prisma.cargo.create({
            data: {
              alumnoId: alumno.idAlumno,
              conceptoId: concepto.id,
              monto: concepto.montoFijo || 5000,
              fechaVencimiento,
              estado: "Pagado",
              cicloId: ciclo2024.idCiclo,
            },
          });
        }
      }

      // Cargos 2025
      for (const concepto of conceptos) {
        for (let mes = 1; mes <= 10; mes++) {
          const fechaVencimiento = new Date(2025, mes, 10);

          const cargo = await prisma.cargo.create({
            data: {
              alumnoId: alumno.idAlumno,
              conceptoId: concepto.id,
              monto: concepto.montoFijo || 5000,
              fechaVencimiento,
              estado: mes <= 8 ? "Pagado" : "Pendiente",
              cicloId: ciclo2025.idCiclo,
            },
          });

          // Crear pagos para cargos del 2024
          if (Math.random() > 0.3) {
            const pago = await prisma.pago.create({
              data: {
                alumnoId: alumno.idAlumno,
                montoTotal: cargo.monto,
                fechaPago: new Date(
                  2025,
                  mes + 1,
                  5 + Math.floor(Math.random() * 15)
                ),
                metodoPago: "TRANSFERENCIA",
                usuarioId: usuarioAdmin.idUsuario,
              },
            });

            await prisma.pagoDetalle.create({
              data: {
                pagoId: pago.id,
                cargoId: cargo.id,
                monto: cargo.monto,
              },
            });
          }
        }
      }
    }

    // ============================================
    // 14. CREAR COMUNICADOS
    // ============================================
    console.log("📢 Creando comunicados...");

    const textos = [
      "Recordar traer uniforme completo.",
      "Próxima evaluación el 15 de marzo.",
      "Reunión de padres el sábado.",
      "Suspensión de clases por feriado.",
      "Actividad recreativa en el patio.",
      "Taller de matemática para alumnos de tercero.",
      "Inscripción a viajes de estudio.",
      "Nueva normativa sobre uso del uniforme.",
      "Campeonato intercolegial de deportes.",
      "Charla sobre educación vial.",
    ];

    for (let i = 0; i < 15; i++) {
      const curso = cursos[Math.floor(Math.random() * cursos.length)];
      const texto = textos[Math.floor(Math.random() * textos.length)];

      await prisma.comunicado.create({
        data: {
          titulo: `Comunicado ${i + 1}`,
          contenido: texto,
          idUsuario: usuarioAdmin.idUsuario,
          target: Math.random() > 0.5 ? "TODOS" : "CURSO",
          idTarget: Math.random() > 0.5 ? curso.idCurso : undefined,
          fecha: new Date(
            2025,
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 28) + 1
          ),
        },
      });
    }

    // ============================================
    // 15. CREAR INVENTARIO
    // ============================================
    console.log("📦 Creando inventario...");

    const insumos = [
      {
        nombre: "Tiza blanca",
        stockMinimo: 10,
        unidadMedida: "caja",
      },
      {
        nombre: "Borrador",
        stockMinimo: 5,
        unidadMedida: "caja",
      },
      {
        nombre: "Papel A4",
        stockMinimo: 20,
        unidadMedida: "resma",
      },
      {
        nombre: "Marcadores",
        stockMinimo: 15,
        unidadMedida: "caja",
      },
      {
        nombre: "Tóner impresora",
        stockMinimo: 2,
        unidadMedida: "unidad",
      },
    ];

    const inventarios = [];
    for (const insumo of insumos) {
      try {
        const inv = await prisma.inventario.create({
          data: {
            nombre: insumo.nombre,
            stockActual: Math.round(insumo.stockMinimo * (2 + Math.random() * 3)),
            stockMinimo: insumo.stockMinimo,
            unidadMedida: insumo.unidadMedida,
          },
        });
        inventarios.push(inv);
      } catch (e) {
        // Si ya existe, buscar y devolver
        const existente = await prisma.inventario.findFirst({
          where: { nombre: insumo.nombre },
        });
        if (existente) {
          inventarios.push(existente);
        }
      }
    }

    // ============================================
    // 16. CREAR MOVIMIENTOS DE STOCK
    // ============================================
    console.log("📊 Creando movimientos de stock...");

    for (const inventario of inventarios) {
      for (let i = 0; i < 5; i++) {
        await prisma.movimientoStock.create({
          data: {
            idInsumo: inventario.idInsumo,
            idUsuario: usuarioAdmin.idUsuario,
            tipo: Math.random() > 0.7 ? "Salida" : "Entrada",
            cantidad: Math.floor(Math.random() * 10) + 1,
            fecha: new Date(
              2025,
              Math.floor(Math.random() * 10),
              Math.floor(Math.random() * 28) + 1
            ),
          },
        });
      }
    }

    // ============================================
    // 17. CREAR GASTOS INSTITUCIONALES
    // ============================================
    console.log("💸 Creando gastos institucionales...");

    const categorias = ["Mantenimiento", "Servicios", "Insumos", "Sueldos"];

    for (let i = 0; i < 20; i++) {
      await prisma.gastoInstitucional.create({
        data: {
          idUsuario: usuarioAdmin.idUsuario,
          monto: 1000 + Math.random() * 5000,
          fecha: new Date(
            2025,
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 28) + 1
          ),
          concepto: `Gasto ${i + 1}`,
          categoria: categorias[Math.floor(Math.random() * categorias.length)] as any,
        },
      });
    }

    // ============================================
    // 18. CREAR BLOQUES HORARIOS
    // ============================================
    console.log("⏰ Creando bloques horarios...");

    const bloquesHorarios = [
      { turno: "Mañana", horaInicio: "08:00", horaFin: "09:00", orden: 1 },
      { turno: "Mañana", horaInicio: "09:00", horaFin: "10:00", orden: 2 },
      { turno: "Mañana", horaInicio: "10:00", horaFin: "11:00", orden: 3 },
      { turno: "Mañana", horaInicio: "11:00", horaFin: "12:00", orden: 4 },
      { turno: "Tarde", horaInicio: "13:00", horaFin: "14:00", orden: 1 },
      { turno: "Tarde", horaInicio: "14:00", horaFin: "15:00", orden: 2 },
      { turno: "Tarde", horaInicio: "15:00", horaFin: "16:00", orden: 3 },
      { turno: "Tarde", horaInicio: "16:00", horaFin: "17:00", orden: 4 },
    ];

    for (const bloque of bloquesHorarios) {
      await prisma.bloqueHorario.upsert({
        where: {
          turno_orden: {
            turno: bloque.turno as any,
            orden: bloque.orden,
          },
        },
        update: {},
        create: bloque,
      });
    }

    // ============================================
    // 19. CREAR DÍAS HÁBILES
    // ============================================
    console.log("📅 Creando días hábiles...");

    const diasHabiles = [
      { nombre: "LUNES", habilitado: true, orden: 1 },
      { nombre: "MARTES", habilitado: true, orden: 2 },
      { nombre: "MIERCOLES", habilitado: true, orden: 3 },
      { nombre: "JUEVES", habilitado: true, orden: 4 },
      { nombre: "VIERNES", habilitado: true, orden: 5 },
      { nombre: "SABADO", habilitado: false, orden: 6 },
      { nombre: "DOMINGO", habilitado: false, orden: 7 },
    ];

    for (const dia of diasHabiles) {
      await prisma.diaHabil.upsert({
        where: { nombre: dia.nombre as any },
        update: { habilitado: dia.habilitado },
        create: dia,
      });
    }

    console.log("\n✅ ¡Seed completado exitosamente!");
    console.log("📊 Datos poblados:");
    console.log("   • 2 ciclos lectivos cerrados (2024, 2025)");
    console.log("   • Períodos académicos para 2024, 2025 y 2026");
    console.log("   • 5 profesores");
    console.log("   • 8 cursos");
    console.log("   • 8 materias");
    console.log("   • 60 alumnos");
    console.log("   • 10 padres");
    console.log("   • Matrículas, notas y asistencias históricas");
    console.log("   • Cargos y pagos de 2024 y 2025");
    console.log("   • Comunicados, inventario y gastos");
    console.log(
      "\n🔐 Credenciales de acceso:"
    );
    console.log("   • Admin: admin@escuela.local / admin123");
    console.log("   • Profesores: prof123");
    console.log("   • Alumnos: alumno123");
    console.log("   • Padres: padre123");
  } catch (error) {
    console.error("❌ Error en seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
