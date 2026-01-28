import db from "@/lib/db";

export async function getDashboardAdminData() {
  const [alumnos, docentes, cursos, comunicados] = await Promise.all([
    db.alumno.count(),
    db.profesor.count(),
    db.curso.count(),
    db.comunicado.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          include: { persona: true }
        }
      }
    })
  ]);

  return { alumnos, docentes, cursos, comunicadosRecientes: comunicados };
}