import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getCicloActual } from "@/lib/ciclo-session";
import { getHijosConAsistenciaCompleta } from "@/service/padre.service";
import { getCalificacionesHijo } from "@/service/calificaciones.service";
import { getContadorNoLeidos } from "@/service/comunicado.service";
import CardAsistenciaHijo from "@/components/modules/padres/CardAsistenciaHijo";
import SeccionCalificaciones from "@/components/modules/padres/SeccionCalificaciones";
import { getDashboardAdminData } from "@/service/admin-dashboard.service";
import { getDetalleCuenta } from "@/service/finanzas.service";

import {
  Sparkles,
  Users,
  Calendar,
  Wallet,
  ClipboardList,
  UserCheck,
  GraduationCap,
  Plus,
  Megaphone,
} from "lucide-react";

import {
  getClasesDeHoyDocente,
  getAsistenciasPendientesDocente,
  getNotasRecientesDocente,
  getProximosCierresDocente,
} from "@/service/profesor-dashboard.service";
import { getHorariosPorCurso } from "@/service/horario.service";
import GrillaSemanal from "@/components/modules/horarios/GrillaSemanal";
import db from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const roles = session.user.roles ?? [];
  const idPersona = session.user.idPersona;
  const idUsuario = session.user.idUsuario;

  const esDocente = roles.includes("DOCENTE");
  const esPadre = roles.includes("PADRE");
  const esAdmin = roles.includes("ADMIN");

   const idCiclo = await getCicloActual();
  const adminData = esAdmin ? await getDashboardAdminData(idCiclo) : null;
  const idProfesor = session.user.idProfesor ?? null;




  /**
   * ==========================
   * LÓGICA DE COMUNICADOS (Dinámica)
   * ==========================
   */
  const rolPrincipal = roles[0] || "USUARIO";
  let idsCursosHijos: number[] = [];

  if (esPadre && idPersona) {
  const relaciones = await db.alumnoPadre.findMany({
    where: { idPadre: (session.user as any).idPadre },
    include: {
      alumno: {
        include: {
          matriculas: {
            where: { estadoAcademico: "Activo" },
            select: { idCurso: true }
          }
        }
      }
    }
  });
  idsCursosHijos = relaciones.flatMap(r => r.alumno.matriculas.map(m => m.idCurso));
}


const noLeidos = idUsuario
  ? await getContadorNoLeidos(idUsuario, rolPrincipal, idsCursosHijos)
  : 0;

  /**
   * ==========================
   * DATA PADRE (solo si corresponde)
   * ==========================
   */


let hijosData: any[] = [];
let totalDeudaFamilia = 0;


if (esPadre && idPersona && idCiclo) {
  const rawHijos = await getHijosConAsistenciaCompleta(idPersona, idCiclo);

  hijosData = await Promise.all(
    rawHijos.map(async (hijo: any) => {
      const matricula = await db.matricula.findFirst({
        where: {
          idAlumno: hijo.idAlumno,
          idCiclo: idCiclo
        },
        select: { idCurso: true }
      });

      const idCursoReal = matricula?.idCurso;

      const [notas, horarios, cuenta] = await Promise.all([
        getCalificacionesHijo(hijo.idAlumno, idCiclo),
        idCursoReal ? getHorariosPorCurso(idCursoReal, idCiclo) : [],
        getDetalleCuenta(hijo.idAlumno) // ✅ FALTABA ESTA LÍNEA AQUÍ
      ]);

      const deudaHijo = cuenta.cargos.reduce((acc: number, cargo: any) => acc + (cargo.saldo || 0), 0);

      totalDeudaFamilia += deudaHijo;

      return { ...hijo, notas, horarios, deudaHijo, cuenta };
    })
  );
}

  /**
   * ==========================
   * DATA DOCENTE (solo si corresponde)
   * ==========================
   */
  const docenteData =
    esDocente && idProfesor ? await getDashboardDocenteData(idProfesor) : null;


  return (
    <div className="p-8 bg-slate-50/50 min-h-screen space-y-5">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Sparkles size={160} className="text-indigo-600" />
        </div>

        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
            ¡Hola, {session.user.name?.split(" ")[0]}!
          </h1>

          <p className="text-slate-500 font-medium italic">
            {esDocente
              ? "Aquí tienes tu panel docente para gestionar clases, asistencias y calificaciones."
              : esPadre
              ? "Aquí tienes el resumen escolar de tu familia para el ciclo actual."
              : "Este es el panel de control institucional de Escuela Pro."}
          </p>
        </div>
      </div>

      {/* ==========================
          PRIORIDAD DE VISTAS:
          DOCENTE -> PADRE -> ADMIN
         ========================== */}

      {/* 1) DOCENTE */}
      {esDocente ? (
        !idProfesor ? (
          <div className="p-10 bg-white rounded-3xl border border-slate-200">
            <p className="text-slate-600 font-semibold">
              Tu usuario tiene rol DOCENTE pero no tiene un profesor asociado (idProfesor).
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={<Calendar size={24} />}
                title="Clases de hoy"
                value={docenteData?.clasesHoy.length ?? 0}
                color="indigo"
              />
              <StatCard
                icon={<UserCheck size={24} />}
                title="Asistencias pendientes"
                value={docenteData?.pendientes.length ?? 0}
                color="emerald"
              />
              <StatCard
                icon={<ClipboardList size={24} />}
                title="Notas recientes"
                value={docenteData?.notasRecientes.length ?? 0}
                color="blue"
              />
              <StatCard
                icon={<GraduationCap size={24} />}
                title="Próximos cierres"
                value={docenteData?.cierres.length ?? 0}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="Clases de hoy">
                {docenteData?.clasesHoy.length ? (
                  <ul className="space-y-2">
                    {docenteData.clasesHoy.map((h) => (
                      <li
                        key={h.idHorario}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="font-black text-slate-800">
                          {h.horaInicio} - {h.horaFin}{" "}
                          {h.aula ? `· Aula ${h.aula}` : ""}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          {h.asignacion.materia.nombre} ·{" "}
                          {h.asignacion.curso.grado}{" "}
                          {h.asignacion.curso.seccion} ·{" "}
                          {h.asignacion.ciclo.anio}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text="No tenés clases hoy." />
                )}
              </Panel>

              <Panel title="Asistencias pendientes (hoy)">
                {docenteData?.pendientes.length ? (
                  <ul className="space-y-2">
                    {docenteData.pendientes.map((p) => (
                      <li
                        key={p.horario.idHorario}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-black text-slate-800">
                              {p.horario.horaInicio} - {p.horario.horaFin}
                            </div>
                            <div className="text-sm text-slate-500 font-medium">
                              {p.horario.asignacion.materia.nombre} ·{" "}
                              {p.horario.asignacion.curso.grado}{" "}
                              {p.horario.asignacion.curso.seccion}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-black text-slate-800">
                              {p.faltan} faltan
                            </div>
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                              {p.asistenciasCargadas}/{p.totalAlumnos}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text="No tenés asistencias pendientes hoy." />
                )}
              </Panel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="Notas cargadas recientemente">
                {docenteData?.notasRecientes.length ? (
                  <ul className="space-y-2">
                    {docenteData.notasRecientes.map((n) => {
                      const persona = n.matricula.alumno.persona;
                      return (
                        <li
                          key={n.idNota}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-black text-slate-800">
                                {persona.apellido}, {persona.nombre} ·{" "}
                                {n.asignacion.materia.nombre}
                              </div>
                              <div className="text-sm text-slate-500 font-medium">
                                {n.asignacion.curso.grado}{" "}
                                {n.asignacion.curso.seccion} · {n.tipo} ·{" "}
                                {n.periodo.nombre}
                              </div>
                            </div>
                            <div className="text-3xl font-black text-slate-800">
                              {n.nota}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Empty text="Todavía no cargaste notas." />
                )}
              </Panel>

              <Panel title="Próximos cierres">
                {docenteData?.cierres.length ? (
                  <ul className="space-y-2">
                    {docenteData.cierres.map((p) => (
                      <li
                        key={p.idPeriodo}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="font-black text-slate-800">
                          {p.nombre}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          Ciclo {p.ciclo.anio} · {formatDate(p.fechaInicio)} →{" "}
                          {formatDate(p.fechaFin)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text="No hay cierres próximos cargados." />
                )}
              </Panel>
            </div>
          </div>
        )
      ) : esPadre ? (
        /* 2) PADRE  */
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-700 uppercase tracking-widest px-2 flex items-center gap-3">
            <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-white" />
            </span>
            Seguimiento de mis Hijos
          </h2>

          {hijosData.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
              <div className="flex justify-center mb-4">
                <Users size={48} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                No se encontraron hijos asociados o matriculados en el ciclo actual.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* TARJETA DINÁMICA DE COMUNICADOS */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between overflow-hidden relative">
                  <div className="relative z-10">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter">
                      ¡Información del día!
                    </h1>
                    <p className="text-slate-500 font-medium italic mt-1">
                      {noLeidos > 0
                        ? `Tienes ${noLeidos} ${noLeidos === 1 ? 'comunicado' : 'comunicados'} sin leer de la institución.`
                        : "Estás al día con todas las novedades institucionales."
                      }
                    </p>
                  </div>

                  <Link href="/dashboard/comunicados">
                    <button className="relative z-10 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                      Leer comunicados
                      {noLeidos > 0 && (
                        <span className="bg-white text-indigo-600 w-5 h-5 rounded-full text-[10px] flex items-center justify-center animate-pulse">
                          {noLeidos}
                        </span>
                      )}
                    </button>
                  </Link>

                  <Sparkles
                    size={160}
                    className="absolute -right-10 -bottom-10 text-indigo-50 opacity-50"
                  />
                </div>

                <Link href="/dashboard/finanzas" className="group">
                  <div className={`p-8 rounded-[2.5rem] text-white flex flex-col justify-center transition-all h-full ${
                    totalDeudaFamilia > 0
                    ? 'bg-rose-600 shadow-lg shadow-rose-100 hover:bg-rose-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                  }`}>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-2">
                      Estado de Cuenta Familiar
                    </p>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-2xl font-black block">
                          {totalDeudaFamilia > 0 ? `-$${totalDeudaFamilia.toLocaleString()}` : 'Al día'}
                        </span>
                        <span className="text-[10px] font-medium opacity-70 italic">
                          {totalDeudaFamilia > 0 ? 'Tienes pagos pendientes' : 'Sin deudas registradas'}
                        </span>
                      </div>
                      <Wallet className={totalDeudaFamilia > 0 ? 'text-white/40' : 'text-slate-700'} size={32} />
                    </div>
                  </div>
                </Link>
              </div>

              {/* LISTADO DE HIJOS */}
              <div className="space-y-16">
                {hijosData.map((hijo) => (
                  <div
                    key={hijo.idAlumno}
                    className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden"
                  >
                    <div className="bg-slate-900 p-8 flex items-center gap-6">
                      <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-2xl">
                        {hijo.nombreCompleto?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tighter">
                          {hijo.nombreCompleto}
                        </h3>
                        <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">
                          {hijo.curso} • Escuela Pro 2026
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-10 bg-slate-50/20 items-stretch">
                      <div className="lg:col-span-5">
                        <CardAsistenciaHijo hijoData={hijo} />
                      </div>
                      <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-inner">
                        <SeccionCalificaciones notas={hijo.notas} />
                      </div>
                      <div className="lg:col-span-12 bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 shadow-inner mt-8">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                          <Calendar className="text-indigo-600 shrink-0" size={24} />
                          <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                            Horario de Clases
                          </h3>
                        </div>

                          <div className="w-full overflow-hidden rounded-2xl border border-slate-50 min-h-[300px">
                            <div className="overflow-x-auto custom-scrollbar">
                              {hijo.horarios && hijo.horarios.length > 0 ? (
                                <div className="w-full">
                                  <GrillaSemanal horarios={hijo.horarios} compact />
                                </div>
                              ) : (
                                <div className="p-10 text-center bg-slate-50/50">
                                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                                    No hay horarios cargados para este curso.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 3) ADMIN  */
        <div className="space-y-8">
    {/* MÉTRICAS PRINCIPALES */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard icon={<Users size={24} />} title="Alumnos" value={adminData?.alumnos ?? 0} color="blue" />
      <StatCard icon={<GraduationCap size={24} />} title="Docentes" value={adminData?.docentes ?? 0} color="purple" />
      <StatCard icon={<ClipboardList size={24} />} title="Cursos Activos" value={adminData?.cursos ?? 0} color="emerald" />
      <StatCard icon={<Megaphone size={24} />} title="Comunicados" value={adminData?.comunicadosRecientes.length ?? 0} color="indigo" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ACTIVIDAD RECIENTE */}
      <div className="lg:col-span-2">
        <Panel title="Últimos Comunicados Institucionales">
          <div className="space-y-4">
            {adminData?.comunicadosRecientes.map((c: any) => (
              <div key={c.idComunicado} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{c.titulo}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Por: {c.usuario.persona.nombre} {c.usuario.persona.apellido}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 italic">
                  {new Date(c.fecha).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Gestión Rápida</h3>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/dashboard/comunicados/nuevo" className="group p-4 bg-indigo-600 rounded-2xl flex items-center gap-4 hover:bg-indigo-700 transition-all">
            <div className="p-2 bg-white/20 rounded-xl text-white"><Plus size={20} /></div>
            <span className="text-white font-bold text-sm">Nuevo Comunicado</span>
          </Link>
          <Link href="/dashboard/alumnos" className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-500 transition-all">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Users size={20} /></div>
            <span className="text-slate-700 font-bold text-sm">Registrar Alumno</span>
          </Link>
          <Link href="/dashboard/finanzas" className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-emerald-500 transition-all">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-500"><Wallet size={20} /></div>
            <span className="text-slate-700 font-bold text-sm">Verificar Cobros</span>
          </Link>
        </div>
      </div>
    </div>
  </div>
      )}
    </div>
  );
}

async function getDashboardDocenteData(idProfesor: number) {
  const [clasesHoy, pendientes, notasRecientes, cierres] = await Promise.all([
    getClasesDeHoyDocente(idProfesor),
    getAsistenciasPendientesDocente(idProfesor),
    getNotasRecientesDocente(idProfesor, 8),
    getProximosCierresDocente(idProfesor, 5),
  ]);

  return { clasesHoy, pendientes, notasRecientes, cierres };
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: "indigo" | "emerald" | "blue" | "purple";
}) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        <h3 className="font-black text-slate-700 uppercase text-[10px] tracking-widest">
          {title}
        </h3>
      </div>
      <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 border-dashed">
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{text}</p>
    </div>
  );
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(d);
}
