import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Opciones normales */
  serverExternalPackages: ["better-sqlite3"],

  // @ts-ignore - Forzamos la desactivación de Turbo aunque el tipo proteste
  turbo: {
    enabled: false,
  },
};

export default nextConfig;
