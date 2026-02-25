import { Prisma } from "@prisma/client";

const personaWithRelations = Prisma.validator<Prisma.PersonaDefaultArgs>()({
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
        matriculas: true,
      },
    },
  },
});

export type PersonaWithRelations = Prisma.PersonaGetPayload<typeof personaWithRelations>;
