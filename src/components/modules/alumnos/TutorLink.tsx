"use client";

import { useState, useEffect, useTransition } from 'react';
import { vincularPadre, desvincularPadre } from '@/lib/actions/alumno-actions';
import { getTutoresDisponiblesAction } from '@/lib/actions/persona-actions';
import { Trash2 } from 'lucide-react';

type PadreRelacion = {
  padre: {
    idPadre: number;
    persona: {
      nombre: string;
      apellido: string;
      dni: string;
    };
  };
  relacion: string;
};

type AlumnoExtendido = {
  idAlumno: number;
  padres: PadreRelacion[];
};

type TutorDisponible = {
    idPersona: number;
    nombre: string;
    apellido: string;
    dni: string;
    padre: {
        idPadre: number;
    } | null;
};


export default function TutorLink({ alumno }: { alumno: AlumnoExtendido }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tutores, setTutores] = useState<TutorDisponible[]>([]);
  const [selectedTutor, setSelectedTutor] = useState('');
  const [relacion, setRelacion] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  useEffect(() => {
    if (isModalOpen) {
      const fetchTutores = async () => {
        const data = await getTutoresDisponiblesAction(alumno.idAlumno);
        setTutores(data);
      };
      fetchTutores();
    }
  }, [isModalOpen, alumno.idAlumno]);

  const handleOpenModal = () => {
    setSuccess(null);
    setError(null);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
      setIsModalOpen(false);
      setError(null);
      setSuccess(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedTutor || !relacion) {
      setError("Por favor, seleccione un tutor y especifique la relación.");
      return;
    }

    startTransition(async () => {
      const result = await vincularPadre(alumno.idAlumno, Number(selectedTutor), relacion);
      if (result.success) {
        setSuccess(result.message);
        handleCloseModal();
      } else {
        setError(result.message);
      }
    });
  };

  const handleDelete = (idPadre: number) => {
    if (!confirm("¿Estás seguro de que querés eliminar este vínculo?")) return;

    startTransition(async () => {
      const result = await desvincularPadre(alumno.idAlumno, idPadre);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Padres / Tutores</h2>
        <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold">
          Vincular Tutor
        </button>
      </div>
      
      {!isModalOpen && (success || error) && (
        <div className={`mb-4 p-3 rounded-md text-sm ${success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {success || error}
        </div>
      )}

      {alumno.padres.length > 0 ? (
        <ul className="space-y-3">
          {alumno.padres.map((relacion) => (
            <li key={relacion.padre.idPadre} className="p-3 rounded-md border border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">{relacion.padre.persona.apellido}, {relacion.padre.persona.nombre}</p>
                <p className="text-sm text-gray-500">{relacion.relacion}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">DNI: {relacion.padre.persona.dni}</span>
                <button
                  onClick={() => handleDelete(relacion.padre.idPadre)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="Eliminar vínculo"
                  disabled={isPending}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">No hay tutores vinculados a este alumno.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Vincular Nuevo Tutor</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tutor" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Persona</label>
                  <select
                    id="tutor"
                    value={selectedTutor}
                    onChange={(e) => setSelectedTutor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">-- Seleccione un tutor --</option>
                    {tutores.map((tutor) => (
                      <option key={tutor.idPersona} value={tutor.idPersona}>
                        {tutor.apellido}, {tutor.nombre} (DNI: {tutor.dni})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="relacion" className="block text-sm font-medium text-gray-700 mb-1">Relación / Parentesco</label>
                  <input
                    type="text"
                    id="relacion"
                    value={relacion}
                    onChange={(e) => setRelacion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Ej: Madre, Padre, Tutor Legal"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {success && <p className="mt-4 text-sm text-green-600">{success}</p>}


              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                  {isPending ? 'Vinculando...' : 'Guardar Vínculo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
