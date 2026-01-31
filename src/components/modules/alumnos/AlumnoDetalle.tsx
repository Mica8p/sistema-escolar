"use client";

import { useState, useTransition, useMemo } from "react";
import { EstadoAcademico } from "@prisma/client";
import { cambiarEstadoMatriculaAction, vincularPadre, desvincularPadre, updateMatriculaCursoAction } from "@/lib/actions/alumno-actions";
import { getTutoresDisponiblesAction } from "@/lib/actions/persona-actions";
import { getAllCursos } from "@/lib/actions/curso-actions";
import { 
  User, Calendar, MapPin, Phone, Mail, 
  GraduationCap, AlertTriangle, CheckCircle2, 
  FileText, ArrowLeft, Ban, RotateCcw,
  Users, Plus, Trash2, Pencil
} from "lucide-react";
import Link from "next/link";

interface AlumnoDetalleProps {
  alumno: any; 
  cicloId: number;
}

export default function AlumnoDetalle({ alumno, cicloId }: AlumnoDetalleProps) {
  const [isPending, startTransition] = useTransition();
  
  // SOLUCIÓN: Usamos useMemo para encontrar LA matrícula correcta para el ciclo actual.
  // Esto evita problemas si hay matrículas de otros ciclos en los datos del alumno.
  const matriculaActual = useMemo(() => {
    if (!Array.isArray(alumno.matriculas)) return null;
    // Buscamos la matrícula que coincide con el ID del ciclo lectivo actual Y está activa o en un estado manejable.
    // Damos prioridad a la más reciente si hubiera múltiples (caso anómalo).
    return alumno.matriculas.find((m: any) => m.idCiclo === cicloId) || alumno.matriculas[0] || null;
  }, [alumno.matriculas, cicloId]);

  const estadoActual = matriculaActual?.estadoAcademico;

  // Estados para Edición de Curso
  const [isEditingCurso, setIsEditingCurso] = useState(false);
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCurso, setSelectedCurso] = useState<string>("");

  const handleEditCurso = async () => {
    if (!matriculaActual) return;
    const cursosList = await getAllCursos();
    setCursos(cursosList);
    setSelectedCurso(matriculaActual.curso.idCurso.toString());
    setIsEditingCurso(true);
  };

  const handleUpdateCurso = () => {
    if (!selectedCurso || !matriculaActual) return;

    startTransition(async () => {
      const res = await updateMatriculaCursoAction(
        matriculaActual.idMatricula,
        Number(selectedCurso),
        `/dashboard/alumnos/${alumno.idAlumno}`
      );
      if (res.success) {
        setIsEditingCurso(false);
      } else {
        alert(res.message);
      }
    });
  };

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
    if (!matriculaActual) {
      alert("Error: No se encontró una matrícula válida para realizar esta acción.");
      return;
    }
    
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
      // La revalidación del path en la server action se encarga de refrescar los datos.
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
              {matriculaActual && !isEditingCurso && (
                 <button 
                  onClick={handleEditCurso}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  title="Editar curso del alumno"
                >
                  <Pencil size={14} />
                  Cambiar Curso
                </button>
              )}
            </div>

            {matriculaActual ? (
              !isEditingCurso ? (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                  <p className="text-sm text-slate-600 mb-1">Curso Actual (Ciclo ID: {matriculaActual.idCiclo}):</p>
                  <p className="text-lg font-bold text-slate-900">
                    {matriculaActual.curso.grado} "{matriculaActual.curso.seccion}" - {matriculaActual.curso.nivel}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Inscrito el {new Date(matriculaActual.fechaInscripcion).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6 animate-in fade-in">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Seleccionar nuevo curso:</p>
                  <select 
                    className="w-full p-2 text-sm border border-blue-300 rounded bg-white text-slate-900"
                    value={selectedCurso}
                    onChange={(e) => setSelectedCurso(e.target.value)}
                  >
                    {cursos.map((c) => (
                      <option key={c.idCurso} value={c.idCurso}>
                        {c.grado}° "{c.seccion}" - {c.nivel} ({c.turno})
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2 pt-3">
                    <button 
                      onClick={() => setIsEditingCurso(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleUpdateCurso}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                    >
                      {isPending ? 'Guardando...' : 'Guardar Cambio'}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-6 text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> Este alumno no está inscrito en el ciclo lectivo actual (ID: {cicloId}).
              </div>
            )}

            {/* Botonera de Gestión de Ciclo de Vida */}
            {matriculaActual && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                {estadoActual === "Activo" && (
                  <>
                    <button 
                      onClick={() => handleCambioEstado(EstadoAcademico.Suspendido)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 border border-yellow-200 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <AlertTriangle size={16} /> Suspender
                    </button>
                    <button 
                      onClick={() => handleCambioEstado(EstadoAcademico.Retirado)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Ban size={16} /> Dar de Baja
                    </button>
                    <button 
                      onClick={() => handleCambioEstado(EstadoAcademico.Egresado)}
                      disabled={isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <GraduationCap size={16} /> Marcar como Egresado
                    </button>
                  </>
                )}

                {(estadoActual === "Retirado" || estadoActual === "Egresado" || estadoActual === "Suspendido") && (
                  <button 
                    onClick={() => handleCambioEstado(EstadoAcademico.Activo)}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 text-sm font-medium transition-colors disabled:opacity-50"
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
  if (estado === "Suspendido") {
    return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold border border-yellow-200 flex items-center gap-1"><AlertTriangle size={14}/> Suspendido</span>;
  }
  if (estado === "Retirado") {
    return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold border border-red-200 flex items-center gap-1"><Ban size={14}/> Retirado</span>;
  }
  if (estado === "Egresado") {
    return <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-200 flex items-center gap-1"><GraduationCap size={14}/> Egresado</span>;
  }
  return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold border border-slate-200">Sin Estado</span>;
}