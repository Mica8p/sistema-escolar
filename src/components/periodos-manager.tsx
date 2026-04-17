'use client';

import { useFormStatus } from 'react-dom';
import { createPeriodoAction, getPeriodosByCiclo, updatePeriodoAction, togglePeriodoCerradoAction } from '@/lib/actions/periodo-actions';
import { getAllCiclos } from '@/lib/actions/ciclo-actions';
import { PeriodoNombre } from '@prisma/client';
import { useActionState, useEffect, useState } from 'react';
import { CicloLectivo } from '@prisma/client';
import { Lock, Unlock, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/shared/ConfirmModal';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm disabled:bg-blue-300 transition-all">
      {pending ? 'Creando...' : 'Crear Periodo'}
    </button>
  );
}

function ToggleStatusButton({ idPeriodo, cerrado }: { idPeriodo: number, cerrado: boolean }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = () => {
        setIsModalOpen(true);
    };

    const onConfirm = async () => {
        setLoading(true);
        const result = await togglePeriodoCerradoAction(idPeriodo, !cerrado);
        setLoading(false);
        setIsModalOpen(false);
        if (result.success) {
            toast.success(cerrado ? 'Periodo abierto correctamente' : 'Periodo cerrado correctamente');
            window.location.reload();
        } else {
            // Mostrar el mensaje detallado del servidor
            const mensaje = result.message || 'Error al cambiar el estado del periodo';
            toast.error(mensaje, {
                duration: 5000,
                description: mensaje.includes('faltan') ? 'Por favor, carga las notas pendientes' : undefined
            });
        }
    };

    const mensaje = cerrado
        ? '¿Quieres abrir este periodo? Los docentes podrán volver a cargar notas.'
        : '¿Quieres cerrar este periodo? Se bloqueará la carga de notas para todos los docentes.';

    return (
        <>
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
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={onConfirm}
                title={cerrado ? 'Abrir Periodo' : 'Cerrar Periodo'}
                message={mensaje}
                loading={loading}
                variant={cerrado ? 'warning' : 'danger'}
            />
        </>
    );
}

function EditPeriodoButton({ periodo }: { periodo: { idPeriodo: number; nombre: string; fechaInicio: Date; fechaFin: Date } }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: periodo.nombre,
        fechaInicio: new Date(periodo.fechaInicio).toISOString().split('T')[0],
        fechaFin: new Date(periodo.fechaFin).toISOString().split('T')[0]
    });

    const handleEdit = () => {
        setIsModalOpen(true);
    };

    const onConfirm = async () => {
        setLoading(true);
        try {
            const result = await updatePeriodoAction(periodo.idPeriodo, formData.nombre, formData.fechaInicio, formData.fechaFin);
            setLoading(false);
            setIsModalOpen(false);
            
            if (result.success) {
                toast.success('Periodo actualizado correctamente');
                window.location.reload();
            } else {
                toast.error(`Error: ${result.message}`);
            }
        } catch {
            setLoading(false);
            toast.error('Error al actualizar el periodo');
        }
    };

    return (
        <>
            <button 
                onClick={handleEdit} 
                className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black uppercase hover:bg-blue-100 transition-all flex items-center gap-1"
            >
                <Edit2 size={14} /> Editar
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-black text-slate-800 mb-4 uppercase">Editar Periodo</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Nombre</label>
                                <select
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-2 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                                >
                                    <option value="TRIMESTRE_1">Trimestre 1</option>
                                    <option value="TRIMESTRE_2">Trimestre 2</option>
                                    <option value="TRIMESTRE_3">Trimestre 3</option>
                                    <option value="DICIEMBRE">Diciembre</option>
                                    <option value="FEBRERO">Febrero</option>
                                    <option value="JULIO_PREVIAS">Julio Previas</option>
                                    <option value="ANUAL">Anual</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Fecha Inicio</label>
                                <input
                                    type="date"
                                    value={formData.fechaInicio}
                                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-2 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Fecha Fin</label>
                                <input
                                    type="date"
                                    value={formData.fechaFin}
                                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-2 text-sm font-bold text-slate-700 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:bg-blue-300 transition-all"
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function PeriodosManager() {
  const [state, formAction] = useActionState(createPeriodoAction, {
    success: false,
    message: '',
  });

  const [ciclos, setCiclos] = useState<CicloLectivo[]>([]);
  const [selectedCiclo, setSelectedCiclo] = useState<number | undefined>(undefined);
  const [periodos, setPeriodos] = useState<{ idPeriodo: number; nombre: string; fechaInicio: Date; fechaFin: Date; periodoCerrado: boolean }[]>([]);

  useEffect(() => {
    async function fetchCiclos() {
      const fetchedCiclos = await getAllCiclos();
      setCiclos(fetchedCiclos);
      if (fetchedCiclos.length > 0) {
        // Buscar el ciclo activo (estado = true), si no hay usar el primero
        const activeCiclo = fetchedCiclos.find(c => c.estado === true);
        setSelectedCiclo(activeCiclo ? activeCiclo.idCiclo : fetchedCiclos[0].idCiclo);
      }
    }
    fetchCiclos();
  }, []);

  useEffect(() => {
    async function fetchPeriodos() {
      if (selectedCiclo) {
        const fetchedPeriodos = await getPeriodosByCiclo(selectedCiclo);
        setPeriodos(fetchedPeriodos.map(p => ({ ...p, periodoCerrado: p.cerrado })));
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
      <div className="mb-10 p-8 bg-white border border-slate-200 rounded-4xl shadow-sm">
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
      <div className="p-8 bg-white border border-slate-200 rounded-4xl shadow-sm">
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
                        periodo.periodoCerrado ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      }`}>
                        {periodo.periodoCerrado ? '🚫 Carga Bloqueada' : '✅ Carga Habilitada'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <ToggleStatusButton idPeriodo={periodo.idPeriodo} cerrado={periodo.periodoCerrado} />
                        <EditPeriodoButton periodo={periodo} />
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
