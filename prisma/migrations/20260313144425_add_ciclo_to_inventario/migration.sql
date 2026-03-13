-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_INVENTARIO" (
    "idInsumo" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idCiclo" INTEGER,
    "nombre" TEXT NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "stockMinimo" INTEGER NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    CONSTRAINT "INVENTARIO_idCiclo_fkey" FOREIGN KEY ("idCiclo") REFERENCES "CICLO_LECTIVO" ("idCiclo") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_INVENTARIO" ("idInsumo", "nombre", "stockActual", "stockMinimo", "unidadMedida") SELECT "idInsumo", "nombre", "stockActual", "stockMinimo", "unidadMedida" FROM "INVENTARIO";
DROP TABLE "INVENTARIO";
ALTER TABLE "new_INVENTARIO" RENAME TO "INVENTARIO";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
