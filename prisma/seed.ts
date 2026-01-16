import { PrismaClient, PeriodoNombre } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🚀 Iniciando el sembrado de datos...");

  // Hashes de contraseñas iniciales
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedDocentePassword = await bcrypt.hash("docente123", 10);

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

  if (!rolAdmin || !rolDocente) throw new Error("No se encontraron los roles necesarios");

  // 2. SEMBRAR CICLO LECTIVO 2026 (Lo movemos aquí para que su ID esté disponible)
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
        create: {
          fechaIngreso: new Date("2020-01-01"),
        }
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
  console.log("✅ Docente de prueba creado: docente@escuela.com / docente123");

  // 5. CONFIGURACIÓN ACADÉMICA PARA JUAN
  const profeJuan = await prisma.profesor.findFirst({
    where: { persona: { dni: "99888777" } }
  });

  const materiaLengua = await prisma.materia.upsert({
    where: { idMateria: 1 },
    update: {},
    create: { nombre: "Lengua", descripcion: "Lengua y Literatura" }
  });

  const curso2B = await prisma.curso.upsert({
    where: { idCurso: 1 },
    update: {},
    create: { grado: "2", seccion: "B", nivel: "Secundario" }
  });

  // ASIGNACIÓN (Ahora idCiclo ya existe en la variable ciclo2026)
  const asignacionJuan = await prisma.asignacionAcademica.create({
    data: {
      idProfesor: profeJuan!.idProfesor,
      idMateria: materiaLengua.idMateria,
      idCurso: curso2B.idCurso,
      idCiclo: ciclo2026.idCiclo,
      cargaHoraria: 4,
      estado: true
    }
  });

  // HORARIO (Clave para que Juan pueda pasar asistencia hoy)
  await prisma.horario.create({
    data: {
      idAsignacion: asignacionJuan.idAsignacion,
      diaSemana: "Lunes",
      horaInicio: new Date("2026-01-15T08:00:00Z"),
      horaFin: new Date("2026-01-15T09:20:00Z"),
      turno: "Mañana"
    }
  });

  // 6. SEMBRAR PERIODOS ACADÉMICOS
  const periodos = [
    { nombre: PeriodoNombre.TRIMESTRE_1, inicio: "2026-03-01", fin: "2026-05-31" },
    { nombre: PeriodoNombre.TRIMESTRE_2, inicio: "2026-06-01", fin: "2026-08-31" },
    { nombre: PeriodoNombre.TRIMESTRE_3, inicio: "2026-09-01", fin: "2026-12-20" },
  ];

  for (const p of periodos) {
    const existe = await prisma.periodoAcademico.findFirst({
      where: {
        nombre: p.nombre,
        idCiclo: ciclo2026.idCiclo
      }
    });

    if (!existe) {
      await prisma.periodoAcademico.create({
        data: {
          nombre: p.nombre,
          fechaInicio: new Date(p.inicio),
          fechaFin: new Date(p.fin),
          idCiclo: ciclo2026.idCiclo,
        },
      });
      console.log(`✅ Creado: ${p.nombre}`);
    }
  }

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