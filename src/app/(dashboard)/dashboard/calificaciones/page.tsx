import Link from "next/link";
import { auth } from "@/auth";
import { TipoEvaluacion } from "@prisma/client";
import {
  getAsignacionesParaUsuario,
  getPeriodosByCiclo,
  getPlanilla,
} from "@/service/calificaciones.service";
import CalificacionesTable from "@/components/modules/calificaciones/CalificacionesForm";

const TIPOS: TipoEvaluacion[] = ["Parcial", "Final", "Recuperatorio"];

export default async function CalificacionesPage({
  searchParams,
}: {
  searchParams?: { asig?: string; periodo?: string; tipo?: string };
}) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");

  const isAdmin = session.user.roles.includes("ADMIN");
  const idPersona = session.user.idPersona ?? 0;

  const asignaciones = await getAsignacionesParaUsuario({ isAdmin, idPersona });

  // defaults “inteligentes”
  const defaultAsig = asignaciones[0]?.idAsignacion;
  const idAsignacion = Number(searchParams?.asig ?? defaultAsig);

  const asigElegida = asignaciones.find((a) => a.idAsignacion === idAsignacion);

  const periodos = asigElegida ? await getPeriodosByCiclo(asigElegida.idCiclo) : [];
  const defaultPeriodo = periodos[0]?.idPeriodo;
  const idPeriodo = Number(searchParams?.periodo ?? defaultPeriodo);

  const tipo = (searchParams?.tipo as TipoEvaluacion) ?? "Parcial";
  const tipoValido = TIPOS.includes(tipo) ? tipo : "Parcial";

  const planilla =
    asigElegida && idPeriodo
      ? await getPlanilla({ idAsignacion, idPeriodo, tipo: tipoValido })
      : null;

  // helper para armar links con querystring
  const qs = (next: Partial<{ asig: number; periodo: number; tipo: TipoEvaluacion }>) => {
    const p = new URLSearchParams();
    p.set("asig", String(next.asig ?? idAsignacion));
    p.set("periodo", String(next.periodo ?? idPeriodo));
    p.set("tipo", String(next.tipo ?? tipoValido));
    return `?${p.toString()}`;
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calificaciones</h1>
        <div className="text-sm text-gray-600">
          Rol: <span className="font-medium">{isAdmin ? "ADMIN" : "DOCENTE"}</span>
        </div>
      </div>

      {/* Filtros (MVP): botones/link para evitar client state */}
      <div className="border rounded p-4 space-y-3">
        <div className="grid md:grid-cols-3 gap-3">
          {/* ASIGNACIÓN */}
          <div>
            <div className="text-sm font-medium mb-1">Asignación (Curso + Materia + Ciclo)</div>
            <div className="flex flex-col gap-2">
              {asignaciones.length === 0 ? (
                <p className="text-sm text-gray-500">No tenés asignaciones.</p>
              ) : (
                asignaciones.map((a) => (
                  <Link
                    key={a.idAsignacion}
                    href={qs({ asig: a.idAsignacion, periodo: undefined })}
                    className={`px-3 py-2 rounded border text-sm hover:bg-gray-50 ${
                      a.idAsignacion === idAsignacion ? "bg-gray-100 border-gray-400" : ""
                    }`}
                  >
                    <div className="font-medium">
                      {a.curso.grado} {a.curso.seccion} • {a.materia.nombre}
                    </div>
                    <div className="text-xs text-gray-600">
                      Ciclo {a.ciclo.anio} • Asig #{a.idAsignacion}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* PERIODO */}
          <div>
            <div className="text-sm font-medium mb-1">Periodo</div>
            <div className="flex flex-col gap-2">
              {periodos.length === 0 ? (
                <p className="text-sm text-gray-500">Elegí una asignación.</p>
              ) : (
                periodos.map((p) => (
                  <Link
                    key={p.idPeriodo}
                    href={qs({ periodo: p.idPeriodo })}
                    className={`px-3 py-2 rounded border text-sm hover:bg-gray-50 ${
                      p.idPeriodo === idPeriodo ? "bg-gray-100 border-gray-400" : ""
                    }`}
                  >
                    <div className="font-medium">{p.nombre}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(p.fechaInicio).toLocaleDateString()} —{" "}
                      {new Date(p.fechaFin).toLocaleDateString()}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* TIPO */}
          <div>
            <div className="text-sm font-medium mb-1">Tipo de evaluación</div>
            <div className="flex gap-2 flex-wrap">
              {TIPOS.map((t) => (
                <Link
                  key={t}
                  href={qs({ tipo: t })}
                  className={`px-3 py-2 rounded border text-sm hover:bg-gray-50 ${
                    t === tipoValido ? "bg-gray-100 border-gray-400" : ""
                  }`}
                >
                  {t}
                </Link>
              ))}
            </div>

            {asigElegida && (
              <div className="mt-3 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Curso:</span> {asigElegida.curso.grado}{" "}
                  {asigElegida.curso.seccion} ({asigElegida.curso.nivel})
                </div>
                <div>
                  <span className="font-medium">Materia:</span> {asigElegida.materia.nombre}
                </div>
                <div>
                  <span className="font-medium">Ciclo:</span> {asigElegida.ciclo.anio}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla */}
      {planilla ? (
        <CalificacionesTable
          idAsignacion={idAsignacion}
          idPeriodo={idPeriodo}
          tipo={tipoValido}
          matriculas={planilla.matriculas}
          notaByMatricula={Array.from(planilla.notaByMatricula.entries())}
        />
      ) : (
        <div className="text-sm text-gray-600">
          Seleccioná una asignación y un periodo para ver la planilla.
        </div>
      )}
    </div>
  );
}
