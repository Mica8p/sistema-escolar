import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Sembrando base de datos...");
  try {
    const roles = ["ADMIN", "DOCENTE", "PADRE", "ALUMNO"];
    const rolesMap: Record<string, number> = {};

    for (const rol of roles) {
      const r = await prisma.rol.upsert({
        where: { nombre: rol },
        update: {},
        create: { nombre: rol },
      });
      rolesMap[rol] = r.idRol;
    }

    const pass = await bcrypt.hash("admin123", 10);
    const p = await prisma.persona.upsert({
      where: { dni: "39571184" },
      update: {},
      create: {
        nombre: "Gabriel",
        apellido: "Timo",
        dni: "39571184",
        telefono: "3813430992",
        email: "gabitimo006@gmail.com",
      },
    });

    await prisma.usuario.upsert({
      where: { idPersona: p.idPersona },
      update: {},
      create: {
        idPersona: p.idPersona,
        passwordHash: pass,
        estado: true,
        defaultPassword: false,
        roles: { create: { idRol: rolesMap["ADMIN"] } },
      },
    });

    console.log("✅ Base de datos lista!");
    console.log("📝 Admin: DNI 39571184 / contraseña: admin123");
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());
