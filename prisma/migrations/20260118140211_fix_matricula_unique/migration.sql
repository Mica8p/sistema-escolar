/*
  Warnings:

  - A unique constraint covering the columns `[idAlumno,idCiclo]` on the table `MATRICULA` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MATRICULA_idAlumno_idCurso_idCiclo_key";

-- CreateIndex
CREATE UNIQUE INDEX "MATRICULA_idAlumno_idCiclo_key" ON "MATRICULA"("idAlumno", "idCiclo");
