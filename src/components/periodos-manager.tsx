'use client';

import { useFormStatus } from 'react-dom';
import { createPeriodoAction, getPeriodosByCiclo, deletePeriodoAction } from '@/lib/actions/periodo-actions';
import { getAllCiclos } from '@/lib/actions/ciclo-actions';
import { PeriodoNombre } from '@prisma/client';
import { useActionState, useEffect, useState } from 'react';
import { PeriodoAcademico, CicloLectivo } from '@prisma/client';

// Sub-component for the submit button to show loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300">
      {pending ? 'Creando...' : 'Crear Periodo'}
    </button>
  );
}

// Client component for the delete button
function DeletePeriodoButton({ idPeriodo }: { idPeriodo: number }) {
    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que quieres eliminar este periodo?')) {
            const result = await deletePeriodoAction(idPeriodo);
            if (result.success) {
                alert('Periodo eliminado correctamente.');
                window.location.reload(); // Simple reload to refresh the list
            } else {
                alert(`Error al eliminar el periodo: ${result.message}`);
            }
        }
    };

    return (
        <button onClick={handleDelete} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
            Eliminar
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
  const [periodos, setPeriodos] = useState<PeriodoAcademico[]>([]);

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
  }, [selectedCiclo, state]); // Re-fetch when selectedCiclo changes or a new period is created/deleted

  useEffect(() => {
    if (state.message && !state.success) {
      alert(state.message);
    } else if (state.message && state.success) {
        alert(state.message);
        // Optionally, re-fetch periods or clear form after successful creation
        // This is handled by state dependency in fetchPeriodos useEffect, but can be explicit
    }
  }, [state]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Periodos Académicos</h1>

      <div className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Crear Nuevo Periodo Académico</h2>
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="idCiclo" className="block text-sm font-medium text-gray-700">
              Ciclo Lectivo
            </label>
            <select
              id="idCiclo"
              name="idCiclo"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre del Periodo
            </label>
            <select
              id="nombre"
              name="nombre"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              {Object.values(PeriodoNombre).map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700">
              Fecha de Fin
            </label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <SubmitButton />
        </form>
      </div>

      <div className="p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Periodos Existentes para Ciclo: {selectedCiclo ? ciclos.find(c => c.idCiclo === selectedCiclo)?.anio : 'Ninguno'}</h2>
        {periodos.length === 0 ? (
          <p>No hay periodos académicos para este ciclo.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {periodos.map((periodo) => (
                <tr key={periodo.idPeriodo}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{periodo.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(periodo.fechaInicio)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(periodo.fechaFin)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DeletePeriodoButton idPeriodo={periodo.idPeriodo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
