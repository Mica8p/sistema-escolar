//este archivo se usa para poblar la base de datos inicial con datos necesarios

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db", // debe coincidir con tu DATABASE_URL
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  console.log("🚀 Iniciando el sembrado de datos...");

  const rolesADefinir = ["ADMIN", "DOCENTE", "PADRE", "ALUMNO"];
  for (const nombre of rolesADefinir) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const rolAdmin = await prisma.rol.findUnique({
    where: { nombre: "ADMIN" },
  });

  if (!rolAdmin) throw new Error("No se encontró el rol ADMIN");

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

