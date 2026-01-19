/*
  Warnings:

  - You are about to drop the column `turno` on the `HORARIO` table. All the data in the column will be lost.
  - Added the required column `turno` to the `CURSO` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ASISTENCIA" (
    "idAsistencia" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idMatricula" INTEGER NOT NULL,
    "idHorario" INTEGER NOT NULL,
    "fecha" DATETIME NOT NULL,
    "estado" TEXT NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaRegistro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ASISTENCIA_idMatricula_fkey" FOREIGN KEY ("idMatricula") REFERENCES "MATRICULA" ("idMatricula") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ASISTENCIA_idHorario_fkey" FOREIGN KEY ("idHorario") REFERENCES "HORARIO" ("idHorario") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ASISTENCIA_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO" ("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ASISTENCIA" ("estado", "fecha", "fechaRegistro", "idAsistencia", "idHorario", "idMatricula", "idUsuario") SELECT "estado", "fecha", "fechaRegistro", "idAsistencia", "idHorario", "idMatricula", "idUsuario" FROM "ASISTENCIA";
DROP TABLE "ASISTENCIA";
ALTER TABLE "new_ASISTENCIA" RENAME TO "ASISTENCIA";
CREATE UNIQUE INDEX "ASISTENCIA_idMatricula_idHorario_fecha_key" ON "ASISTENCIA"("idMatricula", "idHorario", "fecha");
CREATE TABLE "new_CURSO" (
    "idCurso" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "grado" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "turno" TEXT NOT NULL
);
INSERT INTO "new_CURSO" ("grado", "idCurso", "nivel", "seccion") SELECT "grado", "idCurso", "nivel", "seccion" FROM "CURSO";
DROP TABLE "CURSO";
ALTER TABLE "new_CURSO" RENAME TO "CURSO";
CREATE TABLE "new_HORARIO" (
    "idHorario" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idAsignacion" INTEGER NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "aula" TEXT,
    CONSTRAINT "HORARIO_idAsignacion_fkey" FOREIGN KEY ("idAsignacion") REFERENCES "ASIGNACION_ACADEMICA" ("idAsignacion") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_HORARIO" ("aula", "diaSemana", "horaFin", "horaInicio", "idAsignacion", "idHorario") SELECT "aula", "diaSemana", "horaFin", "horaInicio", "idAsignacion", "idHorario" FROM "HORARIO";
DROP TABLE "HORARIO";
ALTER TABLE "new_HORARIO" RENAME TO "HORARIO";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
