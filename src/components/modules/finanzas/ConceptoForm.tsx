"use client";

import { useForm } from "react-hook-form";
import { useTransition, useEffect } from "react";
import { createConceptoAction, updateConceptoAction } from "@/lib/actions/finanzas-actions";
import { ConceptoDePagoData } from "@/service/finanzas.service";
import { toast } from "sonner";
import { Tag, FileText, DollarSign, Loader2, Save } from "lucide-react";
import { ConceptoDePago } from "@prisma/client";

type FormValues = {
  nombre: string;
  descripcion: string;
  montoFijo: number | string;
  fechaVencimiento: string;
};

export function ConceptoForm({ conceptoAEditar, onCancel, esElCicloActivo = true }: { conceptoAEditar?: ConceptoDePago, onCancel?: () => void, esElCicloActivo?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!conceptoAEditar;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { nombre: "", descripcion: "", montoFijo: "", fechaVencimiento: "" }
  });

  useEffect(() => {
    if (conceptoAEditar) {
      reset({
        nombre: conceptoAEditar.nombre,
        descripcion: conceptoAEditar.descripcion || "",
        montoFijo: conceptoAEditar.montoFijo || "",
        fechaVencimiento: conceptoAEditar.fechaVencimiento ? new Date(conceptoAEditar.fechaVencimiento).toISOString().split('T')[0] : ""
      });
    } else {
      reset({ nombre: "", descripcion: "", montoFijo: "", fechaVencimiento: "" });
    }
  }, [conceptoAEditar, reset]);

  const onSubmit = (data: FormValues) => {
  startTransition(async () => {
    try {
      const dataFormateada: ConceptoDePagoData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        montoFijo: data.montoFijo ? Number(data.montoFijo) : 0,
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined
      };

      let res;
      if (isEditing) {
        res = await updateConceptoAction(conceptoAEditar.id, dataFormateada);
      } else {
        res = await createConceptoAction(dataFormateada);
      }

      if (res.success) {
        toast.success(isEditing ? "Concepto actualizado" : "Concepto creado");
        reset();
        onCancel?.();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    }
  });
};

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50">
        <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase">
          Nuevo Concepto
        </h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
          Definí un cargo para los alumnos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
        {/* CAMPO: NOMBRE */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Nombre del Concepto
          </label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              id="nombre"
              className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 rounded-2xl text-sm text-slate-700 font-bold outline-none transition-all ${
                errors.nombre ? "border-red-100 focus:border-red-500" : "border-slate-50 focus:bg-white focus:border-indigo-500"
              }`}
              placeholder="Ej: Cuota Marzo 2026"
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
          </div>
          {errors.nombre && (
            <p className="text-[10px] font-bold text-red-500 ml-2 uppercase animate-pulse">
              {errors.nombre.message}
            </p>
          )}
        </div>

        {/* CAMPO: DESCRIPCIÓN */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Descripción (Opcional)
          </label>
          <div className="relative group">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              id="descripcion"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm text-slate-700 font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
              placeholder="Detalles adicionales..."
              {...register("descripcion")}
            />
          </div>
        </div>

        {/* CAMPO: MONTO FIJO */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Monto Estimado
          </label>
          <div className="relative group">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              id="montoFijo"
              type="number"
              step="0.01"
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm text-slate-700 font-black outline-none focus:bg-white focus:border-indigo-500 transition-all"
              placeholder="0.00"
              {...register("montoFijo")}
            />
          </div>
        </div>

        {/* CAMPO: FECHA DE VENCIMIENTO */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
            Vencimiento de la cuota
          </label>
          <div className="relative group">
            <input
              id="fechaVencimiento"
              type="date"
              className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border-2 border-slate-50 rounded-2xl text-sm text-slate-700 font-black outline-none focus:bg-white focus:border-indigo-500 transition-all"
              {...register("fechaVencimiento")}
            />
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <button
          type="submit"
          disabled={isPending || !esElCicloActivo}
          className="relative w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:scale-100 overflow-hidden mt-4"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save size={14} />
              {esElCicloActivo ? "Guardar Concepto" : "Solo disponible en ciclo activo"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}