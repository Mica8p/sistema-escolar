'use client';

import { useState } from 'react';
import { cederSuperAdmin, desactivarSuperAdmin, obtenerSuperAdmins } from '@/lib/actions/super-admin-actions';
import { toast } from 'sonner';
import { Key, AlertTriangle, Users, LogOut } from 'lucide-react';

export default function GestionSuperAdminModal() {
  const [modo, setModo] = useState<'menu' | 'ceder' | 'desactivar' | 'lista'>('menu');
  const [loading, setLoading] = useState(false);
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);

  const handleCeder = async (formData: FormData) => {
    setLoading(true);
    const result = await cederSuperAdmin(null, formData);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setModo('menu');
    } else {
      toast.error(result.error || 'Error al ceder el control');
    }
  };

  const handleDesactivar = async () => {
    if (!selectedAdmin) return;

    if (!confirm('⚠️ ¿Estás seguro? Esta acción desactivará el super admin.')) {
      return;
    }

    setLoading(true);
    const result = await desactivarSuperAdmin(selectedAdmin);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      setModo('lista');
      cargarSuperAdmins();
    } else {
      toast.error(result.error || 'Error al desactivar');
    }
  };

  const cargarSuperAdmins = async () => {
    const result = await obtenerSuperAdmins();
    if (result.success) {
      setSuperAdmins(result.superAdmins);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-linear-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Key size={28} />
            Gestión de Super Admin
          </h2>
          <p className="text-indigo-100 text-sm mt-1">Cede el control o desactiva super admins</p>
        </div>

        {/* CONTENIDO */}
        <div className="p-8">
          
          {/* MENU PRINCIPAL */}
          {modo === 'menu' && (
            <div className="space-y-4">
              <p className="text-slate-600 mb-6">¿Qué deseas hacer?</p>
              
              <button
                onClick={() => setModo('ceder')}
                className="w-full bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 p-6 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-indigo-900 flex items-center gap-2">
                      <LogOut size={18} />
                      Ceder Control
                    </h3>
                    <p className="text-sm text-indigo-700 mt-1">Transfiere el super admin a otra persona</p>
                  </div>
                  <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setModo('lista');
                  cargarSuperAdmins();
                }}
                className="w-full bg-red-50 hover:bg-red-100 border-2 border-red-200 p-6 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-red-900 flex items-center gap-2">
                      <Users size={18} />
                      Desactivar Super Admin
                    </h3>
                    <p className="text-sm text-red-700 mt-1">Si el actual super admin no cedió su lugar</p>
                  </div>
                  <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
            </div>
          )}

          {/* CEDER CONTROL */}
          {modo === 'ceder' && (
            <form action={handleCeder} className="space-y-4">
              <p className="text-slate-700 font-semibold mb-4">
                Completa los datos del nuevo dueño del sistema:
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Nombre</label>
                <input
                  name="nombre"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: Juan"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Apellido</label>
                <input
                  name="apellido"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: López"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">DNI</label>
                <input
                  name="dni"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: 12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: propietario@sistema.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Contraseña del Super Admin Actual</label>
                <input
                  name="passwordActual"
                  type="password"
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ingresa tu contraseña actual para confirmar"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold mb-2">Contraseña del Nuevo Super Admin</p>
                <p className="text-xs text-blue-700">
                  La contraseña inicial será automáticamente el <strong>DNI</strong> del nuevo administrador.
                </p>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mt-6">
                <p className="text-sm text-amber-800">
                  <AlertTriangle className="inline mr-2" size={16} />
                  <strong>Advertencia:</strong> Tu cuenta será desactivada después de ceder el control. Deberás cerrar sesión.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModo('menu')}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Cediendo...' : 'Ceder Control'}
                </button>
              </div>
            </form>
          )}

          {/* LISTA DE SUPER ADMINS */}
          {modo === 'lista' && (
            <div className="space-y-4">
              <p className="text-slate-700 font-semibold mb-4">Super Admins Activos:</p>

              {superAdmins.length === 0 ? (
                <div className="bg-slate-50 p-6 rounded-xl text-center text-slate-600">
                  Cargando...
                </div>
              ) : (
                <div className="space-y-3">
                  {superAdmins.map((admin) => (
                    <div
                      key={admin.idUsuario}
                      className="bg-slate-50 p-4 rounded-xl flex justify-between items-start"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{admin.nombre}</p>
                        <p className="text-sm text-slate-600">DNI: {admin.dni}</p>
                        <p className="text-sm text-slate-600">{admin.email}</p>
                        {admin.esActual && (
                          <span className="inline-block mt-2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            TÚ (Actual)
                          </span>
                        )}
                      </div>
                      {!admin.esActual && (
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin.idUsuario);
                            setModo('desactivar');
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setModo('menu')}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Volver
                </button>
              </div>
            </div>
          )}

          {/* CONFIRMACIÓN DESACTIVAR */}
          {modo === 'desactivar' && (
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-900 font-bold flex items-start gap-2">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  ¿Desactivar este Super Admin?
                </p>
                <p className="text-red-800 text-sm mt-2">
                  Esta acción desactivará al super admin seleccionado. No podrá volver a iniciar sesión.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModo('lista')}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDesactivar}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Desactivando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
