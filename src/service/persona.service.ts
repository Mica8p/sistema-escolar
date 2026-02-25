import db from "@/lib/db";
import bcrypt from "bcryptjs";
import type { PersonaWithRelations } from "@/types/persona";

export type { PersonaWithRelations };

export const PersonaService = {
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
              estado: false,
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
      },
    });
  },

  async getTutoresDisponibles(idAlumno: number) {
    const vinculaciones = await db.alumnoPadre.findMany({
      where: { idAlumno },
      include: {
        padre: true
      }
    });

    const idsPersonasVinculadas = vinculaciones.map(v => v.padre.idPersona);

    return await db.persona.findMany({
      where: {
        usuario: {
          roles: {
            some: { rol: { nombre: 'PADRE' } },
          },
          estado: true
        },
        idPersona: {
          notIn: idsPersonasVinculadas
        }
      },
      include: {
        padre: true,
      },
      orderBy: {
        apellido: 'asc',
      },
    });
  },
};