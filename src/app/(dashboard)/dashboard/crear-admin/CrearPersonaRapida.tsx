'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { createPersonaAction } from '@/lib/actions/persona-actions';

interface Props {
  onPersonaCreated?: () => void;
  adminRoleId: number;
}

export default function CrearPersonaRapida({ onPersonaCreated, adminRoleId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !dni.trim()) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('apellido', apellido);
      formData.append('dni', dni);
      formData.append('email', email);
      formData.append('idRol', adminRoleId.toString());

      const result = await createPersonaAction(null, formData);

      if (result?.success) {
        toast.success(`Persona creada: ${nombre} ${apellido}`);
        
        // Reset form
        setNombre('');
        setApellido('');
        setDni('');
        setEmail('');
        setShowForm(false);

        // Recargar página para actualizar lista
        if (onPersonaCreated) {
          onPersonaCreated();
        } else {
          window.location.reload();
        }
      } else {
        toast.error(result?.message || 'Error al crear persona');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Error al crear persona');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        Crear Nueva Persona (con rol ADMIN)
      </button>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Crear Nueva Persona con rol ADMIN</h3>
        <button
          onClick={() => setShowForm(false)}
          className="p-1 hover:bg-blue-100 rounded transition"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Juan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">DNI *</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: juan@ejemplo.com"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear Persona'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
