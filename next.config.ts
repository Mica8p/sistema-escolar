import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Opciones normales */
  serverExternalPackages: ["better-sqlite3"],
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
