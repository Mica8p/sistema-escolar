/*
  Warnings:

  - Added the required column `target` to the `COMUNICADO` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "COMUNICADO_VISTO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idComunicado" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaLectura" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "COMUNICADO_VISTO_idComunicado_fkey" FOREIGN KEY ("idComunicado") REFERENCES "COMUNICADO" ("idComunicado") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "COMUNICADO_VISTO_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_COMUNICADO" (
    "idComunicado" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuario" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "idTarget" INTEGER,
    CONSTRAINT "COMUNICADO_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_COMUNICADO" ("contenido", "fecha", "idComunicado", "idUsuario", "titulo") SELECT "contenido", "fecha", "idComunicado", "idUsuario", "titulo" FROM "COMUNICADO";
DROP TABLE "COMUNICADO";
ALTER TABLE "new_COMUNICADO" RENAME TO "COMUNICADO";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "COMUNICADO_VISTO_idComunicado_idUsuario_key" ON "COMUNICADO_VISTO"("idComunicado", "idUsuario");
