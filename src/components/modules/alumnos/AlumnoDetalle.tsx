"use client";

import { useState, useTransition } from "react";
import { EstadoAcademico } from "@prisma/client";
import { cambiarEstadoMatriculaAction, vincularPadre, desvincularPadre } from "@/lib/actions/alumno-actions";
import { getTutoresDisponiblesAction } from "@/lib/actions/persona-actions";
import { 
  User, Calendar, MapPin, Phone, Mail, 
  GraduationCap, AlertTriangle, CheckCircle2, 
  FileText, ArrowLeft, Ban, RotateCcw,
  Users, Plus, Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AlumnoDetalleProps {
  alumno: any; // Usamos any por simplicidad, idealmente sería el tipo completo de Prisma
}

export default function AlumnoDetalle({ alumno }: AlumnoDetalleProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  // Tomamos la matrícula más reciente (la del ciclo actual)
  const matriculaActual = alumno.matriculas[0];
  const estadoActual = matriculaActual?.estadoAcademico;

  // Estados para vinculación de tutores
  const [showVincular, setShowVincular] = useState(false);
  const [tutoresDisponibles, setTutoresDisponibles] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [relacion, setRelacion] = useState("Padre/Madre");

  const handleOpenVincular = async () => {
    const tutores = await getTutoresDisponiblesAction(alumno.idAlumno);
    setTutoresDisponibles(tutores);
    setShowVincular(true);
  };

  const handleVincular = () => {
    if (!selectedTutor) return;
    startTransition(async () => {
      const res = await vincularPadre(alumno.idAlumno, Number(selectedTutor), relacion);
      if (res.success) {
        setShowVincular(false);
        setSelectedTutor("");
      } else {
        alert(res.message);
      }
    });
  };

  const handleDesvincular = (idPadre: number) => {
    if(!confirm("¿Desvincular a este tutor?")) return;
    startTransition(async () => {
      await desvincularPadre(alumno.idAlumno, idPadre);
    });
  };

  const handleCambioEstado = (nuevoEstado: EstadoAcademico) => {
    if (!matriculaActual) return;
    
    const confirmacion = confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`);
    if (!confirmacion) return;

    startTransition(async () => {
      const res = await cambiarEstadoMatriculaAction(
        matriculaActual.idMatricula, 
        nuevoEstado, 
        `/dashboard/alumnos/${alumno.idAlumno}`
      );
      if (!res.success) {
        alert(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Navegación */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/alumnos" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {alumno.persona.apellido}, {alumno.persona.nombre}
          </h1>
          <p className="text-slate-500 flex items-center gap-2 text-sm">
            <FileText size={14} /> Legajo: {alumno.legajo}
          </p>
        </div>
        <div className="ml-auto">
          <EstadoBadge estado={estadoActual} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Datos Personales */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Datos Personales
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <FileText size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">DNI</p>
                  <p className="font-medium text-slate-900">{alumno.persona.dni}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Fecha de Nacimiento</p>
                  <p className="font-medium text-slate-900">
                    {new Date(alumno.fechaNacimiento).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Email</p>
                  <p className="font-medium text-slate-900">{alumno.persona.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Teléfono</p>
                  <p className="font-medium text-slate-900">{alumno.persona.telefono || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-500 text-xs">Dirección</p>
                  <p className="font-medium text-slate-900">{alumno.persona.direccion || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Central: Información Académica */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta de Estado y Acciones */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap size={18} className="text-blue-600" /> Situación Académica
              </h3>
            </div>

            {matriculaActual ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                <p className="text-sm text-slate-600 mb-1">Curso Actual:</p>
                <p className="text-lg font-bold text-slate-900">
                  {matriculaActual.curso.grado} "{matriculaActual.curso.seccion}" - {matriculaActual.curso.nivel}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Inscrito el {new Date(matriculaActual.fechaInscripcion).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-6 text-sm">
                Este alumno no está inscrito en el ciclo lectivo actual.
              </div>
            )}

            {/* Botonera de Gestión de Ciclo de Vida */}
            {matriculaActual && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                {estadoActual === "Activo" && (
                  <>
                    <button 
                      onClick={() => handleCambioEstado(EstadoAcademico.Baja)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium transition-colors"
                    >
                      <Ban size={16} /> Dar de Baja
                    </button>
                    <button 
                      onClick={() => handleCambioEstado(EstadoAcademico.Egresado)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 text-sm font-medium transition-colors"
                    >
                      <GraduationCap size={16} /> Marcar como Egresado
                    </button>
                  </>
                )}

                {(estadoActual === "Baja" || estadoActual === "Egresado") && (
                  <button 
                    onClick={() => handleCambioEstado(EstadoAcademico.Activo)}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 text-sm font-medium transition-colors"
                  >
                    <RotateCcw size={16} /> Reincorporar / Activar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sección de Tutores / Grupo Familiar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-blue-600" /> Grupo Familiar / Tutores
              </h3>
              <button 
                onClick={handleOpenVincular}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Plus size={16} /> Vincular
              </button>
            </div>

            <div className="space-y-3">
              {alumno.padres.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No hay tutores vinculados.</p>
              ) : (
                alumno.padres.map((rel: any) => (
                  <div key={rel.padre.idPadre} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">
                        {rel.padre.persona.apellido}, {rel.padre.persona.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rel.relacion} • {rel.padre.persona.dni} • {rel.padre.persona.telefono || "Sin tel"}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDesvincular(rel.padre.idPadre)}
                      disabled={isPending}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                      title="Desvincular"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Formulario simple de vinculación */}
            {showVincular && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Vincular Nuevo Tutor</h4>
                <div className="space-y-3">
                  <select 
                    className="w-full p-2 text-sm border border-blue-200 rounded bg-white text-slate-900"
                    value={selectedTutor}
                    onChange={(e) => setSelectedTutor(e.target.value)}
                  >
                    <option value="">-- Seleccionar Persona --</option>
                    {tutoresDisponibles.map((t) => (
                      <option key={t.idPersona} value={t.idPersona}>
                        {t.apellido}, {t.nombre} ({t.dni})
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="w-full p-2 text-sm border border-blue-200 rounded bg-white text-slate-900"
                    value={relacion}
                    onChange={(e) => setRelacion(e.target.value)}
                  >
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Familiar">Familiar</option>
                  </select>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setShowVincular(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleVincular}
                      disabled={!selectedTutor || isPending}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado?: string }) {
  if (estado === "Activo") {
    return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold border border-emerald-200 flex items-center gap-1"><CheckCircle2 size={14}/> Regular</span>;
  }
  if (estado === "Baja") {
    return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold border border-red-200 flex items-center gap-1"><Ban size={14}/> Baja</span>;
  }
  if (estado === "Egresado") {
    return <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-200 flex items-center gap-1"><GraduationCap size={14}/> Egresado</span>;
  }
  return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold border border-slate-200">Sin Estado</span>;
}