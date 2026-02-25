"use server";

import db from "@/lib/db";
import { DiaSemana, Turno } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type DiaHabilState = {
    nombre: DiaSemana;
    habilitado: boolean;
}[];

export type BloqueHorarioState = {
    horaInicio: string;
    horaFin: string;
}[];

export async function guardarConfiguracionDias(dias: DiaHabilState) {
    try {
        await db.$transaction(async (tx) => {
            await tx.diaHabil.deleteMany({});

            for (let i = 0; i < dias.length; i++) {
                await tx.diaHabil.create({
                    data: {
                        nombre: dias[i].nombre,
                        habilitado: dias[i].habilitado,
                        orden: i,
                    }
                });
            }
        });
        revalidatePath('/dashboard/configuraciones/horarios');
        revalidatePath('/dashboard/profesores');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error al guardar la configuración de días." };
    }
}

export async function guardarConfiguracionBloques(turno: Turno, bloques: BloqueHorarioState) {
     try {
        await db.$transaction(async (tx) => {
            await tx.bloqueHorario.deleteMany({ where: { turno } });

            for (let i = 0; i < bloques.length; i++) {
                if(!bloques[i].horaInicio || !bloques[i].horaFin) continue;

                await tx.bloqueHorario.create({
                    data: {
                        turno: turno,
                        horaInicio: bloques[i].horaInicio,
                        horaFin: bloques[i].horaFin,
                        orden: i,
                    }
                });
            }
        });
        revalidatePath('/dashboard/configuraciones/horarios');
        revalidatePath('/dashboard/profesores');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error al guardar los bloques horarios." };
    }
}
