

import db from "@/lib/db";

export async function getDashboardAdminData(idCiclo?: number) {
  const [alumnos, profesores, cursos, comunicados] = await Promise.all([
    db.matricula.count({ where: { idCiclo: idCiclo || undefined, estadoAcademico: "Activo" } }),
    db.profesor.count(),
    db.curso.count(),
    db.comunicado.findMany({
      where: {
        target: {
          in: ["TODOS", "PADRES", "DOCENTES"]
        }
      },
      take: 5,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: { include: { persona: { select: { nombre: true, apellido: true } } } }
      }
    })
  ]);

  return { alumnos, docentes: profesores, cursos, comunicadosRecientes: comunicados };
}