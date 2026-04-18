"use server";

import db from "@/lib/db";
import { MetodoPago, EstadoCuota, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";


export type AlumnoConDeuda = {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  legajo: string;
  curso: string;
  deudaTotal: number;
  estado: "Al día" | "Con Deuda";
  telefono?: string | null;
  telefonoPadre: string;
  nombrePadre: string;
};

export async function getAlumnosConEstadoDeCuenta(cicloId?: number): Promise<AlumnoConDeuda[]> {
  const alumnos = await db.alumno.findMany({
    include: {
      persona: true,
      padres: {
        include: {
          padre: {
            include: { persona: true }
          }
        }
      },
      cargos: {
        where: {
          estado: {
            in: ["Pendiente", "Parcial", "Vencido"],
          },
          ...(cicloId && { cicloId }),
        },
        include: {
          pagoDetalles: true,
        },
      },
      matriculas: {
        where: {
          ...(cicloId ? { idCiclo: cicloId } : { ciclo: { estado: true } }),
        },
        include: {
          curso: true,
        },
      },
    },
  });

  const resultado: AlumnoConDeuda[] = alumnos.map((alumno) => {
    const deudaTotal = alumno.cargos.reduce((acc, cargo) => {
      const totalPagadoParaCargo = cargo.pagoDetalles.reduce(
        (accDetalle, detalle) => accDetalle + detalle.monto,
        0
      );
      const saldo = cargo.monto - totalPagadoParaCargo;
      return acc + saldo;
    }, 0);

    const matricula = alumno.matriculas[0];
    const cursoActual = matricula?.curso
      ? `${matricula.curso.grado} '${matricula.curso.seccion}' - ${matricula.curso.turno}`
      : "Sin curso asignado";

    const relacionPadre = alumno.padres[0];
    const telefonoPadre = relacionPadre?.padre.persona.telefono || "";
    const nombrePadre = relacionPadre?.padre.persona.nombre || "Tutor";

    return {
      id: alumno.idAlumno,
      nombre: alumno.persona.nombre,
      apellido: alumno.persona.apellido,
      dni: alumno.persona.dni,
      legajo: alumno.legajo,
      telefono: alumno.persona.telefono,
      curso: cursoActual,
      deudaTotal: deudaTotal,
      estado: deudaTotal > 0 ? "Con Deuda" : "Al día",
      telefonoPadre: telefonoPadre,
      nombrePadre: nombrePadre,
    };
  });

  return resultado;
}

/**
 * Obtiene el detalle completo de la cuenta de un alumno, incluyendo todos sus cargos y pagos.
 * @param alumnoId - El ID del alumno
 */
export async function getDetalleCuenta(alumnoId: number, cicloId?: number) {
  const alumno = await db.alumno.findUnique({
    where: { idAlumno: alumnoId },
    include: {
      persona: true,
      matriculas: {
        where: {
          ...(cicloId ? { idCiclo: cicloId } : { ciclo: { estado: true } }),
        },
        include: {
          curso: true,
        },
      },
      cargos: {
        where: {
          ...(cicloId && { cicloId }),
        },
        include: {
          concepto: true,
          pagoDetalles: {
            include: {
              pago: true,
            },
          },
        },
        orderBy: {
          fechaVencimiento: "asc",
        },
      },
      pagos: {
        where: cicloId ? {
          detalles: {
            some: {
              cargo: {
                cicloId: cicloId
              }
            }
          }
        } : undefined,
        include: {
          detalles: {
            include: {
              cargo: {
                include: {
                  concepto: true,
                },
              },
            },
          },
        },
        orderBy: {
          fechaPago: "desc",
        },
      },
    },
  });

  if (!alumno) {
    throw new Error("Alumno no encontrado");
  }

  const cargosConSaldo = alumno.cargos.map((cargo) => {
    const totalPagadoParaCargo = cargo.pagoDetalles.reduce(
      (acc, detalle) => acc + detalle.monto,
      0
    );
    const saldo = cargo.monto - totalPagadoParaCargo;
    return { ...cargo, saldo };
  });

  return {
    ...alumno,
    cargos: cargosConSaldo,
  };
}


/**
 * =======================
 * FUNCIONES DE ESCRITURA
 * =======================
 */

/**
 * Genera cargos mensuales para todos los alumnos matriculados en un ciclo lectivo.
 * @param cicloId El ID del ciclo lectivo
 * @param conceptoId El ID del concepto de pago (ej: "Cuota Mensual")
 * @param monto El monto de cada cuota
 * @param anio El año para el cual generar las cuotas
 */
export async function generarCargosMensualesCiclo(
  cicloId: number,
  conceptoId: number,
  monto: number,
  anio: number
) {
  const matriculas = await db.matricula.findMany({
    where: { idCiclo: cicloId, estadoAcademico: 'Activo' },
  });

  const cargosData = [];
  for (const matricula of matriculas) {
    for (let mes = 1; mes <= 12; mes++) {
      cargosData.push({
        alumnoId: matricula.idAlumno,
        conceptoId: conceptoId,
        monto: monto,
        fechaVencimiento: new Date(`${anio}-${mes}-10`), // Vence el 10 de cada mes
        estado: 'Pendiente' as EstadoCuota,
        cicloId: cicloId,
      });
    }
  }

  return db.cargo.createMany({
    data: cargosData,
  });
}

export async function crearCargoMasivo(
  cicloId: number,
  conceptoId: number,
  monto: number,
  fechaVencimiento?: Date | null
) {
  const matriculas = await db.matricula.findMany({
    where: { idCiclo: cicloId, estadoAcademico: 'Activo' },
  });

  if (matriculas.length === 0) return { count: 0 };

  const cargosData = matriculas.map(m => {
    if (fechaVencimiento != null) {
      return {
        alumnoId: m.idAlumno,
        conceptoId,
        monto,
        fechaVencimiento,
        estado: 'Pendiente',
        cicloId,
      };
    }

    return {
      alumnoId: m.idAlumno,
      conceptoId,
      monto,
      estado: 'Pendiente',
      cicloId,
    };
  });

  return db.cargo.createMany({
    data: cargosData as Prisma.CargoCreateManyInput[],
  });
}

export type RegistrarPagoData = {
  alumnoId: number;
  usuarioId: number;
  montoTotal: number;
  fechaPago: Date;
  metodoPago: MetodoPago;
  referencia?: string;
  cargosAPagar: { cargoId: number; monto: number }[];
};

/**
 * Registra un nuevo pago y lo aplica a uno o más cargos.
 * Se ejecuta como una transacción para garantizar la integridad de los datos.
 * @param data - Los datos del pago a registrar.
 */
export async function registrarPago(data: RegistrarPagoData) {
  return db.$transaction(async (tx) => {
    // 1. Crear el registro principal del Pago
    const pago = await tx.pago.create({
      data: {
        alumnoId: data.alumnoId,
        usuarioId: data.usuarioId,
        montoTotal: data.montoTotal,
        fechaPago: data.fechaPago,
        metodoPago: data.metodoPago,
        referencia: data.referencia,
      },
    });

    for (const item of data.cargosAPagar) {
      await tx.pagoDetalle.create({
        data: {
          pagoId: pago.id,
          cargoId: item.cargoId,
          monto: item.monto,
        },
      });

      const cargo = await tx.cargo.findUnique({
        where: { id: item.cargoId },
        include: { pagoDetalles: true },
      });

      if (!cargo) {
        throw new Error(`El cargo con ID ${item.cargoId} no existe.`);
      }

      const totalPagado = cargo.pagoDetalles.reduce((acc, det) => acc + det.monto, 0) + item.monto;

      let nuevoEstado = cargo.estado;
      if (totalPagado >= cargo.monto) {
        nuevoEstado = 'Pagado';
      } else if (totalPagado > 0) {
        nuevoEstado = 'Parcial';
      }

      if (nuevoEstado !== cargo.estado) {
        await tx.cargo.update({
          where: { id: item.cargoId },
          data: { estado: nuevoEstado },
        });
      }
    }

    return pago;
  });
}

export async function crearCargoManual(data: {
  alumnoId: number;
  conceptoId: number;
  monto: number;
  fechaVencimiento: Date;
  cicloId: number;
}) {
  const cargo = await db.cargo.create({
    data: {
      alumnoId: data.alumnoId,
      conceptoId: data.conceptoId,
      monto: data.monto,
      fechaVencimiento: data.fechaVencimiento,
      estado: 'Pendiente',
      cicloId: data.cicloId,
    },
  });

  revalidatePath(`/dashboard/finanzas/${data.alumnoId}`);
  return cargo;
}

/**
 * =======================
 * CONCEPTOS DE PAGO
 * =======================
 */

export async function getConceptosDePago(cicloId?: number) {
  return db.conceptoDePago.findMany({
    where: {
      ...(cicloId && { idCiclo: cicloId }),
    },
    orderBy: {
      nombre: 'asc'
    }
  });
}

export type ConceptoDePagoData = {
  nombre: string;
  descripcion?: string;
  montoFijo?: number;
  fechaVencimiento?: Date;
  idCiclo?: number;
}

export async function createConceptoDePago(data: ConceptoDePagoData) {
  if (!data.idCiclo) {
    throw new Error("El ciclo es obligatorio para crear un concepto.");
  }

  const existing = await db.conceptoDePago.findFirst({
    where: {
      idCiclo: data.idCiclo,
      nombre: data.nombre
    },
  });

  if (existing) {
    throw new Error(`El concepto "${data.nombre}" ya existe en este ciclo.`);
  }

  const concepto = await db.conceptoDePago.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      montoFijo: data.montoFijo ?? 0,
      fechaVencimiento: data.fechaVencimiento || null,
      idCiclo: data.idCiclo
    }
  });
  revalidatePath("/dashboard/finanzas/conceptos");
  return concepto;
}

export async function updateConceptoDePago(id: number, data: ConceptoDePagoData) {
  if (!data.idCiclo) {
    throw new Error("El ciclo es obligatorio para actualizar un concepto.");
  }

  const concepto = await db.conceptoDePago.update({
    where: { id },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      montoFijo: data.montoFijo ?? 0,
      fechaVencimiento: data.fechaVencimiento || null,
      idCiclo: data.idCiclo
    }
  });
  revalidatePath("/dashboard/finanzas/conceptos");
  return concepto;
}

export async function deleteConceptoDePago(id: number) {
  const cargos = await db.cargo.count({ where: { conceptoId: id } });
  if (cargos > 0) {
    throw new Error("No se puede eliminar un concepto de pago que ya está en uso en cargos existentes.");
  }
  const deleted = await db.conceptoDePago.delete({
    where: { id }
  });
  revalidatePath("/dashboard/finanzas/conceptos");
  return deleted;
}