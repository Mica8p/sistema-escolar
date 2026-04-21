'use server';

import db from '@/lib/db';
import { auth } from '@/auth';
import { esSuperAdmin } from '@/lib/security';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';



export async function cederSuperAdminANuevaPersona(prevState: unknown, formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    return { success: false, message: 'No autenticado' };
  }

  const esSuperAdminActual = esSuperAdmin(session.user.roles || [], session.user.email);

  if (!esSuperAdminActual) {
    return { success: false, message: '❌ Solo SUPER_ADMIN puede ceder el control' };
  }

  // Validar datos
  const nombre = formData.get('nombre')?.toString().trim();
  const apellido = formData.get('apellido')?.toString().trim();
  const dni = formData.get('dni')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const telefono = formData.get('telefono')?.toString().trim() || null;
  const direccion = formData.get('direccion')?.toString().trim() || null;

  if (!nombre || !apellido || !dni || !email) {
    return { success: false, message: 'Todos los campos requeridos deben completarse' };
  }

  try {
    // Verificar si el DNI ya existe
    const personaExistente = await db.persona.findUnique({
      where: { dni }
    });

    if (personaExistente) {
      return { success: false, message: 'El DNI ya está registrado en el sistema' };
    }

    const superAdminRol = await db.rol.findUnique({
      where: { nombre: 'SUPER_ADMIN' }
    });

    if (!superAdminRol) {
      return { success: false, message: 'Rol SUPER_ADMIN no existe en el sistema' };
    }

    // Crear la nueva persona y usuario con rol SUPER_ADMIN
    const result = await db.$transaction(async (tx) => {
      // 1. Crear nueva persona y usuario
      const newPersona = await tx.persona.create({
        data: {
          nombre,
          apellido,
          dni,
          email,
          telefono,
          direccion,
          usuario: {
            create: {
              passwordHash: await bcrypt.hash(dni, 10),
              estado: true,
              roles: {
                create: {
                  idRol: superAdminRol.idRol
                }
              }
            }
          }
        },
        include: {
          usuario: {
            include: {
              roles: {
                include: { rol: true }
              }
            }
          }
        }
      });

      // 2. Remover SUPER_ADMIN del usuario actual
      await tx.usuarioRol.deleteMany({
        where: {
          idUsuario: session.user.idUsuario,
          rol: { nombre: 'SUPER_ADMIN' }
        }
      });

      console.log(
        `[AUDIT] ${session.user.email} cedió SUPER_ADMIN a ${email} (${dni})`
      );

      return {
        success: true,
        message: `SUPER_ADMIN transferido a ${nombre} ${apellido}. Cierra sesión para que el nuevo super admin inicie con su DNI.`,
        persona: newPersona
      };
    });

    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    console.error('[ERROR] cederSuperAdminANuevaPersona:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Error al transferir SUPER_ADMIN' 
    };
  }
}

