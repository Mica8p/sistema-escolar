"use client";

import { useState, useTransition } from 'react';
import { DiaHabil, BloqueHorario, DiaSemana, Turno } from '@prisma/client';
import { guardarConfiguracionDias, guardarConfiguracionBloques } from '@/lib/actions/configuracion-actions';
import { toast } from 'sonner';
import { Trash2, PlusCircle, CalendarDays, Sun, Moon } from 'lucide-react';

interface Props {
    diasHabiles: DiaHabil[];
    bloquesManana: BloqueHorario[];
    bloquesTarde: BloqueHorario[];
}

// All possible days from the enum to build the UI
const ALL_DIAS: DiaSemana[] = [DiaSemana.LUNES, DiaSemana.MARTES, DiaSemana.MIERCOLES, DiaSemana.JUEVES, DiaSemana.VIERNES, DiaSemana.SABADO, DiaSemana.DOMINGO];

export default function HorarioConfigManager({ diasHabiles, bloquesManana, bloquesTarde }: Props) {
    const [isPending, startTransition] = useTransition();

    // State for days
    const [dias, setDias] = useState(
         ALL_DIAS.map(diaEnum => {
            const diaDb = diasHabiles.find(d => d.nombre === diaEnum);
            return {
                nombre: diaEnum,
                habilitado: diaDb?.habilitado ?? false,
            }
        })
    );

    // State for morning blocks
    const [manana, setManana] = useState(bloquesManana.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));

    // State for afternoon blocks
    const [tarde, setTarde] = useState(bloquesTarde.map(b => ({ horaInicio: b.horaInicio, horaFin: b.horaFin })));

    const handleGuardarDias = () => {
        startTransition(async () => {
            const res = await guardarConfiguracionDias(dias);
            if (res.success) {
                toast.success('Configuración de días guardada con éxito.');
            } else {
                toast.error(res.message);
            }
        });
    };
    
    const handleGuardarBloques = (turno: Turno) => {
        startTransition(async () => {
            const bloques = turno === 'Mañana' ? manana : tarde;
            const res = await guardarConfiguracionBloques(turno, bloques);
            if (res.success) {
                toast.success(`Bloques del turno ${turno} guardados con éxito.`);
            } else {
                toast.error(res.message);
            }
        });
    }

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
        setter(prev => [...prev, { horaInicio: '', horaFin: '' }]);
    }

    const removeBloque = (turno: 'Mañana' | 'Tarde', index: number) => {
        const setter = turno === 'Mañana' ? setManana : setTarde;
        setter(prev => prev.filter((_, i) => i !== index));
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Column 1: Days */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                    <CalendarDays className="text-gray-400" />
                    Días de la Semana
                </h2>
                <div className="space-y-3">
                    {dias.map((dia, index) => (
                         <label key={dia.nombre} className="flex items-center gap-3 text-gray-700 font-medium">
                            <input 
                                type="checkbox" 
                                className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={dia.habilitado}
                                onChange={e => {
                                    const newDias = [...dias];
                                    newDias[index].habilitado = e.target.checked;
                                    setDias(newDias);
                                }}
                            />
                            {dia.nombre.charAt(0).toUpperCase() + dia.nombre.slice(1).toLowerCase()}
                        </label>
                    ))}
                </div>
                 <button
                    onClick={handleGuardarDias}
                    disabled={isPending}
                    className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                    {isPending ? 'Guardando...' : 'Guardar Días'}
                </button>
            </div>

             {/* Column 2 & 3: Blocks */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Morning Blocks */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Sun className="text-yellow-500" />
                        Turno Mañana
                    </h2>
                    <div className="space-y-2">
                        {manana.map((bloque, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="time" value={bloque.horaInicio} onChange={e => handleBloqueChange('Mañana', index, 'horaInicio', e.target.value)} className="w-full p-2 border rounded-md text-gray-800" />
                                <span>-</span>
                                <input type="time" value={bloque.horaFin} onChange={e => handleBloqueChange('Mañana', index, 'horaFin', e.target.value)} className="w-full p-2 border rounded-md text-gray-800" />
                                <button onClick={() => removeBloque('Mañana', index)}><Trash2 className="text-red-500 hover:text-red-700" size={20}/></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => addBloque('Mañana')} className="mt-4 text-indigo-600 font-semibold flex items-center gap-1"><PlusCircle size={16} /> Agregar Fila</button>
                    <button onClick={() => handleGuardarBloques('Mañana')} disabled={isPending} className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400">
                        {isPending ? 'Guardando...' : 'Guardar Turno Mañana'}
                    </button>
                </div>
                
                {/* Afternoon Blocks */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Moon className="text-blue-500" />
                        Turno Tarde
                    </h2>
                    <div className="space-y-2">
                        {tarde.map((bloque, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="time" value={bloque.horaInicio} onChange={e => handleBloqueChange('Tarde', index, 'horaInicio', e.target.value)} className="w-full p-2 border rounded-md text-gray-800" />
                                <span>-</span>
                                <input type="time" value={bloque.horaFin} onChange={e => handleBloqueChange('Tarde', index, 'horaFin', e.target.value)} className="w-full p-2 border rounded-md text-gray-800" />
                                <button onClick={() => removeBloque('Tarde', index)}><Trash2 className="text-red-500 hover:text-red-700" size={20}/></button>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => addBloque('Tarde')} className="mt-4 text-indigo-600 font-semibold flex items-center gap-1"><PlusCircle size={16} /> Agregar Fila</button>
                    <button onClick={() => handleGuardarBloques('Tarde')} disabled={isPending} className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400">
                        {isPending ? 'Guardando...' : 'Guardar Turno Tarde'}
                    </button>
                </div>
            </div>
        </div>
    );
}
