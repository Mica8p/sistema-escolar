-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('Primario', 'Secundario');

-- CreateEnum
CREATE TYPE "PeriodoNombre" AS ENUM ('TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3', 'DICIEMBRE', 'FEBRERO', 'JULIO_PREVIAS', 'ANUAL');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('Mañana', 'Tarde');

-- CreateEnum
CREATE TYPE "EstadoAcademico" AS ENUM ('Activo', 'Retirado', 'Egresado', 'Suspendido');

-- CreateEnum
CREATE TYPE "TipoEvaluacion" AS ENUM ('Parcial', 'Recuperatorio', 'EXAMEN_MESA');

-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('Presente', 'Ausente', 'Tarde', 'Justificado');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('Pendiente', 'Parcial', 'Pagado', 'Vencido');

-- CreateEnum
CREATE TYPE "TipoMovimientoStock" AS ENUM ('Entrada', 'Salida', 'Ajuste');

-- CreateEnum
CREATE TYPE "CategoriaGasto" AS ENUM ('Mantenimiento', 'Servicios', 'Insumos', 'Sueldos');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'OTRO');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO');

-- CreateTable
CREATE TABLE "PERSONA" (
    "idPersona" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "avatarPublicId" TEXT,

    CONSTRAINT "PERSONA_pkey" PRIMARY KEY ("idPersona")
);

-- CreateTable
CREATE TABLE "USUARIO" (
    "idUsuario" SERIAL NOT NULL,
    "idPersona" INTEGER NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "estado" BOOLEAN NOT NULL,
    "defaultPassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "USUARIO_pkey" PRIMARY KEY ("idUsuario")
);

-- CreateTable
CREATE TABLE "ROL" (
    "idRol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ROL_pkey" PRIMARY KEY ("idRol")
);

-- CreateTable
CREATE TABLE "USUARIO_ROL" (
    "idUsuario" INTEGER NOT NULL,
    "idRol" INTEGER NOT NULL,

    CONSTRAINT "USUARIO_ROL_pkey" PRIMARY KEY ("idUsuario","idRol")
);

-- CreateTable
CREATE TABLE "ALUMNO" (
    "idAlumno" SERIAL NOT NULL,
    "idPersona" INTEGER NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "legajo" TEXT NOT NULL,

    CONSTRAINT "ALUMNO_pkey" PRIMARY KEY ("idAlumno")
);

-- CreateTable
CREATE TABLE "PROFESOR" (
    "idProfesor" SERIAL NOT NULL,
    "idPersona" INTEGER NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PROFESOR_pkey" PRIMARY KEY ("idProfesor")
);

-- CreateTable
CREATE TABLE "PADRE" (
    "idPadre" SERIAL NOT NULL,
    "idPersona" INTEGER NOT NULL,

    CONSTRAINT "PADRE_pkey" PRIMARY KEY ("idPadre")
);

-- CreateTable
CREATE TABLE "ALUMNO_PADRE" (
    "idAlumno" INTEGER NOT NULL,
    "idPadre" INTEGER NOT NULL,
    "relacion" TEXT NOT NULL,

    CONSTRAINT "ALUMNO_PADRE_pkey" PRIMARY KEY ("idAlumno","idPadre")
);

-- CreateTable
CREATE TABLE "CICLO_LECTIVO" (
    "idCiclo" SERIAL NOT NULL,
    "anio" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL,

    CONSTRAINT "CICLO_LECTIVO_pkey" PRIMARY KEY ("idCiclo")
);

-- CreateTable
CREATE TABLE "PERIODO_ACADEMICO" (
    "idPeriodo" SERIAL NOT NULL,
    "idCiclo" INTEGER NOT NULL,
    "nombre" "PeriodoNombre" NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "cerrado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PERIODO_ACADEMICO_pkey" PRIMARY KEY ("idPeriodo")
);

-- CreateTable
CREATE TABLE "CURSO" (
    "idCurso" SERIAL NOT NULL,
    "grado" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "nivel" "Nivel" NOT NULL,
    "turno" "Turno" NOT NULL,

    CONSTRAINT "CURSO_pkey" PRIMARY KEY ("idCurso")
);

-- CreateTable
CREATE TABLE "MATERIA" (
    "idMateria" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "MATERIA_pkey" PRIMARY KEY ("idMateria")
);

-- CreateTable
CREATE TABLE "ASIGNACION_ACADEMICA" (
    "idAsignacion" SERIAL NOT NULL,
    "idProfesor" INTEGER,
    "idMateria" INTEGER NOT NULL,
    "idCurso" INTEGER NOT NULL,
    "idCiclo" INTEGER NOT NULL,
    "cargaHoraria" INTEGER NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "motivoBaja" TEXT,
    "fechaBaja" TIMESTAMP(3),

    CONSTRAINT "ASIGNACION_ACADEMICA_pkey" PRIMARY KEY ("idAsignacion")
);

-- CreateTable
CREATE TABLE "HORARIO" (
    "idHorario" SERIAL NOT NULL,
    "idAsignacion" INTEGER NOT NULL,
    "diaSemana" "DiaSemana" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "aula" TEXT,

    CONSTRAINT "HORARIO_pkey" PRIMARY KEY ("idHorario")
);

-- CreateTable
CREATE TABLE "MATRICULA" (
    "idMatricula" SERIAL NOT NULL,
    "idAlumno" INTEGER NOT NULL,
    "idCurso" INTEGER NOT NULL,
    "idCiclo" INTEGER NOT NULL,
    "fechaInscripcion" TIMESTAMP(3) NOT NULL,
    "estadoAcademico" "EstadoAcademico" NOT NULL,
    "promedioFinal" DOUBLE PRECISION,

    CONSTRAINT "MATRICULA_pkey" PRIMARY KEY ("idMatricula")
);

-- CreateTable
CREATE TABLE "NOTA" (
    "idNota" SERIAL NOT NULL,
    "idMatricula" INTEGER NOT NULL,
    "idAsignacion" INTEGER NOT NULL,
    "idPeriodo" INTEGER NOT NULL,
    "tipo" "TipoEvaluacion" NOT NULL,
    "nota" DOUBLE PRECISION NOT NULL,
    "observacion" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NOTA_pkey" PRIMARY KEY ("idNota")
);

-- CreateTable
CREATE TABLE "ASISTENCIA" (
    "idAsistencia" SERIAL NOT NULL,
    "idMatricula" INTEGER NOT NULL,
    "idHorario" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ASISTENCIA_pkey" PRIMARY KEY ("idAsistencia")
);

-- CreateTable
CREATE TABLE "CONCEPTO_PAGO" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "montoFijo" DOUBLE PRECISION,
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CONCEPTO_PAGO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CARGO" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "conceptoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCuota" NOT NULL DEFAULT 'Pendiente',
    "cicloId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CARGO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PAGO" (
    "id" SERIAL NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "referencia" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PAGO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PAGO_DETALLE" (
    "id" SERIAL NOT NULL,
    "pagoId" INTEGER NOT NULL,
    "cargoId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PAGO_DETALLE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "COMUNICADO" (
    "idComunicado" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idUsuario" INTEGER NOT NULL,
    "target" TEXT NOT NULL,
    "idTarget" INTEGER,

    CONSTRAINT "COMUNICADO_pkey" PRIMARY KEY ("idComunicado")
);

-- CreateTable
CREATE TABLE "COMUNICADO_VISTO" (
    "id" SERIAL NOT NULL,
    "idComunicado" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "fechaLectura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "COMUNICADO_VISTO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "INVENTARIO" (
    "idInsumo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "stockMinimo" INTEGER NOT NULL,
    "unidadMedida" TEXT NOT NULL,

    CONSTRAINT "INVENTARIO_pkey" PRIMARY KEY ("idInsumo")
);

-- CreateTable
CREATE TABLE "MOVIMIENTO_STOCK" (
    "idMovimiento" SERIAL NOT NULL,
    "idInsumo" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "tipo" "TipoMovimientoStock" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MOVIMIENTO_STOCK_pkey" PRIMARY KEY ("idMovimiento")
);

-- CreateTable
CREATE TABLE "GASTO_INSTITUCIONAL" (
    "idGasto" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "concepto" TEXT NOT NULL,
    "categoria" "CategoriaGasto" NOT NULL,
    "idMovimiento" INTEGER,

    CONSTRAINT "GASTO_INSTITUCIONAL_pkey" PRIMARY KEY ("idGasto")
);

-- CreateTable
CREATE TABLE "BLOQUE_HORARIO" (
    "id" SERIAL NOT NULL,
    "turno" "Turno" NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "BLOQUE_HORARIO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DIA_HABIL" (
    "id" SERIAL NOT NULL,
    "nombre" "DiaSemana" NOT NULL,
    "habilitado" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "DIA_HABIL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PERSONA_dni_key" ON "PERSONA"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "USUARIO_idPersona_key" ON "USUARIO"("idPersona");

-- CreateIndex
CREATE UNIQUE INDEX "ROL_nombre_key" ON "ROL"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ALUMNO_idPersona_key" ON "ALUMNO"("idPersona");

-- CreateIndex
CREATE UNIQUE INDEX "ALUMNO_legajo_key" ON "ALUMNO"("legajo");

-- CreateIndex
CREATE UNIQUE INDEX "PROFESOR_idPersona_key" ON "PROFESOR"("idPersona");

-- CreateIndex
CREATE UNIQUE INDEX "PADRE_idPersona_key" ON "PADRE"("idPersona");

-- CreateIndex
CREATE UNIQUE INDEX "CICLO_LECTIVO_anio_key" ON "CICLO_LECTIVO"("anio");

-- CreateIndex
CREATE UNIQUE INDEX "PERIODO_ACADEMICO_idCiclo_nombre_key" ON "PERIODO_ACADEMICO"("idCiclo", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "MATRICULA_idAlumno_idCiclo_key" ON "MATRICULA"("idAlumno", "idCiclo");

-- CreateIndex
CREATE UNIQUE INDEX "ASISTENCIA_idMatricula_idHorario_fecha_key" ON "ASISTENCIA"("idMatricula", "idHorario", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "CONCEPTO_PAGO_nombre_key" ON "CONCEPTO_PAGO"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PAGO_DETALLE_pagoId_cargoId_key" ON "PAGO_DETALLE"("pagoId", "cargoId");

-- CreateIndex
CREATE UNIQUE INDEX "COMUNICADO_VISTO_idComunicado_idUsuario_key" ON "COMUNICADO_VISTO"("idComunicado", "idUsuario");

-- CreateIndex
CREATE UNIQUE INDEX "BLOQUE_HORARIO_turno_orden_key" ON "BLOQUE_HORARIO"("turno", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "DIA_HABIL_nombre_key" ON "DIA_HABIL"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "DIA_HABIL_orden_key" ON "DIA_HABIL"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- AddForeignKey
ALTER TABLE "USUARIO" ADD CONSTRAINT "USUARIO_idPersona_fkey" FOREIGN KEY ("idPersona") REFERENCES "PERSONA"("idPersona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "USUARIO_ROL" ADD CONSTRAINT "USUARIO_ROL_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "USUARIO_ROL" ADD CONSTRAINT "USUARIO_ROL_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "ROL"("idRol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ALUMNO" ADD CONSTRAINT "ALUMNO_idPersona_fkey" FOREIGN KEY ("idPersona") REFERENCES "PERSONA"("idPersona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PROFESOR" ADD CONSTRAINT "PROFESOR_idPersona_fkey" FOREIGN KEY ("idPersona") REFERENCES "PERSONA"("idPersona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PADRE" ADD CONSTRAINT "PADRE_idPersona_fkey" FOREIGN KEY ("idPersona") REFERENCES "PERSONA"("idPersona") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ALUMNO_PADRE" ADD CONSTRAINT "ALUMNO_PADRE_idAlumno_fkey" FOREIGN KEY ("idAlumno") REFERENCES "ALUMNO"("idAlumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ALUMNO_PADRE" ADD CONSTRAINT "ALUMNO_PADRE_idPadre_fkey" FOREIGN KEY ("idPadre") REFERENCES "PADRE"("idPadre") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PERIODO_ACADEMICO" ADD CONSTRAINT "PERIODO_ACADEMICO_idCiclo_fkey" FOREIGN KEY ("idCiclo") REFERENCES "CICLO_LECTIVO"("idCiclo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASIGNACION_ACADEMICA" ADD CONSTRAINT "ASIGNACION_ACADEMICA_idProfesor_fkey" FOREIGN KEY ("idProfesor") REFERENCES "PROFESOR"("idProfesor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASIGNACION_ACADEMICA" ADD CONSTRAINT "ASIGNACION_ACADEMICA_idMateria_fkey" FOREIGN KEY ("idMateria") REFERENCES "MATERIA"("idMateria") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASIGNACION_ACADEMICA" ADD CONSTRAINT "ASIGNACION_ACADEMICA_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "CURSO"("idCurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASIGNACION_ACADEMICA" ADD CONSTRAINT "ASIGNACION_ACADEMICA_idCiclo_fkey" FOREIGN KEY ("idCiclo") REFERENCES "CICLO_LECTIVO"("idCiclo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HORARIO" ADD CONSTRAINT "HORARIO_idAsignacion_fkey" FOREIGN KEY ("idAsignacion") REFERENCES "ASIGNACION_ACADEMICA"("idAsignacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MATRICULA" ADD CONSTRAINT "MATRICULA_idAlumno_fkey" FOREIGN KEY ("idAlumno") REFERENCES "ALUMNO"("idAlumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MATRICULA" ADD CONSTRAINT "MATRICULA_idCurso_fkey" FOREIGN KEY ("idCurso") REFERENCES "CURSO"("idCurso") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MATRICULA" ADD CONSTRAINT "MATRICULA_idCiclo_fkey" FOREIGN KEY ("idCiclo") REFERENCES "CICLO_LECTIVO"("idCiclo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTA" ADD CONSTRAINT "NOTA_idMatricula_fkey" FOREIGN KEY ("idMatricula") REFERENCES "MATRICULA"("idMatricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTA" ADD CONSTRAINT "NOTA_idAsignacion_fkey" FOREIGN KEY ("idAsignacion") REFERENCES "ASIGNACION_ACADEMICA"("idAsignacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NOTA" ADD CONSTRAINT "NOTA_idPeriodo_fkey" FOREIGN KEY ("idPeriodo") REFERENCES "PERIODO_ACADEMICO"("idPeriodo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASISTENCIA" ADD CONSTRAINT "ASISTENCIA_idMatricula_fkey" FOREIGN KEY ("idMatricula") REFERENCES "MATRICULA"("idMatricula") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASISTENCIA" ADD CONSTRAINT "ASISTENCIA_idHorario_fkey" FOREIGN KEY ("idHorario") REFERENCES "HORARIO"("idHorario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ASISTENCIA" ADD CONSTRAINT "ASISTENCIA_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CARGO" ADD CONSTRAINT "CARGO_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "ALUMNO"("idAlumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CARGO" ADD CONSTRAINT "CARGO_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "CONCEPTO_PAGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CARGO" ADD CONSTRAINT "CARGO_cicloId_fkey" FOREIGN KEY ("cicloId") REFERENCES "CICLO_LECTIVO"("idCiclo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAGO" ADD CONSTRAINT "PAGO_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "ALUMNO"("idAlumno") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAGO" ADD CONSTRAINT "PAGO_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAGO_DETALLE" ADD CONSTRAINT "PAGO_DETALLE_pagoId_fkey" FOREIGN KEY ("pagoId") REFERENCES "PAGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAGO_DETALLE" ADD CONSTRAINT "PAGO_DETALLE_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "CARGO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMUNICADO" ADD CONSTRAINT "COMUNICADO_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMUNICADO" ADD CONSTRAINT "COMUNICADO_idTarget_fkey" FOREIGN KEY ("idTarget") REFERENCES "CURSO"("idCurso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMUNICADO_VISTO" ADD CONSTRAINT "COMUNICADO_VISTO_idComunicado_fkey" FOREIGN KEY ("idComunicado") REFERENCES "COMUNICADO"("idComunicado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "COMUNICADO_VISTO" ADD CONSTRAINT "COMUNICADO_VISTO_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOVIMIENTO_STOCK" ADD CONSTRAINT "MOVIMIENTO_STOCK_idInsumo_fkey" FOREIGN KEY ("idInsumo") REFERENCES "INVENTARIO"("idInsumo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOVIMIENTO_STOCK" ADD CONSTRAINT "MOVIMIENTO_STOCK_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GASTO_INSTITUCIONAL" ADD CONSTRAINT "GASTO_INSTITUCIONAL_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "USUARIO"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GASTO_INSTITUCIONAL" ADD CONSTRAINT "GASTO_INSTITUCIONAL_idMovimiento_fkey" FOREIGN KEY ("idMovimiento") REFERENCES "MOVIMIENTO_STOCK"("idMovimiento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "USUARIO"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;
