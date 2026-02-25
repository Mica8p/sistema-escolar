'use client';

import { useFormStatus } from 'react-dom';
import { createPeriodoAction, getPeriodosByCiclo, deletePeriodoAction, togglePeriodoCerradoAction } from '@/lib/actions/periodo-actions';
import { getAllCiclos } from '@/lib/actions/ciclo-actions';
import { PeriodoNombre } from '@prisma/client';
import { useActionState, useEffect, useState } from 'react';
import { PeriodoAcademico, CicloLectivo } from '@prisma/client';
import { Lock, Unlock, Trash2 } from 'lucide-react';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm disabled:bg-blue-300 transition-all">
      {pending ? 'Creando...' : 'Crear Periodo'}
    </button>
  );
}

function ToggleStatusButton({ idPeriodo, cerrado }: { idPeriodo: number, cerrado: boolean }) {
    const handleToggle = async () => {
        const mensaje = cerrado
            ? '¿Quieres abrir este periodo? Los docentes podrán volver a cargar notas.'
            : '¿Quieres cerrar este periodo? Se bloqueará la carga de notas para todos los docentes.';

        if (confirm(mensaje)) {
            const result = await togglePeriodoCerradoAction(idPeriodo, !cerrado);
            if (result.success) {
                window.location.reload();
            } else {
                alert('Error al cambiar el estado del periodo');
            }
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
                cerrado
                ? 'bg-slate-800 text-white hover:bg-slate-900'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200'
            }`}
        >
            {cerrado ? <Unlock size={14} /> : <Lock size={14} />}
            {cerrado ? 'Abrir' : 'Cerrar'}
        </button>
    );
}

function DeletePeriodoButton({ idPeriodo }: { idPeriodo: number }) {
    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este periodo? Esta acción no se puede deshacer.')) {
            const result = await deletePeriodoAction(idPeriodo);
            if (result.success) {
                window.location.reload();
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    };

    return (
        <button onClick={handleDelete} className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black uppercase hover:bg-rose-100 transition-all flex items-center gap-1">
            <Trash2 size={14} /> Eliminar
        </button>
    );
}

export default function PeriodosManager() {
  const [state, formAction] = useActionState(createPeriodoAction, {
    success: false,
    message: '',
  });

  const [ciclos, setCiclos] = useState<CicloLectivo[]>([]);
  const [selectedCiclo, setSelectedCiclo] = useState<number | undefined>(undefined);
  const [periodos, setPeriodos] = useState<any[]>([]); // Cambiado a any para evitar líos con tipos nuevos

  useEffect(() => {
    async function fetchCiclos() {
      const fetchedCiclos = await getAllCiclos();
      setCiclos(fetchedCiclos);
      if (fetchedCiclos.length > 0) {
        setSelectedCiclo(fetchedCiclos[0].idCiclo);
      }
    }
    fetchCiclos();
  }, []);

  useEffect(() => {
    async function fetchPeriodos() {
      if (selectedCiclo) {
        const fetchedPeriodos = await getPeriodosByCiclo(selectedCiclo);
        setPeriodos(fetchedPeriodos);
      } else {
        setPeriodos([]);
      }
    }
    fetchPeriodos();
  }, [selectedCiclo, state]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="container mx-auto p-6 bg-slate-50 min-h-screen rounded-3xl">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight uppercase">Gestión de Periodos</h1>

      {/* FORMULARIO DE CREACIÓN */}
      <div className="mb-10 p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
        <h2 className="text-lg font-black mb-6 text-slate-600 uppercase tracking-widest">Nuevo Periodo Académico</h2>
        <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ciclo Lectivo</label>
            <select
              name="idCiclo"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(Number(e.target.value))}
              required
            >
              {ciclos.map((ciclo) => (
                <option key={ciclo.idCiclo} value={ciclo.idCiclo}>
                  {ciclo.anio} {ciclo.estado ? '(Activo)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre</label>
            <select
              name="nombre"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
              required
            >
              {Object.values(PeriodoNombre).map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Inicio</label>
            <input type="date" name="fechaInicio" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm font-bold text-slate-700" required />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fin</label>
            <input type="date" name="fechaFin" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 text-sm font-bold text-slate-700" required />
          </div>

          <div className="lg:col-span-4 flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </div>

      {/* LISTADO DE PERIODOS */}
      <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
        <h2 className="text-lg font-black mb-6 text-slate-600 uppercase tracking-widest">
          Periodos del Ciclo: {selectedCiclo ? ciclos.find(c => c.idCiclo === selectedCiclo)?.anio : '-'}
        </h2>

        {periodos.length === 0 ? (
          <div className="py-10 text-center text-slate-400 font-bold italic">No hay periodos registrados para este ciclo.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-left">Nombre</th>
                  <th className="px-6 py-4 text-left">Rango de Fechas</th>
                  <th className="px-6 py-4 text-center">Estado de Carga</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {periodos.map((periodo) => (
                  <tr key={periodo.idPeriodo} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 text-sm font-black text-slate-700 uppercase">{periodo.nombre.replace('_', ' ')}</td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500">
                      {formatDate(periodo.fechaInicio)} al {formatDate(periodo.fechaFin)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                        periodo.cerrado ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      }`}>
                        {periodo.cerrado ? '🚫 Carga Bloqueada' : '✅ Carga Habilitada'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <ToggleStatusButton idPeriodo={periodo.idPeriodo} cerrado={periodo.cerrado} />
                        <DeletePeriodoButton idPeriodo={periodo.idPeriodo} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
