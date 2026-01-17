"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import db from "@/lib/db";

function toInt(value: unknown, fallback = 0) {
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export async function createMovimientoStock(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const roles = session.user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  const isDocente = roles.includes("DOCENTE");

  const idUsuario = session.user.idUsuario;
  if (!idUsuario) return { success: false, message: "Usuario inválido." };

  const idInsumo = toInt(formData.get("idInsumo"));
  const tipo = normalizeText(formData.get("tipo")); // Entrada | Salida | Ajuste
  const cantidadRaw = toInt(formData.get("cantidad"));
  const ajusteSign = normalizeText(formData.get("ajusteSign"));

  if (!idInsumo) return { success: false, message: "Insumo inválido." };
  if (!["Entrada", "Salida", "Ajuste"].includes(tipo)) {
    return { success: false, message: "Tipo de movimiento inválido." };
  }

  // Permisos
  if (!isAdmin) {
    if (!(isDocente && tipo === "Salida")) {
      return { success: false, message: "No tenés permisos para este movimiento." };
    }
  }

  if (cantidadRaw <= 0) {
    return { success: false, message: "La cantidad debe ser mayor a 0." };
  }

  // Delta según tipo
  let delta = 0;
  if (tipo === "Entrada") delta = cantidadRaw;
  if (tipo === "Salida") delta = -cantidadRaw;

  if (tipo === "Ajuste") {
    if (!["sumar", "restar"].includes(ajusteSign)) {
      return { success: false, message: "Indicá si el ajuste suma o resta." };
    }
    delta = ajusteSign === "sumar" ? cantidadRaw : -cantidadRaw;
  }

  // Datos de gasto (opcionales)
  const crearGasto = normalizeText(formData.get("crearGasto")) === "1";
  const monto = Number(formData.get("monto") ?? 0);
  const concepto = normalizeText(formData.get("concepto"));
  const categoria = normalizeText(formData.get("categoria"));

  const result = await db.$transaction(async (tx) => {
    const insumo = await tx.inventario.findUnique({
      where: { idInsumo },
      select: { stockActual: true },
    });

    if (!insumo) {
      return { ok: false, message: "El insumo no existe." };
    }

    const nuevoStock = insumo.stockActual + delta;
    if (nuevoStock < 0) {
      return {
        ok: false,
        message: `Stock insuficiente. Stock actual: ${insumo.stockActual}.`,
      };
    }

    await tx.inventario.update({
      where: { idInsumo },
      data: { stockActual: nuevoStock },
    });

    const mov = await tx.movimientoStock.create({
      data: {
        idInsumo,
        idUsuario,
        tipo: tipo as any,
        cantidad: delta,
        fecha: new Date(),
      },
    });

    // Vincular gasto SOLO para Entrada
    if (tipo === "Entrada" && crearGasto) {
      if (!Number.isFinite(monto) || monto <= 0) {
        return { ok: false, message: "El monto del gasto debe ser mayor a 0." };
      }
      if (!concepto) {
        return { ok: false, message: "El concepto del gasto es obligatorio." };
      }

      const categoriasValidas = ["Mantenimiento", "Servicios", "Insumos", "Sueldos"];
      if (!categoriasValidas.includes(categoria)) {
        return { ok: false, message: "Categoría de gasto inválida." };
      }

      await tx.gastoInstitucional.create({
        data: {
          idUsuario,
          monto,
          fecha: new Date(),
          concepto,
          categoria: categoria as any,
          idMovimiento: mov.idMovimiento,
        },
      });
    }

    return {
      ok: true,
      message: `Movimiento registrado. Nuevo stock: ${nuevoStock}.`,
    };
  });

  if (!result.ok) {
    return { success: false, message: result.message };
  }

  revalidatePath("/dashboard/inventario");
  return { success: true, message: result.message };
}
