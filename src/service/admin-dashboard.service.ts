import db from "@/lib/db";

export async function getDashboardAdminData(idCiclo: number) {
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [alumnos, profesores, cursos, comunicados, pagosMes, morosidad] = await Promise.all([
    db.matricula.count({ where: { idCiclo, estadoAcademico: "Activo" } }),
    db.profesor.count(),
    db.curso.count({ where: { asignaciones: { some: { idCiclo } } } }),
    db.comunicado.findMany({
      where: { target: { in: ["TODOS", "PADRES", "DOCENTES"] } },
      take: 5,
      orderBy: { fecha: 'desc' },
      include: { usuario: { include: { persona: { select: { nombre: true, apellido: true } } } } }
    }),
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

  const niveles = ["Primario", "Secundario"];
  const asistenciaGlobal = await Promise.all(niveles.map(async (nivel: any) => {
    const total = await db.asistencia.count({ where: { matricula: { idCiclo, curso: { nivel } } } });
    const presentes = await db.asistencia.count({ where: { estado: "Presente", matricula: { idCiclo, curso: { nivel } } } });
    const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
    const colores: any = { Primario: '#10b981', Secundario: '#3b82f6' };
    return { nivel, porcentaje, color: colores[nivel] || '#cbd5e1' };
  }));

  const promedioAsis = asistenciaGlobal.length > 0
    ? Math.round(asistenciaGlobal.reduce((acc, n) => acc + n.porcentaje, 0) / asistenciaGlobal.length)
    : 0;

  return {
    alumnos,
    docentes: profesores,
    cursos,
    comunicadosRecientes: comunicados,
    asistenciaGlobal,
    promedioAsis,
    recaudacionMes: pagosMes._sum.montoTotal || 0,
    morosidadTotal: morosidad._sum.monto || 0,
    totalDeudores: morosidad._count.alumnoId || 0
  };
}