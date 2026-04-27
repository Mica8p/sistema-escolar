import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("🔍 Consultando materias con notas en DICIEMBRE, FEBRERO y JULIO_PREVIAS...\n");

    const result = await prisma.$queryRaw`
      SELECT DISTINCT 
        m."nombre" AS materia,
        pa."nombre" AS periodo,
        COUNT(DISTINCT n."idNota") AS cantidad_notas,
        COUNT(DISTINCT n."idMatricula") AS cantidad_alumnos
      FROM "NOTA" n
      JOIN "ASIGNACION_ACADEMICA" aa ON n."idAsignacion" = aa."idAsignacion"
      JOIN "MATERIA" m ON aa."idMateria" = m."idMateria"
      JOIN "PERIODO_ACADEMICO" pa ON n."idPeriodo" = pa."idPeriodo"
      WHERE pa."nombre" IN ('DICIEMBRE', 'FEBRERO', 'JULIO_PREVIAS')
      GROUP BY m."nombre", pa."nombre"
      ORDER BY pa."nombre", m."nombre"
    `;

    console.log("📊 Resultados:\n");
    if (Array.isArray(result) && result.length > 0) {
      const grouped: Record<string, any[]> = {};
      
      (result as any[]).forEach(row => {
        if (!grouped[row.periodo]) {
          grouped[row.periodo] = [];
        }
        grouped[row.periodo].push(row);
      });

      for (const [periodo, materias] of Object.entries(grouped)) {
        console.log(`\n📅 ${periodo}:`);
        (materias as any[]).forEach(m => {
          console.log(
            `   • ${m.materia}: ${m.cantidad_alumnos} alumnos, ${m.cantidad_notas} notas`
          );
        });
      }

      console.log("\n✅ Resumen por período:");
      for (const [periodo, materias] of Object.entries(grouped)) {
        const totalAlumnos = (materias as any[]).reduce((sum, m) => sum + parseInt(m.cantidad_alumnos), 0);
        console.log(`   • ${periodo}: ${(materias as any[]).length} materias con ${totalAlumnos} registros de alumnos`);
      }
    } else {
      console.log("❌ No se encontraron notas en esos períodos.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
