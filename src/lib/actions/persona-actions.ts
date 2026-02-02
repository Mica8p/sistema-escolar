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

// ... (other code)

export async function createPersonaAction(prevState: any, formData: FormData) {
    const validatedFields = CreatePersonaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        const fieldErrors = validatedFields.error.flatten().fieldErrors;
        const errorMessage = Object.entries(fieldErrors).map(([field, errors]) => `${field}: ${errors.join(', ')}`).join('\n');
        return { success: false, message: `Error de validación:\n${errorMessage}` };
    }

    const { idRol, ...personaData } = validatedFields.data;

    try {
        await db.persona.create({
            data: {
                ...personaData,
                usuario: {
                    create: {
                        passwordHash: await bcrypt.hash(personaData.dni, 10),
                        estado: true,
                        roles: {
                            create: {
                                idRol: Number(idRol)
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        return { success: false, message: 'Error al crear la persona' };
    }

    revalidatePath('/dashboard/personas');
    return { success: true, message: 'Persona creada correctamente. Ahora serás redirigido.' };
}

export async function updatePersonaAction(idPersona: number, prevState: any, formData: FormData) {
    const validatedFields = PersonaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Error de validación: Verificá los datos ingresados.' };
    }

    const { idRol, ...personaData } = validatedFields.data;

    try {
        await db.persona.update({
            where: { idPersona },
            data: personaData
        });
        revalidatePath('/dashboard/personas');
        revalidatePath(`/dashboard/personas/${idPersona}`);
        return { success: true, message: 'Datos actualizados correctamente. Ahora serás redirigido.' };
    } catch (error) {
        return { success: false, message: 'Error al actualizar la persona' };
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
    } catch (error) {
      return { success: false, message: 'Error al habilitar el acceso.' };
    }
  }

export async function deletePersona(idPersona: number) {
    try {
        await db.$transaction(async (prisma) => {
            // Step 1: Find the Persona and its relations
            const persona = await prisma.persona.findUnique({
                where: { idPersona },
                include: {
                    usuario: {
                        include: {
                            roles: true,
                            pagosRegistrados: true,
                            asistencias: true,
                            comunicados: true,
                            comunicadosVistos: true,
                            movimientos: true,
                            gastos: true,
                        },
                    },
                    alumno: {
                        include: {
                            matriculas: {
                                include: {
                                    notas: true,
                                    asistencias: true,
                                },
                            },
                            padres: true,
                            cargos: {
                                include: {
                                    pagoDetalles: true,
                                },
                            },
                            pagos: true,
                        },
                    },
                    profesor: {
                        include: {
                            asignaciones: {
                                include: {
                                    horarios: true,
                                    notas: true,
                                },
                            },
                        },
                    },
                    padre: {
                        include: {
                            alumnos: true,
                        },
                    },
                },
            });

            if (!persona) {
                throw new Error('Persona not found');
            }

            // Step 2: Delete related Usuario data
            if (persona.usuario) {
                await prisma.comunicadoVisto.deleteMany({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
                await prisma.usuarioRol.deleteMany({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
                await prisma.movimientoStock.deleteMany({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
                await prisma.gastoInstitucional.deleteMany({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
                await prisma.asistencia.deleteMany({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
                await prisma.comunicado.deleteMany({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
                await prisma.pago.deleteMany({
                    where: { usuarioId: persona.usuario.idUsuario },
                });
                await prisma.usuario.delete({
                    where: { idUsuario: persona.usuario.idUsuario },
                });
            }

            // Step 3: Delete related Alumno data
            if (persona.alumno) {
                for (const matricula of persona.alumno.matriculas) {
                    await prisma.nota.deleteMany({
                        where: { idMatricula: matricula.idMatricula },
                    });
                    await prisma.asistencia.deleteMany({
                        where: { idMatricula: matricula.idMatricula },
                    });
                    await prisma.matricula.delete({
                        where: { idMatricula: matricula.idMatricula },
                    });
                }

                await prisma.alumnoPadre.deleteMany({
                    where: { idAlumno: persona.alumno.idAlumno },
                });

                for (const cargo of persona.alumno.cargos) {
                    await prisma.pagoDetalle.deleteMany({
                        where: { cargoId: cargo.id },
                    });
                }


                await prisma.cargo.deleteMany({
                    where: { alumnoId: persona.alumno.idAlumno },
                });

                await prisma.pago.deleteMany({
                    where: { alumnoId: persona.alumno.idAlumno },
                });

                await prisma.alumno.delete({
                    where: { idAlumno: persona.alumno.idAlumno },
                });
            }

            // Step 4: Delete related Profesor data
            if (persona.profesor) {
                for (const asignacion of persona.profesor.asignaciones) {
                    await prisma.horario.deleteMany({
                        where: { idAsignacion: asignacion.idAsignacion },
                    });
                    await prisma.nota.deleteMany({
                        where: { idAsignacion: asignacion.idAsignacion },
                    });
                    await prisma.asignacionAcademica.delete({
                        where: { idAsignacion: asignacion.idAsignacion },
                    });
                }
                await prisma.profesor.delete({
                    where: { idProfesor: persona.profesor.idProfesor },
                });
            }

            // Step 5: Delete related Padre data
            if (persona.padre) {
                await prisma.alumnoPadre.deleteMany({
                    where: { idPadre: persona.padre.idPadre },
                });
                await prisma.padre.delete({ where: { idPadre: persona.padre.idPadre } });
            }

            // Step 6: Delete the Persona
            await prisma.persona.delete({
                where: { idPersona },
            });
        });

        revalidatePath('/dashboard/personas');
        revalidatePath('/dashboard/alumnos');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error deleting persona' };
    }
}