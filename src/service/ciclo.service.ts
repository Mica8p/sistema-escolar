import db from "@/lib/db";

export const CicloService = {
  async getAll() {
    return await db.cicloLectivo.findMany({
      orderBy: { anio: "desc" }
    });
  },

  async getById(id: number) {
    return await db.cicloLectivo.findUnique({
      where: { idCiclo: id }
    });
  }
};