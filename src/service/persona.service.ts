import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const PersonaService = {
  // Obtener todas las personas con sus usuarios y roles
  async getAll() {
    return await db.persona.findMany({
      where: {
        usuario: {
          estado: true, // <-- SOLO TRAER LOS ACTIVOS
        },
      },
      include: {
        usuario: {
          include: {
            roles: {
              include: { rol: true },
            },
          },
        },
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
    const passwordHash = await bcrypt.hash(data.password || "escuela123", 10);

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
              estado: true,
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
        data: { estado: false },
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
    // Primero, obtenemos los IDs de los padres que YA están vinculados al alumno
    const padresVinculados = await db.alumnoPadre.findMany({
      where: { idAlumno },
      select: { idPadre: true },
    });
    const idsPadresVinculados = padresVinculados.map(p => p.idPadre);

    // Luego, buscamos todas las personas con rol 'PADRE' que NO están en esa lista de vinculados
    return await db.persona.findMany({
      where: {
        usuario: {
          roles: {
            some: { rol: { nombre: 'PADRE' } },
          },
        },
        padre: {
          // La magia está aquí: nos aseguramos que su 'idPadre' no esté en la lista de los ya vinculados
          NOT: {
            idPadre: {
              in: idsPadresVinculados,
            },
          },
        },
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