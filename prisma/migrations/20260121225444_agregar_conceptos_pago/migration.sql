/*
  Warnings:

  - You are about to drop the `CUOTA` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `PAGO` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `comprobante` on the `PAGO` table. All the data in the column will be lost.
  - You are about to drop the column `idCuota` on the `PAGO` table. All the data in the column will be lost.
  - You are about to drop the column `idPago` on the `PAGO` table. All the data in the column will be lost.
  - You are about to drop the column `idUsuario` on the `PAGO` table. All the data in the column will be lost.
  - You are about to drop the column `medioPago` on the `PAGO` table. All the data in the column will be lost.
  - You are about to drop the column `monto` on the `PAGO` table. All the data in the column will be lost.
  - Added the required column `alumnoId` to the `PAGO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `PAGO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metodoPago` to the `PAGO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montoTotal` to the `PAGO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PAGO` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `PAGO` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CUOTA_idMatricula_mes_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CUOTA";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CONCEPTO_PAGO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "montoFijo" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CARGO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alumnoId" INTEGER NOT NULL,
    "conceptoId" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',
    "cicloId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CARGO_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "ALUMNO" ("idAlumno") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CARGO_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "CONCEPTO_PAGO" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CARGO_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "CICLO_LECTIVO" ("idCiclo") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PAGO_DETALLE" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pagoId" INTEGER NOT NULL,
    "cargoId" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    CONSTRAINT "PAGO_DETALLE_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "PAGO" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PAGO_DETALLE_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "CARGO" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PAGO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alumnoId" INTEGER NOT NULL,
    "montoTotal" REAL NOT NULL,
    "fechaPago" DATETIME NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "referencia" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PAGO_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "ALUMNO" ("idAlumno") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PAGO_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "USUARIO" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PAGO" ("createdAt", "fechaPago") SELECT "createdAt", "fechaPago" FROM "PAGO";
DROP TABLE "PAGO";
ALTER TABLE "new_PAGO" RENAME TO "PAGO";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CONCEPTO_PAGO_nombre_key" ON "CONCEPTO_PAGO"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PAGO_DETALLE_pagoId_cargoId_key" ON "PAGO_DETALLE"("pagoId", "cargoId");
