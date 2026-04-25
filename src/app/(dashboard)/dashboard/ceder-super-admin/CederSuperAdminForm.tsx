"use client";

import { useActionState, useState, useEffect } from "react";
import { cederSuperAdmin } from "@/lib/actions/super-admin-actions";
import {
  User,
  Fingerprint,
  Mail,
  Save,
  Loader,
  Phone,
  Home,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

export default function CederSuperAdminForm() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [state, formAction, isPending] = useActionState(cederSuperAdmin, null);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success("¡SUPER_ADMIN transferido!", {
          description: state.message || "Control cedido exitosamente. El nuevo super admin ya puede acceder al sistema.",
          duration: 5000,
        });
      } else if (state.error) {
        toast.error("Error al transferir", {
          description: state.error,
        });
      }
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!accepted) {
      toast.error("Debes aceptar las advertencias", {
        description: "Marca la casilla para confirmar que entiendes las implicaciones.",
      });
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
      {/* Datos de la nueva persona */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User size={20} /> Datos de la Nueva Persona (Nuevo SUPER_ADMIN)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} /> Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                  setNombre(value);
                }
              }}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Juan"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User size={16} /> Apellido <span className="text-red-500">*</span>
            </label>
            <input
              name="apellido"
              type="text"
              required
              value={apellido}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(value)) {
                  setApellido(value);
                }
              }}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Pérez"
            />
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Fingerprint size={16} /> DNI <span className="text-red-500">*</span>
            </label>
            <input
              name="dni"
              type="text"
              required
              value={dni}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 8) {
                  setDni(value);
                }
              }}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: 12345678"
              minLength={7}
              maxLength={8}
            />
            <p className="text-xs text-slate-500">La contraseña inicial será el DNI</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Mail size={16} /> Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="ejemplo@email.com"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone size={16} /> Teléfono
            </label>
            <input
              name="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: 1234567890"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Home size={16} /> Dirección
            </label>
            <input
              name="direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Ej: Calle Principal 123"
            />
          </div>
        </div>
      </div>

      {/* Verificación de Identidad */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Fingerprint size={20} /> Verificación de Identidad
        </h3>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Fingerprint size={16} /> Contraseña del Super Admin Actual <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              name="passwordActual"
              type={showPasswordActual ? "text" : "password"}
              required
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
              placeholder="Ingresa tu contraseña actual para confirmar"
            />
            <button
              type="button"
              onClick={() => setShowPasswordActual(!showPasswordActual)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            >
              {showPasswordActual ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500">Se requiere para confirmar que eres el actual administrador</p>
        </div>
      </div>

      {/* Información de Contraseña del Nuevo Super Admin */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Contraseña del Nuevo Super Admin</h4>
            <p className="text-sm text-blue-800 mb-2">
              La contraseña inicial del nuevo administrador será automáticamente su <strong>DNI</strong>
            </p>
            <p className="text-sm text-blue-700">
              Ejemplo: Si el DNI es <code className="bg-blue-100 px-2 py-1 rounded">12345678</code>, la contraseña inicial será <code className="bg-blue-100 px-2 py-1 rounded">12345678</code>
            </p>
          </div>
        </div>
      </div>

      {/* Confirmación de irreversibilidad */}
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-red-900 mb-2">⚠️ ESTA ACCIÓN ES IRREVERSIBLE</h4>
            <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
              <li>Perderás acceso como SUPER_ADMIN inmediatamente</li>
              <li>La nueva persona ingresará con su DNI como contraseña temporal</li>
              <li>Al primer ingreso, aparecerá un modal para cambiar su contraseña</li>
              <li>Solo el nuevo SUPER_ADMIN podrá ceder a otro</li>
              <li>Serás desconectado automáticamente</li>
            </ul>
          </div>
        </div>

        <label className="flex items-center gap-3 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-semibold text-red-900">
            Entiendo que esta acción es irreversible y acepto las consecuencias
          </span>
        </label>
      </div>

      {/* Botón de envío */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending || !accepted}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader size={18} className="animate-spin" />
              Transfiriendo SUPER_ADMIN...
            </>
          ) : (
            <>
              <Save size={18} />
              Transferir Control
            </>
          )}
        </button>
      </div>
    </form>
  );
}
