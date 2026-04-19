import React from "react";
import { KeyRound, Shield, Info, Users, Calendar } from "lucide-react";
import AvatarEditor from "./AvatarEditor";
import ChangePasswordSection from "./ChangePasswordSection";
import EditPersonalDataSection from "./EditPersonalDataSection";

type HijoInfo = {
  relacion: string;
  alumno: {
    idPersona: number;
    avatarUrl: string | null;

    nombre: string;
    apellido: string;
    legajo: string;
    matriculaActual?: {
      cicloAnio: number;
      curso: {
        grado: string;
        seccion: string;
        nivel: string;
        turno: string;
      };
      estadoAcademico: string | undefined;
    } | null | undefined;
  };
};

type DocenteInfo = {
  fechaIngreso: Date | string;
  asignacionesActivas: Array<{
    materia: string;
    cargaHoraria: number;
    curso: {
      grado: string;
      seccion: string;
      nivel: string;
      turno: string;
    };
    horarios?: Array<{
      diaSemana: string;
      horaInicio: string;
      horaFin: string;
      aula?: string | null;
    }>;
  }>;
};

type AdminStats = {
  pagosRegistrados?: number;
  movimientosStock?: number;
  comunicados?: number;
  gastos?: number;
};

type PerfilData = {
  idPersona: number;
  avatarUrl: string | null;

  nombre: string;
  apellido: string;
  dni: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: boolean;
  createdAt: Date | string;
  roles: string[];

  padre?: {
    hijos: HijoInfo[];
  } | null;

  docente?: DocenteInfo | null;

  adminStats?: AdminStats | null;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR");
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">
        {value !== null && value !== undefined && String(value).trim() !== ""
          ? String(value)
          : "—"}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
          {icon}
        </div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function CursoBadge({
  curso,
  cicloAnio,
}: {
  curso: { grado: string; seccion: string; nivel: string; turno: string };
  cicloAnio: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold">
        {curso.grado}° {curso.seccion}
      </span>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
        {curso.nivel}
      </span>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
        {curso.turno}
      </span>
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
        Ciclo {cicloAnio}
      </span>
    </div>
  );
}

export default function PerfilView({ perfil }: { perfil: PerfilData }) {
  const nombreCompleto = `${perfil.nombre} ${perfil.apellido}`;

  const esPadre = perfil.roles.includes("PADRE");
  const esDocente = perfil.roles.includes("DOCENTE");
  const esAdmin = perfil.roles.includes("ADMIN");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>

          {!esAdmin && (
            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm">
              <Info size={16} className="mt-0.5 text-slate-600" />
              <span>
                <b>Importante:</b> Si detectas algún error en tus datos personales, por favor comunícate con administración para que realicen los cambios necesarios.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card superior (avatar grande + nombre/email) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-start">
          <AvatarEditor
            idPersona={perfil.idPersona}
            nombre={perfil.nombre}
            apellido={perfil.apellido}
            avatarUrl={perfil.avatarUrl}
            canEdit={true}
            size={152} 
          />

          <div className="min-w-0 pt-1">
            <p className="text-xl font-bold text-slate-900">{nombreCompleto}</p>
            <p className="truncate text-sm text-slate-500">
              {perfil.email || "—"}
            </p>

            {/* Mini info extra */}
            <div className="mt-2 flex flex-wrap gap-2">
              {perfil.roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Shield size={18} className="text-slate-700" />
          <span className="text-xs font-medium text-slate-700">Cuenta</span>
        </div>
      </div>

      {/* Datos personales */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Datos personales
          </h2>
          <span className="text-xs font-medium text-slate-700">
            Estado: {perfil.estado ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="DNI" value={perfil.dni} />
          <Field label="Nombre" value={perfil.nombre} />
          <Field label="Apellido" value={perfil.apellido} />
          <Field label="Email" value={perfil.email ?? "—"} />
          <Field label="Teléfono" value={perfil.telefono ?? "—"} />
          <Field label="Dirección" value={perfil.direccion ?? "—"} />
        </div>

        <div className="mt-4 text-xs font-medium text-slate-700">
          Creado: {formatDateTime(perfil.createdAt)}
        </div>

        {/* Editar datos personales */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <EditPersonalDataSection
            nombre={perfil.nombre}
            apellido={perfil.apellido}
            email={perfil.email}
            telefono={perfil.telefono}
            direccion={perfil.direccion}
          />
        </div>

        {/* Cambiar contraseña */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <KeyRound size={16} />
            Cambiar contraseña
          </h3>
          <ChangePasswordSection />
        </div>
      </div>

      {/* PADRE */}
      {esPadre && perfil.padre && (
        <SectionCard
          title="Hijo(s)"
          icon={<Users size={16} className="text-slate-700" />}
        >
          {perfil.padre.hijos?.length ? (
            <div className="space-y-3">
              {perfil.padre.hijos.map((h, idx) => {
                const hNombre = `${h.alumno.nombre} ${h.alumno.apellido}`;

                return (
                  <div
                    key={`${h.alumno.legajo}-${idx}`}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                        <AvatarEditor
                          idPersona={h.alumno.idPersona}
                          nombre={h.alumno.nombre}
                          apellido={h.alumno.apellido}
                          avatarUrl={h.alumno.avatarUrl}
                          canEdit={true}
                          size={112}
                        />

                        <div className="pt-1">
                          <p className="text-sm font-bold text-slate-900">
                            {hNombre}
                          </p>
                          <p className="text-xs font-medium text-slate-600">
                            Relación: {h.relacion || "—"} • Legajo:{" "}
                            {h.alumno.legajo}
                          </p>

                          {h.alumno.matriculaActual ? (
                            <div className="mt-2">
                              <CursoBadge
                                curso={h.alumno.matriculaActual.curso}
                                cicloAnio={h.alumno.matriculaActual.cicloAnio}
                              />
                            </div>
                          ) : (
                            <span className="mt-2 inline-block text-xs font-medium text-slate-600">
                              Sin matrícula activa
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {h.alumno.matriculaActual?.estadoAcademico && (
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Field
                          label="Estado académico"
                          value={h.alumno.matriculaActual.estadoAcademico}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-700">
              No hay alumnos asociados.
            </div>
          )}
        </SectionCard>
      )}

      {/* DOCENTE */}
      {esDocente && perfil.docente && (
        <SectionCard
          title="Información docente"
          icon={<Calendar size={16} className="text-slate-700" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Fecha de ingreso"
              value={formatDate(perfil.docente.fechaIngreso)}
            />
            <Field
              label="Asignaciones activas"
              value={perfil.docente.asignacionesActivas.length}
            />
          </div>

          <div className="mt-4 space-y-3">
            {perfil.docente.asignacionesActivas.length ? (
              perfil.docente.asignacionesActivas.map((a, i) => (
                <div
                  key={`${a.materia}-${i}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="text-sm font-bold text-slate-900">{a.materia}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold">
                      {a.curso.grado}° {a.curso.seccion}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {a.curso.nivel}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {a.curso.turno}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                      {a.cargaHoraria} hs
                    </span>
                  </div>

                  {!!a.horarios?.length && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">
                        Horarios
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {a.horarios.map((h, idx) => (
                          <span
                            key={`${h.diaSemana}-${idx}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {h.diaSemana} {h.horaInicio}-{h.horaFin}
                            {h.aula ? ` • Aula ${h.aula}` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm font-medium text-slate-700">
                No tenés asignaciones activas en este momento.
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* ADMIN */}
      {esAdmin && perfil.adminStats && (
        <SectionCard
          title="Resumen de actividad"
          icon={<Shield size={16} className="text-slate-700" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Pagos registrados"
              value={perfil.adminStats.pagosRegistrados ?? 0}
            />
            <Field
              label="Movimientos de stock"
              value={perfil.adminStats.movimientosStock ?? 0}
            />
            <Field
              label="Comunicados"
              value={perfil.adminStats.comunicados ?? 0}
            />
            <Field label="Gastos" value={perfil.adminStats.gastos ?? 0} />
          </div>
        </SectionCard>
      )}
    </div>
  );
}
