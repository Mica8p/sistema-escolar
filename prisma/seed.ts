import { PrismaClient } from "@prisma/client";
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
  console.log("🌱 Base de datos limpia: Creando único administrador del sistema...");

  const rolesADefinir = ["ADMIN", "DOCENTE", "PADRE", "ALUMNO"];
  for (const nombre of rolesADefinir) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const rolAdmin = await prisma.rol.findUnique({ where: { nombre: "ADMIN" } });
  if (!rolAdmin) throw new Error("No se pudo crear el rol ADMIN");

  const hashedAdminPassword = await bcrypt.hash("admin123", 10);

  await prisma.persona.upsert({
    where: { dni: "12345678" },
    update: {},
    create: {
      nombre: "Admin",
      apellido: "Principal",
      dni: "12345678",
      email: "admin@escuela.local",
      usuario: {
        create: {
          passwordHash: hashedAdminPassword,
          estado: true,
          defaultPassword: false,
          roles: {
            create: { idRol: rolAdmin.idRol },
          },
        },
      },
    },
  });

  console.log("✅ Roles creados.");
  console.log("✅ Admin creado: DNI 12345678 / Pass: admin123");
  console.log("🚀 ¡Ya podés entrar a cargar el resto!");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });