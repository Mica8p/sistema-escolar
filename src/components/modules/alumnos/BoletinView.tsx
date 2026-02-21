"use client";

import { ArrowLeft, Printer, School } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BoletinView({ matricula }: { matricula: any }) {
    const router = useRouter();
    const materiasMap = new Map();

  matricula.notas.forEach((n: any) => {
    const materiaNombre = n.asignacion.materia.nombre;
    if (!materiasMap.has(materiaNombre)) {
      materiasMap.set(materiaNombre, { t1: 0, t2: 0, t3: 0, dic: 0 });
    }

    const scores = materiasMap.get(materiaNombre);
    const periodo = n.periodo.nombre;

    if (periodo === "TRIMESTRE_1") scores.t1 = Math.max(scores.t1, n.nota);
    if (periodo === "TRIMESTRE_2") scores.t2 = Math.max(scores.t2, n.nota);
    if (periodo === "TRIMESTRE_3") scores.t3 = Math.max(scores.t3, n.nota);
    if (periodo === "DICIEMBRE") scores.dic = n.nota;
  });

  const handlePrint = () => window.print();

  const faltasJustificadas = matricula.asistencias.filter((a: any) => a.estado === 'AusenteJustificado').length;
  const faltasInjustificadas = matricula.asistencias.filter((a: any) => a.estado === 'AusenteInjustificado').length;
  const totalFaltas = faltasJustificadas + faltasInjustificadas;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6">
      <div className="w-full flex justify-between items-center mb-6 print:hidden">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:border-indigo-200 group-hover:bg-indigo-50 shadow-sm transition-all">
            <ArrowLeft size={16} />
          </div>
          Volver atrás
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:scale-105 transition-all shadow-xl"
        >
          <Printer size={18} /> IMPRIMIR BOLETÍN OFICIAL
        </button>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-[3rem] p-8 md:p-16 shadow-2xl print:shadow-none print:border-none print:p-0">

        {/* ENCABEZADO */}
        <div className="flex justify-between items-center border-b-4 border-slate-100 pb-10 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-3xl text-white">
              <School size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">Libreta Educativa</h1>
              <p className="text-slate-400 font-bold text-sm tracking-[0.3em] mt-2">CICLO LECTIVO {matricula.ciclo.anio}</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="font-black text-slate-800 text-xl">{matricula.curso.grado}° "{matricula.curso.seccion}"</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{matricula.curso.nivel} • TURNO {matricula.curso.turno}</p>
          </div>
        </div>

        {/* DATOS ALUMNO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estudiante</span>
            <div className="text-2xl font-black text-slate-800 uppercase">
              {matricula.alumno.persona.apellido}, {matricula.alumno.persona.nombre}
            </div>
            <div className="text-sm font-bold text-indigo-500 mt-1">Legajo: {matricula.alumno.legajo}</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">DNI</span>
            <div className="text-xl font-bold text-slate-600">{matricula.alumno.persona.dni}</div>
          </div>
        </div>

        {/* TABLA DE CALIFICACIONES */}
        <div className="overflow-hidden border-2 border-slate-100 rounded-[2.5rem]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="py-6 px-8 text-left">Asignatura</th>
                <th className="py-6 text-center">1° Trim</th>
                <th className="py-6 text-center">2° Trim</th>
                <th className="py-6 text-center">3° Trim</th>
                <th className="py-6 text-center bg-indigo-50 text-indigo-600">Promedio</th>
                <th className="py-6 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {Array.from(materiasMap.entries()).map(([materia, notas]) => {
                const suma = notas.t1 + notas.t2 + notas.t3;
                const promedio = (suma / 3).toFixed(2);
                const promocionado = suma >= 18 && notas.t1 >= 6 && notas.t2 >= 6 && notas.t3 >= 6;

                return (
                  <tr key={materia} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-6 px-8 font-black text-slate-700 uppercase text-sm">{materia}</td>
                    <td className="py-6 text-center font-bold text-slate-500">{notas.t1 || '-'}</td>
                    <td className="py-6 text-center font-bold text-slate-500">{notas.t2 || '-'}</td>
                    <td className="py-6 text-center font-bold text-slate-500">{notas.t3 || '-'}</td>
                    <td className="py-6 text-center font-black text-indigo-600 bg-indigo-50/30">{suma > 0 ? promedio : '-'}</td>
                    <td className="py-6 text-center">
                      {suma > 0 && (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          promocionado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {promocionado ? "Promocionado" : "Pendiente"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex flex-col items-center">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Faltas Justificadas</span>
        <span className="text-xl font-black text-slate-700">{faltasJustificadas}</span>
      </div>
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex flex-col items-center">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Faltas Injustificadas</span>
        <span className="text-xl font-black text-rose-600">{faltasInjustificadas}</span>
      </div>
      <div className="bg-indigo-600 p-4 rounded-3xl flex flex-col items-center shadow-lg shadow-indigo-100">
        <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">Total Inasistencias</span>
        <span className="text-xl font-black text-white">{totalFaltas}</span>
      </div>
    </div>

        {/* ESPACIO PARA FIRMAS */}
        <div className="grid grid-cols-3 gap-10 mt-20 pt-10 border-t-2 border-slate-100">
          <div className="text-center space-y-2">
            <div className="h-px bg-slate-300 w-32 mx-auto mt-12"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Firma del Director</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-px bg-slate-300 w-32 mx-auto mt-12"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Firma del Preceptor</p>
          </div>
          <div className="text-center space-y-2">
            <div className="h-px bg-slate-300 w-32 mx-auto mt-12"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sello de la Institución</p>
          </div>
        </div>
      </div>
    </div>
  );
}