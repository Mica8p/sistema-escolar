import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const prismaClientSingleton = () => {
  // En producción usa DATABASE_URL con pgbouncer (Transaction mode puerto 6432)
  // En desarrollo usa DIRECT_URL para evitar problemas de pooling
  const isProduction = process.env.NODE_ENV === "production";
  const connectionString = isProduction 
    ? process.env.DATABASE_URL 
    : process.env.DIRECT_URL || process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    // Para 200-300 usuarios simultáneos con Transaction mode
    max: isProduction ? 100 : 50,
    min: isProduction ? 15 : 5,
    idleTimeoutMillis: isProduction ? 5000 : 10000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 30000, // Timeout para queries largas
    query_timeout: 30000,
  });

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === "development" 
      ? ["warn", "error"] 
      : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;