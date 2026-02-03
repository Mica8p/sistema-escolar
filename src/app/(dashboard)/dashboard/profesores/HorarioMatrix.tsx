"use client";

import React from 'react';
import { use, useEffect, useState } from 'react';

const dias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"];

const horasManana = [
  "07:00 - 08:00",
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
];
const horasTarde = [
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

interface HorarioMatrixProps {
  horario: any[];
  turno: "MAÑANA" | "TARDE";
  loading: boolean;
  onSlotSelect: (dia: string, hora: string) => void;
  selectedSlots: { dia: string, hora: string }[];
  idAsignacionActual?: number;
}

export default function HorarioMatrix({ horario, turno, loading, onSlotSelect, selectedSlots, idAsignacionActual }: HorarioMatrixProps) {
  const [horas, setHoras] = useState(turno.toUpperCase() === "MAÑANA" ? horasManana : horasTarde);

  useEffect(() => {
    setHoras(turno.toUpperCase() === "MAÑANA" ? horasManana : horasTarde);
  }, [turno]);

  // Sincronizar las horas visuales con los slots guardados (para que aparezcan los horarios editados)
  useEffect(() => {
    if (selectedSlots.length === 0) return;

    setHoras((prevHoras) => {
      const newHoras = [...prevHoras];
      let changed = false;
      const defaults = turno.toUpperCase() === "MAÑANA" ? horasManana : horasTarde;

      selectedSlots.forEach((slot) => {
        if (newHoras.includes(slot.hora)) return;

        const slotStart = parseInt(slot.hora.split(":")[0]);
        // Buscamos la fila por defecto que corresponde a este horario (mismo rango de hora)
        const matchIndex = defaults.findIndex((def) => Math.abs(parseInt(def.split(":")[0]) - slotStart) < 2);

        if (matchIndex !== -1 && newHoras[matchIndex] !== slot.hora) {
          newHoras[matchIndex] = slot.hora;
          changed = true;
        }
      });

      return changed ? newHoras : prevHoras;
    });
  }, [selectedSlots, turno]);

  const handleHoraChange = (index: number, value: string) => {
    const newHoras = [...horas];
    newHoras[index] = value;
    setHoras(newHoras);
  };

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
      <div className="grid grid-cols-6 gap-1">
        <div className="font-bold text-center text-gray-700">Hora</div>
        {dias.map((dia) => (
          <div key={dia} className="font-bold text-center text-xs text-gray-700">
            {dia}
          </div>
        ))}

        {horas.map((hora, i) => (
          <React.Fragment key={i}>
            <div className="font-bold text-center text-xs text-gray-700 flex items-center justify-center">
              <input
                value={hora}
                onChange={(e) => handleHoraChange(i, e.target.value)}
                className="w-full text-center bg-transparent border border-transparent hover:border-gray-300 focus:border-indigo-500 rounded px-1 text-xs focus:outline-none"
              />
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
