import { PrismaClient, PeriodoNombre, DiaSemana, Turno, Nivel, EstadoCuota } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";
import db from "@/lib/db";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🚀 Iniciando el sembrado de datos (Escuela Pro)...");

  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedDocentePassword = await bcrypt.hash("docente123", 10);
  const hashedPadrePassword = await bcrypt.hash("padre123", 10); // Nueva password

  // 1. SEMBRAR ROLES
  const rolesADefinir = ["ADMIN", "DOCENTE", "PADRE", "ALUMNO"];
  for (const nombre of rolesADefinir) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: "ADMIN" } });
  const rolDocente = await prisma.rol.findUnique({ where: { nombre: "DOCENTE" } });
  const rolPadre = await prisma.rol.findUnique({ where: { nombre: "PADRE" } });

  if (!rolAdmin || !rolDocente || !rolPadre) throw new Error("No se encontraron los roles");

  // 2. SEMBRAR CICLO LECTIVO 2026
  const ciclo2026 = await prisma.cicloLectivo.upsert({
    where: { anio: 2026 },
    update: {},
    create: {
      anio: 2026,
      estado: true,
    },
  });
  console.log(`📅 Ciclo ${ciclo2026.anio} preparado.`);

  // 3. SEMBRAR ADMINISTRADOR PRINCIPAL
  await prisma.persona.upsert({
    where: { dni: "12345678" },
    update: {},
    create: {
      nombre: "Admin",
      apellido: "Principal",
      dni: "12345678",
      email: "admin@escuela.com",
      usuario: {
        create: {
          passwordHash: hashedAdminPassword,
          estado: true,
          roles: {
            create: { idRol: rolAdmin.idRol },
          },
        },
      },
    },
  });

  // 4. SEMBRAR DOCENTE DE PRUEBA (Juan)
  await prisma.persona.upsert({
    where: { dni: "99888777" },
    update: {},
    create: {
      nombre: "Juan",
      apellido: "Docente",
      dni: "99888777",
      email: "docente@escuela.com",
      profesor: {
        create: { fechaIngreso: new Date("2020-01-01") }
      },
      usuario: {
        create: {
          passwordHash: hashedDocentePassword,
          estado: true,
          roles: {
            create: { idRol: rolDocente.idRol },
          },
        },
      },
    },
  });

  // 5. NUEVO: SEMBRAR PADRE DE PRUEBA (Para el perfil de familia)
  await prisma.persona.upsert({
    where: { dni: "55555444" },
    update: {},
    create: {
      nombre: "Carlos",
      apellido: "Padre",
      dni: "55555444",
      email: "padre@escuela.com",
      padre: {
        create: {} // Relacionamos con el modelo Padre
      },
      usuario: {
        create: {
          passwordHash: hashedPadrePassword,
          estado: true,
          roles: {
            create: { idRol: rolPadre.idRol },
          },
        },
      },
    },
  });
  console.log("✅ Padre creado: padre@escuela.com / padre123");

  // 6. CONFIGURACIÓN ACADÉMICA
  const materiaLengua = await prisma.materia.upsert({
    where: { idMateria: 1 },
    update: {},
    create: { nombre: "Lengua", descripcion: "Lengua y Literatura" }
  });

  // CORRECCIÓN: Curso ahora necesita Turno obligatorio
  const curso2B = await prisma.curso.upsert({
    where: { idCurso: 1 },
    update: {},
    create: {
      grado: "2",
      seccion: "B",
      nivel: Nivel.Secundario,
      turno: Turno.Mañana // Usamos el Enum
    }
  });

  const profeJuan = await prisma.profesor.findFirst({
    where: { persona: { dni: "99888777" } }
  });

  const asignacionJuan = await prisma.asignacionAcademica.upsert({
    where: { idAsignacion: 1 },
    update: {},
    create: {
      idProfesor: profeJuan!.idProfesor,
      idMateria: materiaLengua.idMateria,
      idCurso: curso2B.idCurso,
      idCiclo: ciclo2026.idCiclo,
      cargaHoraria: 4,
      estado: true
    }
  });

  // CORRECCIÓN: Horario usa DiaSemana Enum y String para horas
  await prisma.horario.upsert({
    where: { idHorario: 1 },
    update: {},
    create: {
      idAsignacion: asignacionJuan.idAsignacion,
      diaSemana: DiaSemana.LUNES, // Usamos Enum
      horaInicio: "08:00", // String, no DateTime
      horaFin: "09:20",
      aula: "Aula 5"
    }
  });

  // 7. SEMBRAR PERIODOS ACADÉMICOS 2026
  const periodos = [
    { nombre: PeriodoNombre.TRIMESTRE_1, inicio: "2026-03-01", fin: "2026-05-31" },
    { nombre: PeriodoNombre.TRIMESTRE_2, inicio: "2026-06-01", fin: "2026-08-31" },
    { nombre: PeriodoNombre.TRIMESTRE_3, inicio: "2026-09-01", fin: "2026-12-20" },
    { nombre: PeriodoNombre.DICIEMBRE,    inicio: "2026-12-21", fin: "2026-12-30" },
    { nombre: PeriodoNombre.FEBRERO,      inicio: "2027-02-01", fin: "2027-02-28" },
  ];

  for (const p of periodos) {
    await prisma.periodoAcademico.upsert({
      where: {
        idCiclo_nombre: {
          idCiclo: ciclo2026.idCiclo,
          nombre: p.nombre,
        },
      },
      update: {},
      create: {
        nombre: p.nombre,
        fechaInicio: new Date(p.inicio),
        fechaFin: new Date(p.fin),
        idCiclo: ciclo2026.idCiclo,
      },
    });
  }

  // 8. SEMBRAR ALUMNO DE PRUEBA (Hijo de Carlos)
  const alumnoPrueba = await prisma.persona.upsert({
    where: { dni: "44444333" },
    update: {},
    create: {
      nombre: "Mateo",
      apellido: "Hijo",
      dni: "44444333",
      email: "alumno@escuela.com",
      alumno: {
        create: {
          legajo: "LEG-2026-001",
          fechaNacimiento: new Date("2015-05-20"),
        }
      }
    },
    include: { alumno: true } // Traemos el ID del alumno creado
  });

  // 9. VINCULAR ALUMNO CON EL PADRE (Relación familiar)
  const padreCarlos = await prisma.padre.findFirst({
    where: { persona: { dni: "55555444" } }
  });

  if (alumnoPrueba.alumno && padreCarlos) {
    await prisma.alumnoPadre.upsert({
      where: {
        idAlumno_idPadre: {
          idAlumno: alumnoPrueba.alumno.idAlumno,
          idPadre: padreCarlos.idPadre,
        },
      },
      update: {},
      create: {
        idAlumno: alumnoPrueba.alumno.idAlumno,
        idPadre: padreCarlos.idPadre,
        relacion: "PADRE",
      },
    });
    console.log("👨‍👦 Relación Padre-Hijo establecida.");
  }

  // 10. MATRICULAR AL ALUMNO EN EL CURSO (Inscripción inicial)
  if (alumnoPrueba.alumno) {
    await prisma.matricula.upsert({
      where: {
        idAlumno_idCiclo: {
          idAlumno: alumnoPrueba.alumno.idAlumno,
          idCiclo: ciclo2026.idCiclo,
        },
      },
      update: {},
      create: {
        idAlumno: alumnoPrueba.alumno.idAlumno,
        idCurso: curso2B.idCurso,
        idCiclo: ciclo2026.idCiclo,
        fechaInscripcion: new Date(),
        estadoAcademico: "Activo",
      },
    });
    console.log("📝 Alumno matriculado en 2° B - Mañana.");
  }

  // 11. SEMBRAR CONCEPTOS DE PAGO
  console.log("💰 Sembrando conceptos de pago...");
  await prisma.conceptoDePago.upsert({
    where: { nombre: "Inscripción Anual" },
    update: {},
    create: {
      nombre: "Inscripción Anual",
      descripcion: "Cargo anual por inscripción al ciclo lectivo.",
      montoFijo: 5000,
    },
  });
  await prisma.conceptoDePago.upsert({
    where: { nombre: "Cuota Mensual - Nivel Secundario" },
    update: {},
    create: {
      nombre: "Cuota Mensual - Nivel Secundario",
      descripcion: "Cuota mensual para alumnos de nivel secundario.",
      montoFijo: 2500,
    },
  });
  await prisma.conceptoDePago.upsert({
    where: { nombre: "Cuota Mensual - Nivel Primario" },
    update: {},
    create: {
      nombre: "Cuota Mensual - Nivel Primario",
      descripcion: "Cuota mensual para alumnos de nivel primario.",
      montoFijo: 2000,
    },
  });
  await prisma.conceptoDePago.upsert({
    where: { nombre: "Material Didáctico" },
    update: {},
    create: {
      nombre: "Material Didáctico",
      descripcion: "Libros y materiales para el año.",
    },
  });
  console.log("✅ Conceptos de pago creados.");

  // 12. GENERAR CARGO DE PRUEBA (Para probar finanzas)
  if (alumnoPrueba.alumno) {
    const conceptoInscripcion = await prisma.conceptoDePago.findUnique({
      where: { nombre: "Inscripción Anual" }
    });

    if (conceptoInscripcion) {
      await prisma.cargo.create({
        data: {
          alumnoId: alumnoPrueba.alumno.idAlumno,
          conceptoId: conceptoInscripcion.id,
          monto: conceptoInscripcion.montoFijo || 5000,
          fechaVencimiento: new Date("2026-03-15"),
          estado: EstadoCuota.Pendiente,
          cicloId: ciclo2026.idCiclo
        }
      });
      console.log("💸 Cargo de prueba (Inscripción) asignado al alumno.");
    }
  }

  const adminUser = await prisma.usuario.findFirst({
    where: { persona: { dni: "12345678" } }
  });

  if (adminUser) {
    const listadoComunicados = [
      {
        titulo: "Bienvenida al Ciclo Lectivo 2026",
        contenido: "Estimada comunidad, les damos la bienvenida a un nuevo año escolar lleno de desafíos.",
        target: "TODOS",
        idUsuario: adminUser.idUsuario,
      },
      {
        titulo: "Nueva funcionalidad: Gestión de Horarios",
        contenido: "Docentes, ya pueden consultar sus horarios asignados en la nueva sección del panel.",
        target: "DOCENTES",
        idUsuario: adminUser.idUsuario,
      },
      {
        titulo: "Recordatorio de Pago de Matrícula",
        contenido: "Se informa a los padres que el vencimiento de la matrícula es el próximo 10 de febrero.",
        target: "PADRES",
        idUsuario: adminUser.idUsuario,
      }
    ];

    for (const c of listadoComunicados) {
      // Usamos create porque Comunicado no tiene campos únicos que generen conflicto al repetir el seed
      await prisma.comunicado.create({
        data: c
      });
    }
    console.log("✅ Comunicados de prueba generados.");
  }

  // 13. SEMBRAR PLANTILLA DE HORARIOS
  console.log("🗓️  Sembrando plantilla de horarios por defecto...");

  const diasSemana = [
    { nombre: DiaSemana.LUNES, orden: 0, habilitado: true },
    { nombre: DiaSemana.MARTES, orden: 1, habilitado: true },
    { nombre: DiaSemana.MIERCOLES, orden: 2, habilitado: true },
    { nombre: DiaSemana.JUEVES, orden: 3, habilitado: true },
    { nombre: DiaSemana.VIERNES, orden: 4, habilitado: true },
    { nombre: DiaSemana.SABADO, orden: 5, habilitado: false },
    { nombre: DiaSemana.DOMINGO, orden: 6, habilitado: false },
  ];

  for(const dia of diasSemana) {
    await prisma.diaHabil.upsert({
      where: { nombre: dia.nombre },
      update: { habilitado: dia.habilitado, orden: dia.orden },
      create: dia,
    });
  }

  const horasManana = [
    "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
  ];
  const horasTarde = [
    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
  ];

  // Clear existing blocks to avoid duplicates on re-seed
  await prisma.bloqueHorario.deleteMany({});

  for (let i = 0; i < horasManana.length; i++) {
    const [horaInicio, horaFin] = horasManana[i].split(" - ");
    await prisma.bloqueHorario.create({
      data: {
        turno: Turno.Mañana,
        horaInicio,
        horaFin,
        orden: i
      }
    });
  }

  for (let i = 0; i < horasTarde.length; i++) {
    const [horaInicio, horaFin] = horasTarde[i].split(" - ");
    await prisma.bloqueHorario.create({
      data: {
        turno: Turno.Tarde,
        horaInicio,
        horaFin,
        orden: i
      }
    });
  }
  console.log("✅ Plantilla de horarios creada.");

  console.log("✅ Seed completado con éxito.");

}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
