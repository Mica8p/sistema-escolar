"use client";

import { useState, useTransition } from 'react';
import { DiaHabil, BloqueHorario, DiaSemana, Turno } from '@prisma/client';
import { guardarConfiguracionDias, guardarConfiguracionBloques } from '@/lib/actions/configuracion-actions';
import { toast } from 'sonner';
import { Trash2, PlusCircle, CalendarDays, Sun, Moon, Save, Edit2, X } from 'lucide-react';

interface Props {
    diasHabiles: DiaHabil[];
    bloquesManana: BloqueHorario[];
    bloquesTarde: BloqueHorario[];
}

const ALL_DIAS: DiaSemana[] = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];

export default function HorarioConfigManager({ diasHabiles, bloquesManana, bloquesTarde }: Props) {
    const [isPending, startTransition] = useTransition();
    const [editingIndex, setEditingIndex] = useState<{ turno: 'Mañana' | 'Tarde', index: number } | null>(null);

    // --- ESTADOS ---
    const [dias, setDias] = useState(
        ALL_DIAS.map(diaEnum => {
            const diaDb = diasHabiles.find(d => d.nombre === diaEnum);
            return {
                nombre: diaEnum,
                habilitado: diaDb?.habilitado ?? false,
            }
        })
    );

    const [manana, setManana] = useState(bloquesManana.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));
    const [tarde, setTarde] = useState(bloquesTarde.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));

    // --- FUNCIONES DE GUARDADO ---

    // 1. Guardar Días
    const handleGuardarDias = () => {
        startTransition(async () => {
            const res = await guardarConfiguracionDias(dias);
            if (res.success) toast.success('Días guardados correctamente.');
            else toast.error(res.message);
        });
    };

    // 2. Guardar Bloques (Específico por turno)
    const handleGuardarBloques = (turno: Turno) => {
        startTransition(async () => {
            const bloques = turno === 'Mañana' ? manana : tarde;
            const bloqueOriginal = turno === 'Mañana' ? bloquesManana : bloquesTarde;
            
            const res = await guardarConfiguracionBloques(turno, bloques);
            if (res.success) {
                toast.success(`Turno ${turno} guardado correctamente.`);
                setEditingIndex(null);
            }
            else {
                // Si hay error, restaurar los bloques a su estado original
                if (turno === 'Mañana') {
                    setManana(bloqueOriginal.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));
                } else {
                    setTarde(bloqueOriginal.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));
                }
                toast.error(res.message);
            }
        });
    }

    const handleGuardarTodo = () => {
        startTransition(async () => {
            try {
                const [resDias, resManana, resTarde] = await Promise.all([
                    guardarConfiguracionDias(dias),
                    guardarConfiguracionBloques('Mañana', manana),
                    guardarConfiguracionBloques('Tarde', tarde)
                ]);

                if (resDias.success && resManana.success && resTarde.success) {
                    toast.success('¡Configuración completa guardada con éxito!');
                    setEditingIndex(null);
                } else {
                    // Restaurar bloques si hay error
                    if (!resManana.success) {
                        setManana(bloquesManana.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));
                    }
                    if (!resTarde.success) {
                        setTarde(bloquesTarde.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));
                    }
                    const errorMessages = [
                        !resDias.success && resDias.message,
                        !resManana.success && resManana.message,
                        !resTarde.success && resTarde.message,
                    ].filter(Boolean);
                    toast.error(errorMessages[0] || "Hubo un error al guardar los cambios");
                }
            } catch {
                toast.error('Ocurrió un error al intentar guardar todo.');
            }
        });
    };

    // --- MANEJO DE BLOQUES (UI) ---
    const handleBloqueChange = (turno: 'Mañana' | 'Tarde', index: number, field: 'horaInicio' | 'horaFin', value: string) => {
        const setter = turno === 'Mañana' ? setManana : setTarde;
        setter(prev => {
            const newBloques = [...prev];
            newBloques[index][field] = value;
            return newBloques;
        });
    }

    const addBloque = (turno: 'Mañana' | 'Tarde') => {
        const setter = turno === 'Mañana' ? setManana : setTarde;
        const arrayActual = turno === 'Mañana' ? manana : tarde;
        const nuevoIndice = arrayActual.length;
        
        setter(prev => [...prev, { horaInicio: '', horaFin: '' }]);
        // Poner automáticamente en modo edición el bloque nuevo
        setEditingIndex({ turno: turno as 'Mañana' | 'Tarde', index: nuevoIndice });
    }

    const removeBloque = (turno: 'Mañana' | 'Tarde', index: number) => {
        const bloque = turno === 'Mañana' ? manana[index] : tarde[index];
        
        // Si es un bloque vacío (nuevo que no se guardó), eliminarlo directamente
        if (!bloque.horaInicio || !bloque.horaFin) {
            const setter = turno === 'Mañana' ? setManana : setTarde;
            setter(prev => prev.filter((_, i) => i !== index));
            setEditingIndex(null);
            return;
        }

        // Si tiene datos, marcar como "borrable pendiente" (solo visualmente)
        toast.info("Clickea 'Guardar' para confirmar la eliminación del bloque");
        const setter = turno === 'Mañana' ? setManana : setTarde;
        setter(prev => prev.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <button
                    onClick={handleGuardarTodo}
                    disabled={isPending}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-4xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 disabled:bg-slate-300"
                >
                    <Save size={18} />
                    {isPending ? 'Guardando...' : 'Guardar Configuración Completa'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* DÍAS */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <CalendarDays className="text-indigo-400" />
                        Días Hábiles
                    </h2>
                    <div className="space-y-4">
                        {dias.map((dia, index) => (
                            <label key={dia.nombre} className="flex items-center gap-3 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={dia.habilitado}
                                    onChange={e => {
                                        const newDias = [...dias];
                                        newDias[index].habilitado = e.target.checked;
                                        setDias(newDias);
                                    }}
                                />
                                {dia.nombre}
                            </label>
                        ))}
                    </div>
                    <button
                        onClick={handleGuardarDias}
                        disabled={isPending}
                        className="mt-6 w-full bg-slate-100 text-slate-600 font-black py-3 px-4 rounded-xl hover:bg-slate-200 transition-colors text-[10px] uppercase tracking-widest disabled:opacity-50"
                    >
                        Solo Guardar Días
                    </button>
                </div>

                {/* BLOQUES TURNOS */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* MAÑANA */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                            <Sun className="text-yellow-500" />
                            Turno Mañana
                        </h2>
                        <div className="space-y-3">
                            {manana.map((bloque, index) => (
                                <div key={index} className="flex items-center gap-2 group">
                                    {editingIndex?.turno === 'Mañana' && editingIndex?.index === index ? (
                                        <>
                                            <input 
                                                type="time" 
                                                value={bloque.horaInicio} 
                                                onChange={e => handleBloqueChange('Mañana', index, 'horaInicio', e.target.value)} 
                                                className="w-full p-3 bg-indigo-50 border-2 border-indigo-500 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500" 
                                            />
                                            <span className="text-slate-300 font-black">-</span>
                                            <input 
                                                type="time" 
                                                value={bloque.horaFin} 
                                                onChange={e => handleBloqueChange('Mañana', index, 'horaFin', e.target.value)} 
                                                className="w-full p-3 bg-indigo-50 border-2 border-indigo-500 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500" 
                                            />
                                            <button 
                                                onClick={() => setEditingIndex(null)} 
                                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold">
                                                {bloque.horaInicio} - {bloque.horaFin}
                                            </div>
                                            <button 
                                                onClick={() => setEditingIndex({ turno: 'Mañana', index })} 
                                                className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => removeBloque('Mañana', index)} 
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addBloque('Mañana')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-70">
                            <PlusCircle size={16} /> Agregar Bloque
                        </button>
                        <button onClick={() => handleGuardarBloques('Mañana')} disabled={isPending} className="mt-6 w-full bg-slate-100 text-slate-600 font-black py-3 px-4 rounded-xl hover:bg-slate-200 text-[10px] uppercase tracking-widest disabled:opacity-50">
                            Solo Guardar Mañana
                        </button>
                    </div>

                    {/* TARDE */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                            <Moon className="text-indigo-500" />
                            Turno Tarde
                        </h2>
                        <div className="space-y-3">
                            {tarde.map((bloque, index) => (
                                <div key={index} className="flex items-center gap-2 group">
                                    {editingIndex?.turno === 'Tarde' && editingIndex?.index === index ? (
                                        <>
                                            <input 
                                                type="time" 
                                                value={bloque.horaInicio} 
                                                onChange={e => handleBloqueChange('Tarde', index, 'horaInicio', e.target.value)} 
                                                className="w-full p-3 bg-indigo-50 border-2 border-indigo-500 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500" 
                                            />
                                            <span className="text-slate-300 font-black">-</span>
                                            <input 
                                                type="time" 
                                                value={bloque.horaFin} 
                                                onChange={e => handleBloqueChange('Tarde', index, 'horaFin', e.target.value)} 
                                                className="w-full p-3 bg-indigo-50 border-2 border-indigo-500 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500" 
                                            />
                                            <button 
                                                onClick={() => setEditingIndex(null)} 
                                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <X size={18}/>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold">
                                                {bloque.horaInicio} - {bloque.horaFin}
                                            </div>
                                            <button 
                                                onClick={() => setEditingIndex({ turno: 'Tarde', index })} 
                                                className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={18}/>
                                            </button>
                                            <button 
                                                onClick={() => removeBloque('Tarde', index)} 
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addBloque('Tarde')} className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-70">
                            <PlusCircle size={16} /> Agregar Bloque
                        </button>
                        <button onClick={() => handleGuardarBloques('Tarde')} disabled={isPending} className="mt-6 w-full bg-slate-100 text-slate-600 font-black py-3 px-4 rounded-xl hover:bg-slate-200 text-[10px] uppercase tracking-widest disabled:opacity-50">
                            Solo Guardar Tarde
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}