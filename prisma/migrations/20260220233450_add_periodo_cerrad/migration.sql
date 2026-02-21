-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PERIODO_ACADEMICO" (
    "idPeriodo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCiclo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" DATETIME NOT NULL,
    "fechaFin" DATETIME NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PERIODO_ACADEMICO_idCiclo_fkey" FOREIGN KEY ("idCiclo") REFERENCES "CICLO_LECTIVO" ("idCiclo") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PERIODO_ACADEMICO" ("fechaFin", "fechaInicio", "idCiclo", "idPeriodo", "nombre") SELECT "fechaFin", "fechaInicio", "idCiclo", "idPeriodo", "nombre" FROM "PERIODO_ACADEMICO";
DROP TABLE "PERIODO_ACADEMICO";
ALTER TABLE "new_PERIODO_ACADEMICO" RENAME TO "PERIODO_ACADEMICO";
CREATE UNIQUE INDEX "PERIODO_ACADEMICO_idCiclo_nombre_key" ON "PERIODO_ACADEMICO"("idCiclo", "nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
