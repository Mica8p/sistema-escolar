"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createPersonaAction,
  updatePersonaAction
} from "@/lib/actions/persona-actions";
import {
    User,
    Fingerprint,
    Mail,
    Shield,
    Save,
    X,
    Phone,
    Home,
    Users
} from "lucide-react";
import { toast } from "sonner";

interface PersonaFormProps {
    roles: Array<{ idRol: number; nombre: string }>;
    initialData?: {
        idPersona: number;
        nombre?: string;
        apellido?: string;
        dni?: string;
        telefono?: string | null;
        email?: string | null;
        direccion?: string | null;
    };
    alumnos?: Array<{
        idAlumno: number;
        persona: { apellido: string; nombre: string };
    }>;
}

export default function PersonaForm({ roles, initialData, alumnos = [] }: PersonaFormProps) {
    const router = useRouter();
    const [nombre, setNombre] = useState(initialData?.nombre ?? "");
    const [apellido, setApellido] = useState(initialData?.apellido ?? "");
    const [dni, setDni] = useState(initialData?.dni ?? "");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedHijos, setSelectedHijos] = useState<number[]>([]);
    const [searchHijos, setSearchHijos] = useState("");

    const updateActionWithId = initialData 
        ? updatePersonaAction.bind(null, initialData.idPersona)
        : null;
    
    const formHandler = initialData ? updateActionWithId! : createPersonaAction;

    const [state, formAction, isPending] = useActionState(
        formHandler,
        null
    );

useEffect(() => {
    if (state) {
        if (state.success) {
            toast.success(state.message || "Persona guardada correctamente", {
                description: "Los datos se actualizaron en la base de datos.",
                duration: 4000,
            });

            const timer = setTimeout(() => {
                router.push("/dashboard/personas");
                router.refresh();
            }, 1500);

            return () => clearTimeout(timer);

        } else if (!state.success && state.message) {
            toast.error("Hubo un problema", {
                description: state.message,
            });
        }
    }
}, [state, router]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(e.target.value);
        setSelectedHijos([]);
    };

    const toggleHijo = (idAlumno: number) => {
        setSelectedHijos(prev => 
            prev.includes(idAlumno) 
                ? prev.filter(id => id !== idAlumno)
                : [...prev, idAlumno]
        );
    };

    const filteredAlumnos = alumnos.filter(alumno =>
        searchHijos === "" || 
        `${alumno.persona.apellido} ${alumno.persona.nombre}`.toLowerCase().includes(searchHijos.toLowerCase())
    );

    const isPadreRole = selectedRole && roles.find(r => r.idRol === Number(selectedRole))?.nombre === "PADRE";

    return (
        <form action={formAction} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User size={16} /> Nombre
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

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <User size={16} /> Apellido
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
            </div>

            {/* SECCIÓN: IDENTIFICACIÓN Y CONTACTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Fingerprint size={16} /> DNI
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
                        maxLength={8}
                        inputMode="numeric"
                        className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Solo números"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Mail size={16} /> Correo Electrónico
                    </label>
                    <input
                        name="email"
                        type="email"
                        required
                        defaultValue={initialData?.email ?? ""}
                        className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="correo@ejemplo.com"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Phone size={16} /> Teléfono
                    </label>
                    <input
                        name="telefono"
                        type="text"
                        defaultValue={initialData?.telefono ?? ""}
                        className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ej: 1122334455"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Home size={16} /> Dirección
                    </label>
                    <input
                        name="direccion"
                        type="text"
                        defaultValue={initialData?.direccion ?? ""}
                        className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ej: Av. Corrientes 1234"
                    />
                </div>
            </div>

            {!initialData && (
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Shield size={16} /> Rol en el Sistema
                    </label>
                    <select
                        name="idRol"
                        value={selectedRole}
                        onChange={handleRoleChange}
                        required
                        className="w-full rounded-lg border border-slate-300 p-2.5 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="">Seleccioná un rol...</option>
                        {roles.map((rol) => (
                            <option key={rol.idRol} value={rol.idRol}>
                                {rol.nombre}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {isPadreRole && alumnos.length > 0 && (
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Users size={16} className="text-blue-600" /> Hijos (Opcional)
                    </label>
                    <p className="text-xs text-slate-600 italic">Seleccioná los alumnos que son hijos de este padre</p>
                    
                    {/* Buscador */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar alumno por nombre o apellido..."
                            value={searchHijos}
                            onChange={(e) => setSearchHijos(e.target.value)}
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white text-black text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Lista de alumnos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {filteredAlumnos.length > 0 ? (
                            filteredAlumnos.map((alumno) => (
                                <label key={alumno.idAlumno} className="flex items-center gap-2 p-2 hover:bg-blue-100 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedHijos.includes(alumno.idAlumno)}
                                        onChange={() => toggleHijo(alumno.idAlumno)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700 font-medium">
                                        {alumno.persona.apellido}, {alumno.persona.nombre}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="col-span-2 text-center text-sm text-slate-500 py-4">No se encontraron alumnos</p>
                        )}
                    </div>
                    
                    {/* Contador de seleccionados */}
                    {selectedHijos.length > 0 && (
                        <p className="text-xs text-blue-600 font-semibold">
                            {selectedHijos.length} {selectedHijos.length === 1 ? 'hijo' : 'hijos'} seleccionado{selectedHijos.length === 1 ? '' : 's'}
                        </p>
                    )}
                    
                    {selectedHijos.map(idAlumno => (
                        <input key={`hijo-${idAlumno}`} type="hidden" name={`hijos`} value={idAlumno} />
                    ))}
                </div>
            )}

            {state?.success === false && state?.message && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                    {state.message}
                </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">

                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <X size={18} />
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isPending}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    <Save size={18} />
                    {isPending
                        ? "Procesando..."
                        : initialData
                            ? "Actualizar Datos"
                            : "Registrar Persona"}
                </button>
            </div>
        </form>
    );
}