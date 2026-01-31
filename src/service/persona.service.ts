import db from "@/lib/db";
import bcrypt from "bcryptjs";
import type { PersonaWithRelations } from "@/types/persona";

export type { PersonaWithRelations };

export const PersonaService = {
  // Obtener todas las personas con sus usuarios y roles
  async getAll(rol?: string, idCiclo?: number) {
    const conditions: any[] = [];

    if (rol) {
      if (rol === "ALUMNO") {
        conditions.push({
          OR: [
            { alumno: { isNot: null } },
            { usuario: { roles: { some: { rol: { nombre: rol } } } } },
          ],
        });
      } else if (rol === "DOCENTE") {
        conditions.push({
          OR: [
            { profesor: { isNot: null } },
            { usuario: { roles: { some: { rol: { nombre: rol } } } } },
          ],
        });
      } else if (rol === "PADRE") {
        conditions.push({
          OR: [
            { padre: { isNot: null } },
            { usuario: { roles: { some: { rol: { nombre: rol } } } } },
          ],
        });
      } else {
        conditions.push({
          usuario: { roles: { some: { rol: { nombre: rol } } } },
        });
      }
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    return await db.persona.findMany({
      where,
      include: {
        usuario: {
          include: {
            roles: {
              include: { rol: true },
            },
          },
        },
        alumno: {
          include: {
            matriculas: idCiclo ? { where: { idCiclo } } : true,
          },
        },
        profesor: true,
        padre: true,
      },
      orderBy: { apellido: "asc" },
    });
  },
  async create(data: {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono?: string;
    direccion?: string;
    password?: string;
    idRol: number;
  }) {
    // La contraseña se establecerá al habilitar el acceso.
    // Se guarda un hash inválido para prevenir el login.
    const passwordHash = "NO_PASSWORD_SET";

    return await db.$transaction(async (tx) => {
      // 1. Creamos la Persona
      const nuevaPersona = await tx.persona.create({
        data: {
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
          // 2. Creamos el Usuario relacionado
          usuario: {
            create: {
              passwordHash,
              estado: false, // El usuario se crea inactivo por defecto
              // 3. Asignamos el Rol
              roles: {
                create: { idRol: data.idRol },
              },
            },
          },
        },
      });
      return nuevaPersona;
    });
  },

  async getRoles() {
    return await db.rol.findMany();
  },

  async delete(idPersona: number) {
    // Buscamos el usuario asociado a esa persona
    const usuario = await db.usuario.findFirst({
      where: { idPersona: idPersona },
    });

    if (usuario) {
      // Borrado lógico: cambiamos el estado a false
      return await db.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data: { estado: false, passwordHash: "DELETED_USER" },
      });
    }
  },

  async getById(id: number) {
    return await db.persona.findUnique({
      where: { idPersona: id },
      include: {
        usuario: {
          include: { roles: { include: { rol: true } } },
        },
      },
    });
  },

  async update(id: number, data: any) {
    return await db.persona.update({
      where: { idPersona: id },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        // Aquí podrías actualizar el rol también si fuera necesario
      },
    });
  },

  async getTutoresDisponibles(idAlumno: number) {
    // 1. Obtener los padres ya vinculados a este alumno
    const vinculaciones = await db.alumnoPadre.findMany({
      where: { idAlumno },
      include: {
        padre: true
      }
    });
    
    // Extraemos los IDs de Persona de los padres ya vinculados
    const idsPersonasVinculadas = vinculaciones.map(v => v.padre.idPersona);

    // 2. Buscar personas con rol PADRE que NO estén en la lista de vinculados
    return await db.persona.findMany({
      where: {
        usuario: {
          roles: {
            some: { rol: { nombre: 'PADRE' } },
          },
          estado: true
        },
        // Excluimos por idPersona. Así aparecen aunque no tengan registro en tabla 'Padre' todavía.
        idPersona: {
          notIn: idsPersonasVinculadas
        }
      },
      include: {
        padre: true, // Incluimos el modelo 'Padre' para tener el 'idPadre'
      },
      orderBy: {
        apellido: 'asc',
      },
    });
  },
};