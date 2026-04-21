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
    // ⭐ IMPORTANTE: SUPER_ADMIN es el rol más alto del sistema
    // El establecimiento elegirá quién será el SUPER_ADMIN
    // Los desarrolladores SOLO intervienen en emergencias
    const roles = ["SUPER_ADMIN", "ADMIN", "DOCENTE", "PADRE", "ALUMNO"];
    const rolesMap: Record<string, number> = {};

    for (const rol of roles) {
      const r = await prisma.rol.upsert({
        where: { nombre: rol },
        update: {},
        create: { nombre: rol },
      });
      rolesMap[rol] = r.idRol;
    }

    console.log("✅ Roles creados:", Object.keys(rolesMap));

    const pass = await bcrypt.hash("admin123", 10);
    
    // 1. Crear o actualizar persona
    const p = await prisma.persona.upsert({
      where: { dni: "39571184" },
      update: {
        nombre: "Gabriel",
        apellido: "Timo",
        telefono: "3813430992",
        email: "gabitimo006@gmail.com",
      },
      create: {
        nombre: "Gabriel",
        apellido: "Timo",
        dni: "39571184",
        telefono: "3813430992",
        email: "gabitimo006@gmail.com",
      },
    });

    // 2. Crear o actualizar usuario
    let usuario = await prisma.usuario.findUnique({
      where: { idPersona: p.idPersona }
    });

    if (usuario) {
      // Actualizar contraseña
      usuario = await prisma.usuario.update({
        where: { idPersona: p.idPersona },
        data: {
          passwordHash: pass,
          estado: true,
          defaultPassword: false,
        },
      });
    } else {
      // Crear usuario
      usuario = await prisma.usuario.create({
        data: {
          idPersona: p.idPersona,
          passwordHash: pass,
          estado: true,
          defaultPassword: false,
        },
      });
    }

    // 3. Eliminar todos los roles anteriores
    await prisma.usuarioRol.deleteMany({
      where: { idUsuario: usuario.idUsuario }
    });

    // 4. Asignar rol SUPER_ADMIN
    await prisma.usuarioRol.create({
      data: {
        idUsuario: usuario.idUsuario,
        idRol: rolesMap["SUPER_ADMIN"]
      }
    });

    console.log("✅ Base de datos lista!");
    console.log("📝 Admin: DNI 39571184 / contraseña: admin123");
  } catch (e) {
    console.error("❌ Error:", e);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());
