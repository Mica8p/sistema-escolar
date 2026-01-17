"use client";

import { useState } from "react";
import { Settings, CalendarDays, ChevronDown, Check, Edit, School, Book } from "lucide-react";
import { cambiarCiclo } from "@/lib/actions/ciclo-actions";
import type { CicloLectivo } from "@prisma/client";
import Link from "next/link";

interface Props {
  ciclos: CicloLectivo[];
  cicloActual: number;
}

export function ConfiguracionesButton({ ciclos, cicloActual }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCicloChange = async (idCiclo: number) => {
    if (idCiclo === cicloActual) return;
    setLoading(true);
    await cambiarCiclo(idCiclo);
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Settings className="w-4 h-4 text-gray-500" />
        <span>Configuraciones</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay invisible para cerrar al hacer click fuera */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 z-20 w-64 mt-2 origin-top-right bg-white rounded-xl shadow-xl ring-1 ring-black/5 focus:outline-none animate-in fade-in zoom-in-95 duration-100">
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ciclo Lectivo
              </div>
              
              {ciclos.map((ciclo) => (
                <button
                  key={ciclo.idCiclo}
                  onClick={() => handleCicloChange(ciclo.idCiclo)}
                  disabled={loading}
                  className={`flex items-center w-full px-4 py-2.5 text-sm text-left transition-colors ${
                    ciclo.idCiclo === cicloActual
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <CalendarDays className={`w-4 h-4 mr-3 ${ciclo.idCiclo === cicloActual ? "text-indigo-600" : "text-gray-400"}`} />
                  <span>{ciclo.anio}</span>
                  {ciclo.estado && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Actual</span>}
                  
                  {ciclo.idCiclo === cicloActual && (
                    <Check className="w-4 h-4 ml-auto text-indigo-600" />
                  )}
                </button>
              ))}

              <div className="border-t border-gray-100 my-2"></div>
              
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Configuración General
              </div>

              <Link
                href="/dashboard/ciclos"
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Edit className="w-4 h-4 mr-3 text-gray-400" />
                <span>Administrar Ciclos</span>
              </Link>
              
              <Link
                href="/dashboard/cursos"
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <School className="w-4 h-4 mr-3 text-gray-400" />
                <span>Administrar Cursos</span>
              </Link>

              <Link
                href="/dashboard/materias"
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Book className="w-4 h-4 mr-3 text-gray-400" />
                <span>Administrar Materias</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}