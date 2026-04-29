'use client';

import { useState } from 'react';
import { crearAdminNuevo, crearAdminConPersona } from '@/lib/actions/usuario-actions';
import { toast } from 'sonner';
import { Plus, AlertCircle } from 'lucide-react';

interface Persona {
  idPersona: number;
  nombre: string;
  apellido: string;
  email: string | null;
  dni: string;
}

interface Props {
  personas: Persona[];
}

type FormMode = 'existing' | 'new';
type RoleOption = 'ADMIN' | 'SUPER_ADMIN';

export default function CrearAdminForm({ personas }: Props) {
  const [mode, setMode] = useState<FormMode>('new');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption>('ADMIN');

  // Para modo "de persona existente"
  const [selectedPersona, setSelectedPersona] = useState('');

  // Para modo "crear nueva persona + admin"
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');

  const handleSubmitExisting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPersona) {
      toast.error('Selecciona una persona');
      return;
    }

    setLoading(true);
    try {
      // Obtener el DNI de la persona seleccionada
      const persona = personas.find(p => p.idPersona.toString() === selectedPersona);
      if (!persona) {
        toast.error('Persona no encontrada');
        setLoading(false);
        return;
      }

      // Usar el DNI como contraseña y el rol seleccionado
      const result = await crearAdminNuevo(parseInt(selectedPersona), persona.dni, selectedRole);

      if (result.success) {
        toast.success(`Admin creado correctamente: ${result.personaNombre}`);
        setSelectedPersona('');
      } else {
        toast.error(result.message || 'Error al crear admin');
      }
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear admin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !apellido || !email || !dni) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    setLoading(true);
    try {
      // Usar el DNI como contraseña y el rol seleccionado
      const result = await crearAdminConPersona(
        nombre,
        apellido,
        email,
        dni,
        dni, // Usar DNI como contraseña
        selectedRole
      );

      if (result.success) {
        toast.success(`Admin creado correctamente: ${result.personaNombre}`);
        // Reset form
        setNombre('');
        setApellido('');
        setEmail('');
        setDni('');
      } else {
        toast.error(result.message || 'Error al crear admin');
      }
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear admin';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de modo */}
      <div className="flex gap-4 border-b border-slate-200 pb-4">
        
        {personas.length > 0 && (
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === 'existing'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            👤 De Persona Existente
          </button>
        )}
      </div>

      {/* MODO 1: Crear Persona + Admin */}
      {mode === 'new' && (
        <form onSubmit={handleSubmitNew} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>ℹ️ Crear nuevo admin:</strong> Ingresa los datos de la persona. La contraseña inicial será su DNI.
            </div>
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Rol del Admin *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={selectedRole === 'ADMIN'}
                  onChange={(e) => setSelectedRole(e.target.value as RoleOption)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 font-medium">ADMIN</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="SUPER_ADMIN"
                  checked={selectedRole === 'SUPER_ADMIN'}
                  onChange={(e) => setSelectedRole(e.target.value as RoleOption)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 font-medium">SUPER_ADMIN</span>
              </label>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-slate-900"> Datos Personales</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: Pérez"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                DNI * (8 números)
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => {
                  const valor = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                  setDni(valor);
                }}
                placeholder="Ej: 12345678"
                maxLength={8}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                ℹ️ El DNI será la contraseña inicial
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@escuela.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Botón submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
            >
              <Plus size={18} />
              {loading ? 'Creando...' : 'Crear Admin'}
            </button>
          </div>
        </form>
      )}

      {/* MODO 2: Usar Persona Existente */}
      {mode === 'existing' && (
        <form onSubmit={handleSubmitExisting} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>ℹ️ Asignar rol de admin:</strong> Selecciona una persona existente. La contraseña inicial será su DNI.
            </div>
          </div>

          {/* Selector de Rol */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Rol del Admin *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={selectedRole === 'ADMIN'}
                  onChange={(e) => setSelectedRole(e.target.value as RoleOption)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 font-medium">ADMIN</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="SUPER_ADMIN"
                  checked={selectedRole === 'SUPER_ADMIN'}
                  onChange={(e) => setSelectedRole(e.target.value as RoleOption)}
                  disabled={loading}
                  className="w-4 h-4"
                />
                <span className="text-slate-700 font-medium"> SUPER_ADMIN</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Selecciona Persona
            </label>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">-- Selecciona una persona --</option>
              {personas.map((p) => (
                <option key={p.idPersona} value={p.idPersona}>
                  {p.nombre} {p.apellido} (DNI: {p.dni}) - {p.email || 'Sin email'}
                </option>
              ))}
            </select>
          </div>

          {/* Botón submit */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
            >
              <Plus size={18} />
              {loading ? 'Creando...' : 'Crear Admin'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
