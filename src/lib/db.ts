import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prismaClientSingleton = () => {
  // Usamos el objeto de configuración que el adaptador espera (BetterSQLite3InputParams)
  const adapter = new PrismaBetterSqlite3({
    url: "file:./prisma/dev.db",
  });

  return new PrismaClient({ adapter });
};

declare global {
  // Esto previene múltiples instancias de Prisma en desarrollo durante el Hot Reload
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;