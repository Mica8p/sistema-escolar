-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_USUARIO" (
    "idUsuario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idPersona" INTEGER NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "defaultPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "USUARIO_idPersona_fkey" FOREIGN KEY ("idPersona") REFERENCES "PERSONA" ("idPersona") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_USUARIO" ("createdAt", "estado", "idPersona", "idUsuario", "passwordHash") SELECT "createdAt", "estado", "idPersona", "idUsuario", "passwordHash" FROM "USUARIO";
DROP TABLE "USUARIO";
ALTER TABLE "new_USUARIO" RENAME TO "USUARIO";
CREATE UNIQUE INDEX "USUARIO_idPersona_key" ON "USUARIO"("idPersona");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
