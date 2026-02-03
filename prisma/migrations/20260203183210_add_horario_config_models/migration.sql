-- CreateTable
CREATE TABLE "BLOQUE_HORARIO" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "turno" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "orden" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "DIA_HABIL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BLOQUE_HORARIO_turno_orden_key" ON "BLOQUE_HORARIO"("turno", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "DIA_HABIL_nombre_key" ON "DIA_HABIL"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "DIA_HABIL_orden_key" ON "DIA_HABIL"("orden");
