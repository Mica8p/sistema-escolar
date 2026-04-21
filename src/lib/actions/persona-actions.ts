'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const PersonaSchema = z.object({
    nombre: z.string().min(3),
    apellido: z.string().min(3),
    dni: z.string().min(7).max(8),
    email: z.string(),
    telefono: z.string().optional(),
    direccion: z.string().optional(),
    idRol: z.string().optional()
});

const CreatePersonaSchema = PersonaSchema.extend({
    idRol: z.string().min(1, "Debe seleccionar un rol")
});


export async function createPersonaAction(prevState: unknown, formData: FormData) {
    const validatedFields = CreatePersonaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        const errorMessage = Object.entries(fieldErrors).map(([field, errors]) => `${field}: ${errors.join(', ')}`).join('\n');
        return { success: false, message: `Error de validación:\n${errorMessage}` };
    }

    const { idRol, ...personaData } = validatedFields.data;

    // Extraer TODOS los hijos del FormData (getAll es necesario para campos repetidos)
    const hijosArray: number[] = formData.getAll('hijos')
        .map(value => Number(value))
        .filter(n => !isNaN(n));

    try {
        const rolId = Number(idRol);
        const rol = await db.rol.findUnique({ where: { idRol: rolId } });
        const isPadre = rol?.nombre === 'PADRE';

        const newPersona = await db.persona.create({
            data: {
                ...personaData,
                usuario: {
                    create: {
                        passwordHash: await bcrypt.hash(personaData.dni, 10),
                        estado: true,
                        roles: {
                            create: {
                                idRol: rolId
                            }
                        }
                    }
                }
            }
        });

        // Si es padre, crear registro Padre y asociar hijos
        if (isPadre && hijosArray.length > 0) {
            const padre = await db.padre.create({
                data: {
                    idPersona: newPersona.idPersona
                }
            });

            // Crear relaciones AlumnoPadre para TODOS los hijos
            await db.alumnoPadre.createMany({
                data: hijosArray.map(idAlumno => ({
                    idAlumno,
                    idPadre: padre.idPadre,
                    relacion: 'Padre'
                }))
            });
        }
    } catch (error: unknown) {
        console.error(error);
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear la persona' };
    }

    revalidatePath('/dashboard/personas');
    return { success: true, message: 'Persona creada correctamente. Ahora serás redirigido.' };
}

export async function updatePersonaAction(idPersona: number, prevState: unknown, formData: FormData) {
    const validatedFields = PersonaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Error de validación: Verificá los datos ingresados.' };
    }

    const { idRol, ...personaData } = validatedFields.data;
    void idRol;

    try {
        await db.persona.update({
            where: { idPersona },
            data: personaData
        });
        revalidatePath('/dashboard/personas');
        revalidatePath(`/dashboard/personas/${idPersona}`);
        return { success: true, message: 'Datos actualizados correctamente. Ahora serás redirigido.' };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al actualizar la persona' };
    }
}

export async function getTutoresDisponiblesAction(idAlumno: number) {
    try {
        const existingLinks = await db.alumnoPadre.findMany({
            where: { idAlumno },
            select: { idPadre: true }
        });
        const existingPadreIds = existingLinks.map(l => l.idPadre);

        return await db.persona.findMany({
            where: {
                usuario: {
                    roles: {
                        some: { rol: { nombre: "PADRE" } }
                    },
                    estado: true
                },
                NOT: { padre: { idPadre: { in: existingPadreIds } } }
            },
            orderBy: { apellido: 'asc' }
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function habilitarAccesoAction(idPersona: number, dni: string) {
    try {
      const passwordHash = await bcrypt.hash(dni, 10);
      await db.usuario.update({
        where: { idPersona },
        data: {
          passwordHash,
          estado: true,
          defaultPassword: true,
        },
      });
      revalidatePath('/dashboard/personas');
      return { success: true, message: 'Acceso habilitado y contraseña restablecida al DNI.' };
    } catch {
      return { success: false, message: 'Error al habilitar el acceso.' };
    }
  }

export async function inhabilitarAccesoAction(idPersona: number) {
    try {
        const persona = await db.persona.findUnique({
            where: { idPersona },
            include: { usuario: { include: { roles: { include: { rol: true } } } } }
        });

        if (!persona?.usuario) {
            return { success: false, message: 'Esta persona no tiene un usuario habilitado.' };
        }

        if (!persona.usuario.estado) {
             return { success: false, message: 'El usuario ya se encuentra inhabilitado.' };
        }

        const esAdmin = persona.usuario.roles.some(r => r.rol.nombre === 'ADMIN');

        if (esAdmin) {
            const adminsActivos = await db.usuario.count({
                where: { estado: true, roles: { some: { rol: { nombre: 'ADMIN' } } } }
            });

            if (adminsActivos <= 1) {
                return { success: false, message: 'No se puede inhabilitar al último administrador activo.' };
            }
        }

        await db.usuario.update({
            where: { idUsuario: persona.usuario.idUsuario },
            data: { estado: false }
        });

        revalidatePath('/dashboard/personas');
        return { success: true, message: 'Usuario inhabilitado correctamente.' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error al inhabilitar el usuario.' };
    }
}