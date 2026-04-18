'use server';

import { auth } from "@/auth";
import db from "@/lib/db";
import {
    registrarPago,
    RegistrarPagoData,
    createConceptoDePago as createConcepto,
    updateConceptoDePago as updateConcepto,
    deleteConceptoDePago as deleteConcepto,
    ConceptoDePagoData,
    crearCargoMasivo
} from "@/service/finanzas.service";
import { revalidatePath } from "next/cache";
import { getCicloActual } from "@/lib/ciclo-session";

export async function registrarPagoAction(data: Omit<RegistrarPagoData, 'usuarioId'>) {
    const session = await auth();
    if (!session?.user?.idUsuario) {
        throw new Error("Usuario no autenticado.");
    }

    const dataCompleta = {
        ...data,
        usuarioId: session.user.idUsuario
    };

    const pago = await registrarPago(dataCompleta);

    revalidatePath(`/dashboard/finanzas/${data.alumnoId}`);

    return pago;
}


/**
 * =======================
 * CONCEPTOS DE PAGO ACTIONS
 * =======================
 */

export async function createConceptoAction(data: ConceptoDePagoData) {
    try {
        const cicloId = await getCicloActual();
        const concepto = await createConcepto({
            nombre: data.nombre,
            descripcion: data.descripcion,
            montoFijo: data.montoFijo,
            fechaVencimiento: data.fechaVencimiento,
            idCiclo: cicloId
        });

        // Generar deudas para todos los alumnos
        if (cicloId && concepto.montoFijo) {
            await crearCargoMasivo(cicloId, concepto.id, concepto.montoFijo, concepto.fechaVencimiento);
        }

        revalidatePath('/dashboard/finanzas/conceptos');
        revalidatePath('/dashboard/finanzas', 'layout');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Error al crear el concepto" };
    }
}

export async function updateConceptoAction(id: number, data: ConceptoDePagoData) {
    try {
        const cicloId = await getCicloActual();
        await updateConcepto(id, {
            nombre: data.nombre,
            descripcion: data.descripcion,
            montoFijo: data.montoFijo,
            fechaVencimiento: data.fechaVencimiento,
            idCiclo: cicloId
        });
        await db.cargo.updateMany({
            where: { conceptoId: id },
            data: {
                monto: data.montoFijo,
                ...(data.fechaVencimiento !== undefined && { fechaVencimiento: data.fechaVencimiento })
            }
        });
        revalidatePath('/dashboard/finanzas/conceptos');
        revalidatePath('/dashboard/finanzas', 'layout');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "Error al actualizar el concepto" };
    }
}

export async function deleteConceptoAction(id: number) {
    try {
        await deleteConcepto(id);
        revalidatePath('/dashboard/finanzas/conceptos');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : "No se pudo eliminar el concepto" };
    }
}
