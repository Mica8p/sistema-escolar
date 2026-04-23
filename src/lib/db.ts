import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  // En desarrollo: DIRECT_URL (sin pgbouncer)
  // En producción: DATABASE_URL (con pgbouncer Transaction mode)
  const isProduction = process.env.NODE_ENV === "production";
  const connectionString = isProduction 
    ? process.env.DATABASE_URL 
    : (process.env.DIRECT_URL || process.env.DATABASE_URL);

  const pool = new Pool({
    connectionString,
    max: isProduction ? 100 : 50,  // Desarrollo: 50 (con DIRECT_URL es seguro)
    min: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000,
  });

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ 
    adapter,
    log: [],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;