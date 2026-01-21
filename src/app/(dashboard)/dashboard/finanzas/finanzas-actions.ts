"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/lib/db";
import { getCicloActual } from "@/lib/ciclo-session";
import { crearCargoMasivo } from "@/service/finanzas.service";

// Esquema de validación para una nueva deuda (Cargo)
const CreateDeudaSchema = z.object({
  alumnoId: z.coerce.number().int().positive("El ID del alumno es requerido."),
  conceptoId: z.coerce.number().int().positive("Debe seleccionar un concepto de pago."),
  monto: z.coerce.number().positive("El monto debe ser un número positivo."),
  fechaVencimiento: z.coerce.date({
    required_error: "La fecha de vencimiento es requerida.",
    invalid_type_error: "El formato de la fecha no es válido.",
  }),
});

const CreateDeudaMasivaSchema = z.object({
  conceptoId: z.coerce.number().int().positive("Debe seleccionar un concepto."),
  monto: z.coerce.number().positive("El monto debe ser positivo."),
  fechaVencimiento: z.coerce.date({
    required_error: "La fecha de vencimiento es requerida.",
    invalid_type_error: "Formato de fecha inválido.",
  }),
});

export type State = {
  errors?: {
    alumnoId?: string[];
    conceptoId?: string[];
    monto?: string[];
    fechaVencimiento?: string[];
  };
  message?: string | null;
};

export async function createDeuda(prevState: State, formData: FormData) {
  // 1. Validar los datos del formulario
  const validatedFields = CreateDeudaSchema.safeParse({
    alumnoId: formData.get("alumnoId"),
    conceptoId: formData.get("conceptoId"),
    monto: formData.get("monto"),
    fechaVencimiento: new Date(formData.get("fechaVencimiento") as string),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Campos inválidos. No se pudo crear la deuda.",
    };
  }

  const { alumnoId, conceptoId, monto, fechaVencimiento } = validatedFields.data;

  try {
    // 2. Obtener el ciclo lectivo actual
    const cicloId = await getCicloActual();
    if (!cicloId) {
      throw new Error("No se pudo determinar el ciclo lectivo actual.");
    }

    // Verificar que el ciclo exista en la base de datos
    const ciclo = await db.cicloLectivo.findUnique({
      where: { idCiclo: cicloId },
    });

    if (!ciclo) {
      return {
        message: "El ciclo lectivo actual no es válido o ha sido eliminado. Seleccione otro ciclo.",
        errors: {},
      };
    }

    // 3. Crear el Cargo en la base de datos
    await db.cargo.create({
      data: {
        alumnoId,
        conceptoId,
        monto,
        fechaVencimiento,
        cicloId,
        estado: "Pendiente", // El estado por defecto definido en el schema
      },
    });
  } catch (error) {
    console.error(error);
    return {
      message: "Error de base de datos: No se pudo crear la deuda.",
      errors: {},
    };
  }

  // 4. Revalidar el cache para la página de detalles del alumno
  revalidatePath(`/dashboard/finanzas/${alumnoId}`);
  
  // Devolver un estado exitoso
  return {
    message: "Deuda creada exitosamente.",
  };
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
