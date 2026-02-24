'use server';

import { auth } from "@/auth";
import {
    registrarPago,
    RegistrarPagoData,
    createConceptoDePago as createConcepto,
    updateConceptoDePago as updateConcepto,
    deleteConceptoDePago as deleteConcepto,
    ConceptoDePagoData
} from "@/service/finanzas.service";
import { revalidatePath } from "next/cache";

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

    // Revalidar la página del alumno para que vea los cambios
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
        await createConcepto(data);
        revalidatePath('/dashboard/finanzas/conceptos');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al crear el concepto" };
    }
}

export async function updateConceptoAction(id: number, data: ConceptoDePagoData) {
    try {
        await updateConcepto(id, data);
        revalidatePath('/dashboard/finanzas/conceptos');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar el concepto" };
    }
}

export async function deleteConceptoAction(id: number) {
    try {
        await deleteConcepto(id);
        revalidatePath('/dashboard/finanzas/conceptos');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message || "No se pudo eliminar el concepto" };
    }
}
