'use server';

import { auth } from '@/auth';
import db from '@/lib/db';
import { esBootstrap } from '@/lib/security';

export async function cleanupBootstrapUser() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return { success: false, message: 'No autenticado' };
    }

    const personas = await db.persona.findMany({
      where: { dni: session.user.email || '' },
      select: { dni: true, idPersona: true }
    });

    // Buscar si el usuario actual es bootstrap
    for (const persona of personas) {
      if (esBootstrap(persona.dni)) {
        // Eliminar usuario bootstrap de la BD
        const usuario = await db.usuario.findUnique({
          where: { idPersona: persona.idPersona },
          select: { idUsuario: true }
        });

        if (usuario) {
          // Eliminar relaciones de roles primero
          await db.usuarioRol.deleteMany({
            where: { idUsuario: usuario.idUsuario }
          });

          // Eliminar usuario
          await db.usuario.delete({
            where: { idUsuario: usuario.idUsuario }
          });

          console.log(`[CLEANUP] Usuario bootstrap ${persona.dni} eliminado de la BD`);
        }

        break;
      }
    }

    return { success: true, message: 'Limpieza completada' };
  } catch (error) {
    console.error('[CLEANUP] Error:', error);
    return { success: false, message: 'Error en limpieza' };
  }
}
