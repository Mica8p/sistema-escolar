import { Prisma } from "@prisma/client";

// 1. Define un tipo base que se corresponde con el resultado de tu consulta
const personaWithRelations = Prisma.validator<Prisma.PersonaDefaultArgs>()({
  include: {
    usuario: {
      include: {
        roles: {
          include: { rol: true },
        },
      },
    },
  },
});

// 2. Exporta el tipo inferido de la consulta
export type PersonaWithRelations = Prisma.PersonaGetPayload<typeof personaWithRelations>;
