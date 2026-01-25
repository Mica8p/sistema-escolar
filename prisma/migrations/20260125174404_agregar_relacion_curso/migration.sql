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
    CONSTRAINT "COMUNICADO_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "COMUNICADO_idTarget_fkey" FOREIGN KEY ("idTarget") REFERENCES "CURSO" ("idCurso") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_COMUNICADO" ("contenido", "fecha", "idComunicado", "idTarget", "idUsuario", "target", "titulo") SELECT "contenido", "fecha", "idComunicado", "idTarget", "idUsuario", "target", "titulo" FROM "COMUNICADO";
DROP TABLE "COMUNICADO";
ALTER TABLE "new_COMUNICADO" RENAME TO "COMUNICADO";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
