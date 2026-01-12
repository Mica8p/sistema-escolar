/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `ROL` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ROL_nombre_key" ON "ROL"("nombre");
