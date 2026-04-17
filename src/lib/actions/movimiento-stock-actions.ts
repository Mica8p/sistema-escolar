"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import db from "@/lib/db";

/* =========================
   Utils
========================= */

function toInt(value: unknown, fallback = 0) {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

type MovimientoTipo = "Entrada" | "Salida" | "Ajuste";
const tiposValidos = ["Entrada", "Salida", "Ajuste"] as const;

type GastoCategoria = "Mantenimiento" | "Servicios" | "Insumos" | "Sueldos";
const categoriasValidas = ["Mantenimiento", "Servicios", "Insumos", "Sueldos"] as const;

interface AuthSessionWithRoles {
  user?: {
    roles?: string[];
  };
}

function requireAdmin(session: AuthSessionWithRoles) {
  const roles = session?.user?.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  if (!isAdmin) {
    return { success: false, message: "Solo ADMIN." } as const;
  }
  return null;
}

/* =========================
   Crear movimiento de stock
========================= */
export async function createMovimientoStock(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const idUsuario = session.user.idUsuario;
  if (!idUsuario) return { success: false, message: "Usuario inválido." };

  const idInsumo = toInt(formData.get("idInsumo"));
  const tipoRaw = normalizeText(formData.get("tipo"));
  const tipo = tiposValidos.includes(tipoRaw as MovimientoTipo) ? tipoRaw as MovimientoTipo : null;
  const cantidadRaw = toInt(formData.get("cantidad"));
  const ajusteSign = normalizeText(formData.get("ajusteSign"));
  const crearGasto = normalizeText(formData.get("crearGasto")) === "1";
  const monto = Number(formData.get("monto") ?? 0);
  const concepto = normalizeText(formData.get("concepto"));
  const categoriaRaw = normalizeText(formData.get("categoria"));
  const categoria = categoriasValidas.includes(categoriaRaw as GastoCategoria) ? categoriaRaw as GastoCategoria : null;

  if (!idInsumo) return { success: false, message: "Insumo inválido." };
  if (!tipo) return { success: false, message: "Tipo de movimiento inválido." };
  if (cantidadRaw <= 0) return { success: false, message: "La cantidad debe ser mayor a 0." };

  /* ---------- Delta según tipo ---------- */
  let delta = 0;
  if (tipo === "Entrada") delta = cantidadRaw;
  if (tipo === "Salida") delta = -cantidadRaw;
  if (tipo === "Ajuste") {
    if (!["sumar", "restar"].includes(ajusteSign)) {
      return { success: false, message: "Indicá si el ajuste suma o resta." };
    }
    delta = ajusteSign === "sumar" ? cantidadRaw : -cantidadRaw;
  }

  if (tipo === "Entrada" && crearGasto) {
    if (!Number.isFinite(monto) || monto <= 0) {
      return { success: false, message: "El monto del gasto debe ser mayor a 0." };
    }
    if (!concepto) {
      return { success: false, message: "El concepto del gasto es obligatorio." };
    }
    if (!categoria) {
      return { success: false, message: "Categoría de gasto inválida." };
    }
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const insumo = await tx.inventario.findUnique({
        where: { idInsumo },
        select: { stockActual: true },
      });

      if (!insumo) {
        throw new Error("El insumo no existe.");
      }

      const nuevoStock = insumo.stockActual + delta;
      if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente. Stock actual: ${insumo.stockActual}.`);
      }

      await tx.inventario.update({
        where: { idInsumo },
        data: { stockActual: nuevoStock },
      });

      const mov = await tx.movimientoStock.create({
        data: {
          idInsumo,
          idUsuario,
          tipo,
          cantidad: delta,
          fecha: new Date(),
        },
      });

      if (tipo === "Entrada" && crearGasto) {
        await tx.gastoInstitucional.create({
          data: {
            idUsuario,
            monto,
            fecha: new Date(),
            concepto,
            categoria: categoria as GastoCategoria,
            idMovimiento: mov.idMovimiento,
          },
        });
      }

      return {
        nuevoStock,
      };
    });

    revalidatePath("/dashboard/inventario");
    return {
      success: true,
      message: `Movimiento registrado. Nuevo stock: ${result.nuevoStock}.`,
    };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Error inesperado." };
  }
}

/* =========================
   Consumir insumo (restar 1)
========================= */

export async function consumirInsumo(idInsumo: number) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const idUsuario = session.user.idUsuario;
  if (!idUsuario) return { success: false, message: "Usuario inválido." };

  if (!idInsumo || idInsumo <= 0) {
    return { success: false, message: "Insumo inválido." };
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const insumo = await tx.inventario.findUnique({
        where: { idInsumo },
        select: { stockActual: true, nombre: true },
      });

      if (!insumo) {
        throw new Error("El insumo no existe.");
      }

      if (insumo.stockActual <= 0) {
        throw new Error(`No hay stock disponible de ${insumo.nombre}.`);
      }

      const nuevoStock = insumo.stockActual - 1;

      await tx.inventario.update({
        where: { idInsumo },
        data: { stockActual: nuevoStock },
      });

      await tx.movimientoStock.create({
        data: {
          idInsumo,
          idUsuario,
          tipo: "Salida",
          cantidad: -1,
          fecha: new Date(),
        },
      });

      return {
        nuevoStock,
        nombre: insumo.nombre,
      };
    });

    revalidatePath("/dashboard/inventario");
    return {
      success: true,
      message: `Consumo registrado. Nuevo stock de ${result.nombre}: ${result.nuevoStock}.`,
    };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Error inesperado." };
  }
}

/* =========================
   Actualizar movimiento de stock
========================= */
export async function updateMovimientoStock(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const idMovimiento = toInt(formData.get("idMovimiento"));
  const cantidadNueva = toInt(formData.get("cantidad"));
  const monto = Number(formData.get("monto") ?? 0);
  const concepto = normalizeText(formData.get("concepto"));
  const categoriaRaw = normalizeText(formData.get("categoria"));
  const categoria = categoriasValidas.includes(categoriaRaw as GastoCategoria) ? categoriaRaw as GastoCategoria : null;

  if (!idMovimiento) return { success: false, message: "Movimiento inválido." };
  if (cantidadNueva <= 0) return { success: false, message: "La cantidad debe ser mayor a 0." };

  try {
    const result = await db.$transaction(async (tx) => {
      const movimiento = await tx.movimientoStock.findUnique({
        where: { idMovimiento },
        select: { 
          idInsumo: true, 
          cantidad: true, 
          tipo: true,
          insumo: { select: { stockActual: true } }
        },
      });

      if (!movimiento) {
        throw new Error("El movimiento no existe.");
      }

      const deltaCantidad = cantidadNueva - Math.abs(movimiento.cantidad);
      const deltaStock = movimiento.tipo === "Entrada" ? deltaCantidad : -deltaCantidad;

      // Validar que no baje de 0
      const nuevoStock = movimiento.insumo.stockActual + deltaStock;
      if (nuevoStock < 0) {
        throw new Error(`Stock insuficiente. Stock actual: ${movimiento.insumo.stockActual}.`);
      }

      // Actualizar stock del insumo
      await tx.inventario.update({
        where: { idInsumo: movimiento.idInsumo },
        data: { stockActual: nuevoStock },
      });

      // Calcular nueva cantidad con signo
      const cantidadConSigno = movimiento.tipo === "Entrada" ? cantidadNueva : -cantidadNueva;

      // Actualizar movimiento
      await tx.movimientoStock.update({
        where: { idMovimiento },
        data: { cantidad: cantidadConSigno },
      });

      // Actualizar gasto si existe
      if (movimiento.tipo === "Entrada") {
        const gastoExistente = await tx.gastoInstitucional.findFirst({
          where: { idMovimiento },
        });

        if (gastoExistente) {
          await tx.gastoInstitucional.update({
            where: { idGasto: gastoExistente.idGasto },
            data: {
              monto: monto > 0 ? monto : gastoExistente.monto,
              concepto: concepto || gastoExistente.concepto,
              categoria: categoria || gastoExistente.categoria,
            },
          });
        }
      }

      return {
        nuevoStock,
      };
    });

    revalidatePath("/dashboard/inventario");
    return {
      success: true,
      message: `Movimiento actualizado. Nuevo stock: ${result.nuevoStock}.`,
    };
  } catch (err: unknown) {
    return { success: false, message: err instanceof Error ? err.message : "Error inesperado." };
  }
}
