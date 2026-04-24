import db from "@/lib/db";
import { Nivel } from "@prisma/client";
import { getComunicadosRecibidos } from "./comunicado.service";

export async function getDashboardAdminData(idAdmin: number, idCiclo: number) {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [alumnos, profesores, cursos, comunicadosRecibidos, pagosMes, morosidad] = await Promise.all([
    db.matricula.count({ where: { idCiclo, estadoAcademico: "Activo" } }),
    db.profesor.count(),
    db.curso.count({ where: { asignaciones: { some: { idCiclo } } } }),
    getComunicadosRecibidos(idAdmin, "ADMIN", []).then(coms => coms.slice(0, 5)),
    db.pago.aggregate({
      where: { fechaPago: { gte: primerDiaMes } },
      _sum: { montoTotal: true }
    }),
    db.cargo.aggregate({
      where: { estado: { in: ["Pendiente", "Parcial"] } },
      _sum: { monto: true },
      _count: { alumnoId: true }
    })
  ]);

  const niveles: Nivel[] = ["Primario", "Secundario"];
  const asistenciaGlobal = await Promise.all(niveles.map(async (nivel) => {
    const total = await db.asistencia.count({ where: { matricula: { idCiclo, curso: { nivel: { equals: nivel } } } } });
    const presentes = await db.asistencia.count({ where: { estado: "Presente", matricula: { idCiclo, curso: { nivel: { equals: nivel } } } } });
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    const colores: Record<Nivel, string> = { Primario: '#10b981', Secundario: '#3b82f6' };
    return { nivel, porcentaje, color: colores[nivel] || '#cbd5e1' };
  }));

  const promedioAsis = asistenciaGlobal.length > 0
    ? Math.round(asistenciaGlobal.reduce((acc, n) => acc + n.porcentaje, 0) / asistenciaGlobal.length)
    : 0;

  return {
    alumnos,
    docentes: profesores,
    cursos,
    comunicadosRecientes: comunicadosRecibidos,
    asistenciaGlobal,
    promedioAsis,
    recaudacionMes: pagosMes._sum.montoTotal || 0,
    morosidadTotal: morosidad._sum.monto || 0,
    totalDeudores: morosidad._count.alumnoId || 0
  };
}