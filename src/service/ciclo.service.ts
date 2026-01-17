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
  },

  async getActive() {
    return await db.cicloLectivo.findFirst({
      where: { estado: true }
    });
  },

  // Obtener los periodos (trimestres) de un ciclo específico
  async getPeriodos(idCiclo: number) {
    return await db.periodoAcademico.findMany({
      where: { idCiclo },
      orderBy: { fechaInicio: "asc" }
    });
  }
};