"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";
import { crearCargoMasivo } from "@/service/finanzas.service";

const CreateDeudaSchema = z.object({
  alumnoId: z.coerce.number().positive("El ID del alumno es requerido."),
  conceptoId: z.coerce.number().positive("Debe seleccionar un concepto de pago."),
  monto: z.coerce.number().positive("El monto debe ser un número positivo."),
  fechaVencimiento: z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
    z.date({ message: "La fecha de vencimiento es requerida y debe ser válida." })
  ),
});

const CreateDeudaMasivaSchema = z.object({
  conceptoId: z.coerce.number().int().positive("Debe seleccionar un concepto."),
  monto: z.coerce.number().positive("El monto debe ser positivo."),
  fechaVencimiento: z.preprocess(
    (arg) => (typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg),
    z.date({ message: "Formato de fecha inválido." })
  ),
});

export type State = 
  | { errors: { alumnoId?: string[]; conceptoId?: string[]; monto?: string[]; fechaVencimiento?: string[]; }; message: string; }
  | { message: string; errors?: undefined; };


export async function createDeuda(prevState: State, formData: FormData): Promise<State> {
  const validatedFields = CreateDeudaSchema.safeParse({
    alumnoId: formData.get("alumnoId"),
    conceptoId: formData.get("conceptoId"),
    monto: formData.get("monto"),
    fechaVencimiento: formData.get("fechaVencimiento"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos inválidos. Revisá los datos ingresados.",
    };
  }

  const { alumnoId, conceptoId, monto, fechaVencimiento } = validatedFields.data;

  try {
    const cicloId = await getCicloActual();

    if (!cicloId) {
      return {
        errors: {},
        message: "No se pudo determinar el ciclo lectivo actual. Verificá la configuración.",
      };
    }

    const ciclo = await db.cicloLectivo.findUnique({
      where: { idCiclo: cicloId },
    });

    if (!ciclo) {
      return {
        errors: {},
        message: "El ciclo lectivo actual no es válido. Por favor, seleccioná uno nuevo.",
      };
    }

    await db.cargo.create({
      data: {
        alumnoId,
        conceptoId,
        monto,
        fechaVencimiento,
        cicloId,
        estado: "Pendiente",
      },
    });

    revalidatePath(`/dashboard/finanzas/${alumnoId}`);
    revalidatePath(`/dashboard/finanzas`);

    return {
      message: "Deuda creada exitosamente.",
      errors: {}
    };

  } catch (error) {
    console.error("❌ ERROR AL CREAR DEUDA:", error);
    return {
      message: "Error de servidor: No se pudo registrar la deuda.",
      errors: {},
    };
  }
}

export async function generarDeudaMasiva(prevState: State, formData: FormData) {
  const validatedFields = CreateDeudaMasivaSchema.safeParse({
    conceptoId: formData.get("conceptoId"),
    monto: formData.get("monto"),
    fechaVencimiento: new Date(formData.get("fechaVencimiento") as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Datos inválidos para la generación masiva.",
    };
  }

  const { conceptoId, monto, fechaVencimiento } = validatedFields.data;

  try {
    const cicloId = await getCicloActual();
    if (!cicloId) throw new Error("No hay ciclo lectivo activo.");

    const result = await crearCargoMasivo(cicloId, conceptoId, monto, fechaVencimiento);

    if (result.count === 0) {
      return { message: "No se encontraron alumnos activos para generar la deuda." };
    }
  } catch (error) {
    console.error(error);
    return { message: "Error al generar las deudas masivas.", errors: {} };
  }

  revalidatePath("/dashboard/finanzas");
  return {
    message: "Deudas generadas exitosamente para todos los alumnos.",
  };
}
