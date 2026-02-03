"use client";

import React from 'react';
import { use, useEffect, useState } from 'react';
import { BloqueHorario, DiaHabil, Turno } from '@prisma/client';

interface HorarioMatrixProps {
  horario: any[];
  turno: Turno;
  loading: boolean;
  onSlotSelect: (dia: string, hora: string) => void;
  selectedSlots: { dia: string, hora: string }[];
  idAsignacionActual?: number;
  diasHabiles: DiaHabil[];
  bloquesHorario: BloqueHorario[];
}

export default function HorarioMatrix({ horario, turno, loading, onSlotSelect, selectedSlots, idAsignacionActual, diasHabiles, bloquesHorario }: HorarioMatrixProps) {
  
  const dias = diasHabiles.map(d => d.nombre);
  
  const getHorasBase = () => {
    const bloquesTurno = bloquesHorario.filter(b => b.turno.toUpperCase() === turno.toUpperCase());
    return bloquesTurno.map(b => `${b.horaInicio} - ${b.horaFin}`);
  }

  const [horas, setHoras] = useState(getHorasBase());

  useEffect(() => {
    setHoras(getHorasBase());
  }, [turno, bloquesHorario]);

  // Sincronizar las horas visuales con los slots guardados (para que aparezcan los horarios editados)
  useEffect(() => {
    if (selectedSlots.length === 0) return;
    
    const horasBase = getHorasBase();

    setHoras((prevHoras) => {
      const newHoras = [...prevHoras];
      let changed = false;

      selectedSlots.forEach((slot) => {
        if (newHoras.includes(slot.hora)) return;

        const slotStart = parseInt(slot.hora.split(":")[0]);
        // Buscamos la fila por defecto que corresponde a este horario (mismo rango de hora)
        const matchIndex = horasBase.findIndex((def) => Math.abs(parseInt(def.split(":")[0]) - slotStart) < 2);

        if (matchIndex !== -1 && newHoras[matchIndex] !== slot.hora) {
          newHoras[matchIndex] = slot.hora;
          changed = true;
        }
      });

      return changed ? newHoras : prevHoras;
    });
  }, [selectedSlots, turno, bloquesHorario]);

  if (loading) {
    return (
      <div className="mt-4 p-4 border rounded-md bg-gray-50 text-center text-gray-500">
        Cargando horario...
      </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 border rounded-md bg-white">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Selecciona los bloques horarios
      </h3>
      <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${dias.length}, 1fr)` }}>
        <div className="font-bold text-center text-gray-700">Hora</div>
        {dias.map((dia) => (
          <div key={dia} className="font-bold text-center text-xs text-gray-700">
            {dia}
          </div>
        ))}

        {horas.map((hora, i) => (
          <React.Fragment key={i}>
            <div className="font-bold text-center text-xs text-gray-700 flex items-center justify-center px-1 py-2">
              {hora}
            </div>
            {dias.map((dia, j) => {
              const [horaInicio, horaFin] = hora.split(" - ");
              const ocupado = horario.find(
                (h) =>
                  h.diaSemana === dia &&
                  h.horaInicio.startsWith(horaInicio.split(":")[0])
              );
              const isSelected = selectedSlots.some(slot => slot.dia === dia && slot.hora === hora);
              
              // El slot está ocupado por OTRA asignación diferente a la que estamos editando
              const ocupadoPorOtro = ocupado && ocupado.idAsignacion !== idAsignacionActual;


              return (
                <div
                  key={`${i}-${j}`}
                  className={`border rounded-md p-2 text-center text-xs cursor-pointer ${
                    ocupadoPorOtro
                      ? "bg-red-400 text-white cursor-not-allowed" // Bloqueado por otro
                      : isSelected
                      ? "bg-indigo-600 text-white" // Lo seleccioné yo AHORA
                      : "bg-gray-100 hover:bg-gray-200" // Libre
                  }`}
                  onClick={() => !ocupadoPorOtro && onSlotSelect(dia, hora)}
                >
                  {ocupadoPorOtro ? (
                    <div>
                      <p className="font-bold">{ocupado.asignacion.materia.nombre}</p>
                      <p>{ocupado.asignacion.profesor.persona.apellido}</p>
                    </div>
                  ) : isSelected ? (
                    <div>
                    <p className="font-extrabold">SELECCIONADO</p>
                  </div>
                  ) : (
                    "-"
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
