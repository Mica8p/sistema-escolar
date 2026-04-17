"use client";

import React from 'react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { BloqueHorario, DiaHabil, Turno, DiaSemana } from '@prisma/client';

// Mapeo de enum DiaSemana a nombres legibles
const diaNombreMap: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

interface HorarioOcupado {
  idAsignacion: number;
  diaSemana: DiaSemana;  // Volver a enum
  asignacion: {
    materia: {
      nombre: string;
    };
    profesor?: {
      persona: {
        apellido: string;
      };
    };
    curso?: {
      grado: string;
      seccion: string;
    };
  };
  horaInicio: string;
  horaFin: string;
}

interface HorarioMatrixProps {
  horarioProfesor: HorarioOcupado[];
  horarioCurso: HorarioOcupado[];
  turno: Turno;
  loading: boolean;
  onSlotSelect: (dia: DiaSemana, hora: string) => void;
  selectedSlots: { dia: DiaSemana, hora: string }[];
  idAsignacionActual?: number;
  diasHabiles: DiaHabil[];
  bloquesHorario: BloqueHorario[];
}

export default function HorarioMatrix({ horarioProfesor, horarioCurso, turno, loading, onSlotSelect, selectedSlots, idAsignacionActual, diasHabiles, bloquesHorario }: HorarioMatrixProps) {

  const dias = diasHabiles.map(d => d.nombre);

  const getHorasBase = useCallback(() => {
    const bloquesTurno = bloquesHorario.filter(b => b.turno.toUpperCase() === turno.toUpperCase());
    return bloquesTurno.map(b => `${b.horaInicio} - ${b.horaFin}`);
  }, [bloquesHorario, turno]);

  const horasBase = useMemo(() => getHorasBase(), [getHorasBase]);

  const [horas, setHoras] = useState(horasBase);

  useEffect(() => {
    setHoras(horasBase);
  }, [horasBase]);

  useEffect(() => {
    if (selectedSlots.length === 0) return;

    setHoras((prevHoras) => {
      const newHoras = [...prevHoras];
      let changed = false;

      selectedSlots.forEach((slot) => {
        if (newHoras.includes(slot.hora)) return;

        const slotStart = parseInt(slot.hora.split(":")[0]);
        const matchIndex = horasBase.findIndex((def) => Math.abs(parseInt(def.split(":")[0]) - slotStart) < 2);

        if (matchIndex !== -1 && newHoras[matchIndex] !== slot.hora) {
          newHoras[matchIndex] = slot.hora;
          changed = true;
        }
      });

      return changed ? newHoras : prevHoras;
    });
  }, [selectedSlots, horasBase]);

  if (loading) {
    return (
      <div className="mt-4 p-4 border rounded-md bg-gray-50 text-center text-gray-500">
        Cargando horario...
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 border rounded-md bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Selecciona los bloques horarios
        </h3>
        
        {/* Leyenda de colores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-md text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 border rounded"></div>
            <span className="text-gray-700">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-400 border rounded"></div>
            <span className="text-gray-700">Profesor ocupado en otro curso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-400 border rounded"></div>
            <span className="text-gray-700">Curso ocupado por otro profesor</span>
          </div>
        </div>
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `auto repeat(${dias.length}, 1fr)` }}>
        <div className="font-bold text-center text-gray-700">Hora</div>
        {dias.map((dia) => (
          <div key={dia} className="font-bold text-center text-xs text-gray-700">
            {diaNombreMap[dia]}
          </div>
        ))}

        {horas.map((hora, i) => (
          <React.Fragment key={i}>
            <div className="font-bold text-center text-xs text-gray-700 flex items-center justify-center px-1 py-2">
              {hora}
            </div>
            {dias.map((dia, j) => {
              const [horaInicio, horaFin] = hora.split(" - ");
              
              // Convertir a minutos para comparar
              const [newHInicio, newMInicio] = horaInicio.split(":").map(Number);
              const [newHFin, newMFin] = horaFin.split(":").map(Number);
              const nuevoInicioMinutos = newHInicio * 60 + newMInicio;
              const nuevoFinMinutos = newHFin * 60 + newMFin;
              
              // Verificar si hay ocupación por el profesor en otro curso
              const ocupadoPorProfesor = horarioProfesor.find((h) => {
                if (h.diaSemana !== dia) return false;
                
                const [hInicio, mInicio] = h.horaInicio.split(":").map(Number);
                const [hFin, mFin] = h.horaFin.split(":").map(Number);
                
                const inicioMinutos = hInicio * 60 + mInicio;
                const finMinutos = hFin * 60 + mFin;
                
                // Verificar solapamiento
                const hayInterseccion = !(nuevoFinMinutos <= inicioMinutos || nuevoInicioMinutos >= finMinutos);
                return hayInterseccion;
              });
              
              // Verificar si hay ocupación en este curso (por cualquier profesor)
              const ocupadoEnCurso = horarioCurso.find((h) => {
                if (h.diaSemana !== dia) return false;
                
                const [hInicio, mInicio] = h.horaInicio.split(":").map(Number);
                const [hFin, mFin] = h.horaFin.split(":").map(Number);
                
                const inicioMinutos = hInicio * 60 + mInicio;
                const finMinutos = hFin * 60 + mFin;
                
                // Verificar solapamiento
                const hayInterseccion = !(nuevoFinMinutos <= inicioMinutos || nuevoInicioMinutos >= finMinutos);
                return hayInterseccion;
              });

              const isSelected = selectedSlots.some(slot => slot.dia === dia && slot.hora === hora);
              
              // Determinar el estado del bloque
              let bloqueEstado: 'disponible' | 'ocupadoProfesor' | 'ocupadoCurso' = 'disponible';
              let datosOcupacion = null;
              
              if (ocupadoPorProfesor && ocupadoPorProfesor.idAsignacion !== idAsignacionActual) {
                bloqueEstado = 'ocupadoProfesor';
                datosOcupacion = ocupadoPorProfesor;
              } else if (ocupadoEnCurso && ocupadoEnCurso.idAsignacion !== idAsignacionActual) {
                bloqueEstado = 'ocupadoCurso';
                datosOcupacion = ocupadoEnCurso;
              }

              const colores = {
                disponible: isSelected ? "bg-indigo-600 text-white" : "bg-gray-100 hover:bg-gray-200",
                ocupadoProfesor: "bg-red-400 text-white cursor-not-allowed",
                ocupadoCurso: "bg-orange-400 text-white cursor-not-allowed",
              };

              const esClicable = bloqueEstado === 'disponible';

              return (
                <div
                  key={`${i}-${j}`}
                  className={`border rounded-md p-2 text-center text-xs cursor-pointer ${colores[bloqueEstado]}`}
                  onClick={() => esClicable && onSlotSelect(dia, hora)}
                  title={
                    bloqueEstado === 'ocupadoProfesor' 
                      ? `Profesor ocupado: ${datosOcupacion!.asignacion.materia.nombre} en ${datosOcupacion!.asignacion.curso?.grado}°${datosOcupacion!.asignacion.curso?.seccion}`
                      : bloqueEstado === 'ocupadoCurso'
                      ? `Curso ocupado: ${datosOcupacion!.asignacion.materia.nombre} con ${datosOcupacion!.asignacion.profesor?.persona.apellido}`
                      : ""
                  }
                >
                  {bloqueEstado === 'ocupadoProfesor' ? (
                    <div>
                      <p className="font-bold text-xs">PROFESOR OCUPADO</p>
                      <p className="font-semibold">{datosOcupacion!.asignacion.materia.nombre}</p>
                      <p>{datosOcupacion!.asignacion.curso?.grado}°{datosOcupacion!.asignacion.curso?.seccion}</p>
                      <p className="text-xs mt-1">{datosOcupacion!.horaInicio} - {datosOcupacion!.horaFin}</p>
                    </div>
                  ) : bloqueEstado === 'ocupadoCurso' ? (
                    <div>
                      <p className="font-bold text-xs">CURSO OCUPADO</p>
                      <p className="font-semibold">{datosOcupacion!.asignacion.materia.nombre}</p>
                      <p>{datosOcupacion!.asignacion.profesor?.persona.apellido}</p>
                      <p className="text-xs mt-1">{datosOcupacion!.horaInicio} - {datosOcupacion!.horaFin}</p>
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
