"use client";

import { ArrowLeft, Printer, School } from "lucide-react";
import { useRouter } from "next/navigation";

interface Nota {
  nota: number | string;
  periodo: { nombre: string };
  asignacion: { materia: { nombre: string } };
}

interface Asistencia {
  estado: string;
}

interface Matricula {
  notas: Nota[];
  alumno: { persona: { nombre: string; apellido: string; dni: string }; legajo: string };
  curso: { grado: string; seccion: string; turno: string; nivel: string };
  ciclo: { anio: number };
  asistencias: Asistencia[];
}

export default function BoletinView({ matricula }: { matricula: Matricula }) {
    const router = useRouter();
    const materiasMap = new Map();

  matricula.notas.forEach((n: Nota) => {
    const materiaNombre = n.asignacion.materia.nombre;
    if (!materiasMap.has(materiaNombre)) {
      materiasMap.set(materiaNombre, { t1: 0, t2: 0, t3: 0, dic: null, feb: null, jul: null, notas:[] });
    }

    const scores = materiasMap.get(materiaNombre);
    const periodo = n.periodo.nombre;
    const nota = Number(n.nota);

    if (periodo === "TRIMESTRE_1") scores.t1 = Math.max(scores.t1, nota);
    if (periodo === "TRIMESTRE_2") scores.t2 = Math.max(scores.t2, nota);
    if (periodo === "TRIMESTRE_3") scores.t3 = Math.max(scores.t3, nota);
    if (periodo === "DICIEMBRE") scores.dic = nota;
    if (periodo === "FEBRERO") scores.feb = nota;
    if (periodo === "JULIO_PREVIAS") scores.jul = nota;
    
    scores.notas.push(nota);
  });

  // Determinar condición académica del alumno
  let materiasAprobadas = 0;
  let materiasDiciembre = 0;

  const materiasConEstado = Array.from(materiasMap.entries()).map(([materia, notas]) => {
    const suma = notas.t1 + notas.t2 + notas.t3;
    const promedio = suma > 0 ? (suma / 3) : 0;
    
    // Lógica de condición de aprobación y qué exámenes debería tener el alumno:
    const promedioTrimestresOk = promedio >= 6;
    
    // Determinar si debería tener nota en diciembre
    // Solo si el promedio de trimestres es menor a 6
    let dicMostrar = promedioTrimestresOk ? null : notas.dic;
    
    // Determinar si debería tener nota en febrero
    // Solo si diciembre no aprobó (< 6) o si diciembre es null
    let febMostrar = null;
    if (dicMostrar !== null && dicMostrar !== undefined) {
      // Tiene nota en diciembre
      febMostrar = dicMostrar < 6 ? notas.feb : null;
    } else {
      // No tiene nota en diciembre (aprobó con trimestres)
      febMostrar = null;
    }
    
    // Determinar si debería tener nota en julio
    // Solo si febrero no aprobó (< 6) o si febrero es null
    let julMostrar = null;
    if (febMostrar !== null && febMostrar !== undefined) {
      // Tiene nota en febrero
      julMostrar = febMostrar < 6 ? notas.jul : null;
    } else {
      // No tiene nota en febrero
      julMostrar = null;
    }
    
    // Verificar condición de aprobación:
    // APR si: promedio de trimestres >= 6 O cualquiera de dic/feb/jul >= 6 (mostrando solo los que debería tener)
    const dicAprobado = dicMostrar !== null && dicMostrar !== undefined && dicMostrar >= 6;
    const febAprobado = febMostrar !== null && febMostrar !== undefined && febMostrar >= 6;
    const julAprobado = julMostrar !== null && julMostrar !== undefined && julMostrar >= 6;
    
    const esAprobado = promedioTrimestresOk || dicAprobado || febAprobado || julAprobado;
    
    if (esAprobado) {
      materiasAprobadas++;
      return {
        materia,
        t1: notas.t1,
        t2: notas.t2,
        t3: notas.t3,
        dic: dicMostrar,
        feb: febMostrar,
        jul: julMostrar,
        promedio: parseFloat(promedio.toFixed(2)),
        estado: 'APR',
        condicion: 'APROBADA'
      };
    }
    
    // Si no aprueba, va a diciembre
    materiasDiciembre++;
    return {
      materia,
      t1: notas.t1,
      t2: notas.t2,
      t3: notas.t3,
      dic: dicMostrar,
      feb: febMostrar,
      jul: julMostrar,
      promedio: parseFloat(promedio.toFixed(2)),
      estado: 'A_DICIEMBRE',
      condicion: 'DICIEMBRE'
    };
  });

  // Cálculo de asistencias para el boletín
  // Reglas especiales: faltas justificadas cuentan como presente, 2 tardanzas cuentan como 1 presente
  const asistencias = matricula.asistencias || [];
  const presentes = asistencias.filter((a: Asistencia) => a.estado === 'Presente').length;
  const faltasJustificadas = asistencias.filter((a: Asistencia) => a.estado === 'Justificado').length;
  const faltasInjustificadas = asistencias.filter((a: Asistencia) => a.estado === 'Ausente').length;
  const tardanzas = asistencias.filter((a: Asistencia) => a.estado === 'Tarde').length;
  
  // Para el boletín
  const presentesBoletin = presentes + faltasJustificadas + (tardanzas / 2); // Justificadas cuentan como presente, 2 tardanzas = 1 presente
  const faltasBoletin = faltasInjustificadas; // Solo faltas injustificadas
  const totalAsistencias = matricula.asistencias.length;
  const porcentajeAsistencia = totalAsistencias > 0 ? ((presentesBoletin / totalAsistencias) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-6 print:p-1 print:m-0 print:max-w-full print:space-y-1 print:bg-white">
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

      <div className="bg-white border-2 border-slate-200 rounded-[3rem] p-8 md:p-16 shadow-2xl print:shadow-none print:border-none print:rounded-none print:p-1 print:m-0">

        {/* ENCABEZADO */}
        <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-4 print:pb-2 print:mb-3">
          <div className="flex items-center gap-2 print:gap-2">
            <div className="p-2 bg-indigo-600 rounded-2xl text-white print:p-1.5">
              <School size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tighter uppercase leading-none print:text-base">Libreta Educativa</h1>
              <p className="text-slate-400 font-bold text-xs tracking-widest mt-0.5 print:text-[10px]">CICLO {matricula.ciclo.anio}</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="font-black text-slate-800 text-sm print:text-xs">{matricula.curso.grado}° &quot;{matricula.curso.seccion}&quot;</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter print:text-[9px]">{matricula.curso.nivel} • TURNO {matricula.curso.turno}</p>
          </div>
        </div>

        {/* DATOS ALUMNO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 print:gap-2 print:mb-2">
          <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100 print:p-2 print:rounded-lg">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 print:text-[7px] print:mb-0.5">Estudiante</span>
            <div className="text-2xl font-black text-slate-800 uppercase print:text-sm">
              {matricula.alumno.persona.apellido}, {matricula.alumno.persona.nombre}
            </div>
            <div className="text-sm font-bold text-indigo-500 mt-1 print:text-[10px] print:mt-0.5">Legajo: {matricula.alumno.legajo}</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100 flex flex-col justify-center items-end print:p-2 print:rounded-lg print:items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 print:text-[7px] print:mb-0.5">DNI</span>
            <div className="text-xl font-bold text-slate-600 print:text-sm">{matricula.alumno.persona.dni}</div>
          </div>
        </div>

        {/* TABLA DE CALIFICACIONES */}
        <div className="overflow-hidden border border-slate-200 rounded-xl print:rounded-md print:border-gray-300">
          <table className="w-full border-collapse text-[11px] print:text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-[8px] font-black text-slate-600 uppercase tracking-tight print:bg-gray-200 print:text-[7px]">
                <th className="py-1.5 px-2 text-left print:py-1 print:px-1.5">Asignatura</th>
                <th className="py-1.5 text-center print:py-1">1T</th>
                <th className="py-1.5 text-center print:py-1">2T</th>
                <th className="py-1.5 text-center print:py-1">3T</th>
                <th className="py-1.5 text-center print:py-1">Dic</th>
                <th className="py-1.5 text-center print:py-1">Feb</th>
                <th className="py-1.5 text-center print:py-1">Jul</th>
                <th className="py-1.5 text-center bg-indigo-100 text-indigo-700 print:bg-indigo-50 print:py-1">Prom</th>
                <th className="py-1.5 text-center print:py-1">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-gray-200">
              {materiasConEstado.map((m) => {
                return (
                  <tr key={m.materia} className="hover:bg-slate-50/20 print:hover:bg-transparent">
                    <td className="py-1.5 px-2 font-black text-slate-700 uppercase print:py-1 print:px-1.5">{m.materia}</td>
                    <td className={`py-1.5 text-center font-bold print:py-1 ${Number(m.t1) >= 6 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>{m.t1 || '-'}</td>
                    <td className={`py-1.5 text-center font-bold print:py-1 ${Number(m.t2) >= 6 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>{m.t2 || '-'}</td>
                    <td className={`py-1.5 text-center font-bold print:py-1 ${Number(m.t3) >= 6 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>{m.t3 || '-'}</td>
                    <td className={`py-1.5 text-center font-bold print:py-1 ${Number(m.dic) >= 6 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>{m.dic !== null && m.dic !== undefined ? m.dic : '-'}</td>
                    <td className={`py-1.5 text-center font-bold print:py-1 ${Number(m.feb) >= 6 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>{m.feb !== null && m.feb !== undefined ? m.feb : '-'}</td>
                    <td className={`py-1.5 text-center font-bold print:py-1 ${Number(m.jul) >= 6 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>{m.jul !== null && m.jul !== undefined ? m.jul : '-'}</td>
                    <td className="py-1.5 text-center font-black text-indigo-600 bg-indigo-50/30 print:bg-indigo-50 print:py-1">{m.promedio > 0 ? m.promedio : '-'}</td>
                    <td className="py-1.5 text-center print:py-1">
                      <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase print:text-[6px] print:px-1 print:py-0.5 ${
                        m.estado === 'APR' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {m.estado === 'APR' ? 'APR' : 'Dic'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RESUMEN ACADÉMICO */}
        <div className="mt-3 grid grid-cols-3 gap-2 mb-3 print:gap-1.5 print:mt-2 print:mb-2">
          <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex flex-col items-center print:p-1.5">
            <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tight">Aprobadas</span>
            <span className="text-lg font-black text-emerald-700 print:text-base">{materiasAprobadas}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg flex flex-col items-center print:p-1.5">
            <span className="text-[7px] font-black text-amber-600 uppercase tracking-tight">Diciembre</span>
            <span className="text-lg font-black text-amber-700 print:text-base">{materiasDiciembre}</span>
          </div>
          <div className={`border p-2 rounded-lg flex flex-col items-center ${Number(porcentajeAsistencia) >= 80 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} print:p-1.5`}>
            <span className={`text-[7px] font-black uppercase tracking-tight ${Number(porcentajeAsistencia) >= 80 ? 'text-blue-600' : 'text-orange-600'}`}>Asistencia</span>
            <span className={`text-lg font-black print:text-base ${Number(porcentajeAsistencia) >= 80 ? 'text-blue-700' : 'text-orange-700'}`}>{porcentajeAsistencia}%</span>
          </div>
        </div>

        {/* DETALLE DE ASISTENCIAS */}
        <div className="mt-2 grid grid-cols-2 gap-2 print:gap-1.5 print:mt-1.5">
          <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg flex flex-col items-center print:p-1.5">
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-tight">Presentes</span>
            <span className="text-base font-black text-slate-700 print:text-sm">{Math.round(presentesBoletin)}</span>
          </div>
          <div className="bg-rose-50 border border-rose-100 p-2 rounded-lg flex flex-col items-center print:p-1.5">
            <span className="text-[7px] font-black text-rose-600 uppercase tracking-tight">Faltas</span>
            <span className="text-base font-black text-rose-700 print:text-sm">{Math.round(faltasBoletin)}</span>
          </div>
        </div>

        {/* ESPACIO PARA FIRMAS */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-3 border-t border-slate-100 print:gap-2 print:mt-1 print:pt-1">
          <div className="text-center space-y-1">
            <div className="h-px bg-slate-300 w-24 mx-auto mt-3 print:mt-2"></div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-tight print:text-[6px]">Director</p>
          </div>
          <div className="text-center space-y-1">
            <div className="h-px bg-slate-300 w-24 mx-auto mt-3 print:mt-2"></div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-tight print:text-[6px]">Preceptor</p>
          </div>
          <div className="text-center space-y-1">
            <div className="h-px bg-slate-300 w-24 mx-auto mt-3 print:mt-2"></div>
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-tight print:text-[6px]">Sello</p>
          </div>
        </div>
      </div>
    </div>
  );
}