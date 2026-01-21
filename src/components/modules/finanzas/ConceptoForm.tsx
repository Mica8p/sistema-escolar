"use client";

import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { createConceptoDePago } from "@/service/finanzas.service";

type FormValues = {
  nombre: string;
  descripcion: string;
  montoFijo: number | string;
};

export function ConceptoForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      montoFijo: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await createConceptoDePago({
          nombre: data.nombre,
          descripcion: data.descripcion,
          montoFijo: Number(data.montoFijo) || 0,
        });
        reset();
      } catch (error) {
        console.error(error);
        alert("Ocurrió un error al guardar el concepto.");
      }
    });
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Nuevo Concepto</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nombre" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900">
              Nombre
            </label>
            <input
              id="nombre"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
              placeholder="Ej: Cuota Mensual"
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="descripcion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900">
              Descripción
            </label>
            <input
              id="descripcion"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
              placeholder="Opcional"
              {...register("descripcion")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="montoFijo" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900">
              Monto Fijo
            </label>
            <input
              id="montoFijo"
              type="number"
              step="0.01"
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
              {...register("montoFijo")}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700 h-10 px-4 py-2 w-full shadow-sm"
          >
            {isPending ? "Guardando..." : "Guardar Concepto"}
          </button>
        </form>
      </div>
    </div>
  );
}