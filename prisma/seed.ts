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
  console.log("🌱 Iniciando seed...");
  try {
    // 1. Crear roles
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

    // 2. Crear super admin bootstrap
    const DNI_BOOTSTRAP = '12345678';
    const PASSWORD_BOOTSTRAP = '12345678';
    const NOMBRE_BOOTSTRAP = 'Desarrollador';
    const APELLIDO_BOOTSTRAP = 'Sistema';
    const EMAIL_BOOTSTRAP = 'dev@sistema.local';

    // Verificar si ya existe
    const existingPersona = await prisma.persona.findUnique({
      where: { dni: DNI_BOOTSTRAP },
      include: { usuario: true }
    });

    if (!existingPersona) {
      console.log(`\n📝 Creando super admin bootstrap...`);
      
      const hashedPassword = await bcrypt.hash(PASSWORD_BOOTSTRAP, 10);
      
      const persona = await prisma.persona.create({
        data: {
          nombre: NOMBRE_BOOTSTRAP,
          apellido: APELLIDO_BOOTSTRAP,
          dni: DNI_BOOTSTRAP,
          email: EMAIL_BOOTSTRAP,
          usuario: {
            create: {
              passwordHash: hashedPassword,
              estado: true,
              defaultPassword: true
            }
          }
        },
        include: { usuario: true }
      });

      // Asignar rol SUPER_ADMIN
      await prisma.usuarioRol.create({
        data: {
          idUsuario: persona.usuario!.idUsuario,
          idRol: rolesMap['SUPER_ADMIN']
        }
      });

      console.log(`✅ Super admin bootstrap creado exitosamente`);
      console.log(`\n🔐 Datos de acceso:`);
      console.log(`   DNI: ${DNI_BOOTSTRAP}`);
      console.log(`   Contraseña: ${PASSWORD_BOOTSTRAP}`);
      console.log(`   Email: ${EMAIL_BOOTSTRAP}`);
      console.log(`\n📋 Instrucciones:`);
      console.log(`   1. Inicia sesión con DNI: ${DNI_BOOTSTRAP}`);
      console.log(`   2. Ve a Configuración > Gestión de Super Admin`);
      console.log(`   3. Cede el control al dueño del sistema con sus datos`);
      console.log(`\n⚠️  Una vez cedido, el desarrollador NO podrá volver a iniciar sesión`);
    } else {
      console.log(`\nℹ️  Super admin bootstrap ya existe con DNI: ${DNI_BOOTSTRAP}`);
      console.log(`   Estado anterior: ${existingPersona.usuario?.estado ? 'Activo' : 'Inactivo'}`);
      
      // Si está deshabilitado, reactivarlo y recrear el rol SUPER_ADMIN
      if (!existingPersona.usuario?.estado) {
        console.log(`\n🔄 Reactivando cuenta del desarrollador...`);
        
        // Actualizar contraseña y reactivar
        const hashedPassword = await bcrypt.hash(PASSWORD_BOOTSTRAP, 10);
        
        await prisma.usuario.update({
          where: { idUsuario: existingPersona.usuario!.idUsuario },
          data: {
            passwordHash: hashedPassword,
            estado: true,
            defaultPassword: true
          }
        });

        // Eliminar roles anteriores si existen
        await prisma.usuarioRol.deleteMany({
          where: { idUsuario: existingPersona.usuario!.idUsuario }
        });

        // Asignar rol SUPER_ADMIN nuevamente
        await prisma.usuarioRol.create({
          data: {
            idUsuario: existingPersona.usuario!.idUsuario,
            idRol: rolesMap['SUPER_ADMIN']
          }
        });

        console.log(`✅ Cuenta reactivada exitosamente`);
        console.log(`\n🔐 Datos de acceso:`);
        console.log(`   DNI: ${DNI_BOOTSTRAP}`);
        console.log(`   Contraseña: ${PASSWORD_BOOTSTRAP}`);
        console.log(`   Email: ${EMAIL_BOOTSTRAP}`);
      } else {
        console.log(`   Estado actual: Activo`);
        console.log(`\n   La cuenta ya está activa y configurada`);
      }
    }

  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
