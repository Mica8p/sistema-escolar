'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Materia, Turno } from '@prisma/client';
import { useState } from 'react';

interface EstadisticaEstudiante {
  idMatricula: number;
  nombreAlumno: string;
  presentes: number;
  ausentes: number;
  tardios: number;
  justificados: number;
  totalClases: number;
}

interface Props {
  cursos: Array<{
    idCurso: number;
    grado: string;
    seccion: string;
    turnos: Turno[];
  }>;
  idCurso: number;
  turno: Turno;
  materiasUnicas: Materia[];
  idMateria: number;
  estadisticas: EstadisticaEstudiante[];
}

export default function AsistenciasReportClient({
  cursos,
  idCurso,
  turno,
  materiasUnicas,
  idMateria,
  estadisticas
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localIdCurso, setLocalIdCurso] = useState(idCurso);
  const [localTurno, setLocalTurno] = useState(turno);
  const [localIdMateria, setLocalIdMateria] = useState(idMateria);

  const handleCursoChange = (newIdCurso: number) => {
    setLocalIdCurso(newIdCurso);
    const params = new URLSearchParams(searchParams);
    params.set('curso', String(newIdCurso));
    params.delete('turno');
    params.delete('mat');
    router.push(`?${params.toString()}`);
  };

  const handleTurnoChange = (newTurno: Turno) => {
    setLocalTurno(newTurno);
    const params = new URLSearchParams(searchParams);
    params.set('turno', newTurno);
    params.delete('mat');
    router.push(`?${params.toString()}`);
  };

  const handleMateriaChange = (newIdMateria: number) => {
    setLocalIdMateria(newIdMateria);
    const params = new URLSearchParams(searchParams);
    params.set('mat', String(newIdMateria));
    router.push(`?${params.toString()}`);
  };

  const selectedCurso = cursos.find(c => c.idCurso === localIdCurso);
  const selectedMateria = materiasUnicas.find(m => m.idMateria === localIdMateria);

  const porcentajeAsistencia = estadisticas.length > 0
    ? (estadisticas.reduce((sum, e) => sum + (e.presentes + e.justificados), 0) / 
       estadisticas.reduce((sum, e) => sum + e.totalClases, 0) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Reporte de Asistencias</h1>
        <p className="text-slate-500 text-sm mt-1">Estadísticas por materia</p>
      </div>

      {/* Selectores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-2xl p-6 border-2 border-slate-100">
        {/* Curso */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Grado/Sección</label>
          <select
            value={localIdCurso}
            onChange={(e) => handleCursoChange(Number(e.target.value))}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
          >
            {cursos.map(c => (
              <option key={c.idCurso} value={c.idCurso}>
                {c.grado}° {c.seccion}
              </option>
            ))}
          </select>
        </div>

        {/* Turno */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Turno</label>
          <select
            value={localTurno}
            onChange={(e) => handleTurnoChange(e.target.value as Turno)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
          >
            {selectedCurso?.turnos.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Materia */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Materia</label>
          <select
            value={localIdMateria}
            onChange={(e) => handleMateriaChange(Number(e.target.value))}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-2.5 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
          >
            {materiasUnicas.map(m => (
              <option key={m.idMateria} value={m.idMateria}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumen */}
      {selectedMateria && estadisticas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-100">
            <p className="text-[10px] font-black text-blue-400 uppercase">Estudiantes</p>
            <p className="text-2xl font-black text-blue-600">{estadisticas.length}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-100">
            <p className="text-[10px] font-black text-green-400 uppercase">Presentes</p>
            <p className="text-2xl font-black text-green-600">
              {estadisticas.reduce((sum, e) => sum + e.presentes, 0)}
            </p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 border-2 border-red-100">
            <p className="text-[10px] font-black text-red-400 uppercase">Ausentes</p>
            <p className="text-2xl font-black text-red-600">
              {estadisticas.reduce((sum, e) => sum + e.ausentes, 0)}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-100">
            <p className="text-[10px] font-black text-yellow-400 uppercase">Tardíos</p>
            <p className="text-2xl font-black text-yellow-600">
              {estadisticas.reduce((sum, e) => sum + e.tardios, 0)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-100">
            <p className="text-[10px] font-black text-purple-400 uppercase">% Asistencia</p>
            <p className="text-2xl font-black text-purple-600">{porcentajeAsistencia}%</p>
          </div>
        </div>
      )}

      {/* Tabla de estudiantes */}
      {selectedMateria && (
        <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden">
          <div className="bg-linear-to-r from-slate-50 to-slate-100 p-4 border-b-2 border-slate-100">
            <h2 className="font-black text-slate-800 uppercase text-sm">
              {selectedMateria.nombre} - {selectedCurso?.grado}° {selectedCurso?.seccion}
            </h2>
          </div>
          
          {estadisticas.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No hay datos de asistencia para esta materia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-100">
                    <th className="px-4 py-3 text-left text-[10px] font-black text-slate-600 uppercase">Alumno</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-600 uppercase">Presentes</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-600 uppercase">Ausentes</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-600 uppercase">Tardíos</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-600 uppercase">Justificados</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-600 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-[10px] font-black text-slate-600 uppercase">% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {estadisticas.map((est, idx) => {
                    const porcentaje = est.totalClases > 0
                      ? ((est.presentes + est.justificados) / est.totalClases * 100).toFixed(1)
                      : 0;
                    
                    return (
                      <tr key={est.idMatricula} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-3 text-sm font-bold text-slate-800">{est.nombreAlumno}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-green-600">{est.presentes}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-red-600">{est.ausentes}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-yellow-600">{est.tardios}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">{est.justificados}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-slate-800">{est.totalClases}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold">
                          <span className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                            parseFloat(porcentaje as string) >= 80
                              ? 'bg-green-100 text-green-700'
                              : parseFloat(porcentaje as string) >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {porcentaje}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
