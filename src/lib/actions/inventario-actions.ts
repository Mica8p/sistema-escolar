"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getCicloActual } from "@/lib/ciclo-session";
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


function normalizeKey(value: unknown) {
  return normalizeText(value)
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function requireAdmin(session: any) {
  const roles = session?.user?.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  if (!isAdmin) {
    return { success: false, message: "Solo ADMIN." } as const;
  }
  return null;
}

/* =========================
   Crear insumo
========================= */

export async function createInsumo(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const nombre = normalizeText(formData.get("nombre"));
  const unidadMedida = normalizeText(formData.get("unidadMedida"));
  const stockActual = toInt(formData.get("stockActual"), 0);
  const stockMinimo = toInt(formData.get("stockMinimo"), 0);

  if (!nombre) return { success: false, message: "El nombre es obligatorio." };
  if (!unidadMedida) return { success: false, message: "La unidad de medida es obligatoria." };
  if (stockActual < 0) return { success: false, message: "El stock actual no puede ser negativo." };
  if (stockMinimo < 0) return { success: false, message: "El stock mínimo no puede ser negativo." };

  const key = normalizeKey(nombre);

  const existentes = await db.inventario.findMany({
    select: { nombre: true },
  });

  const existe = existentes.some((i) => normalizeKey(i.nombre) === key);

  if (existe) {
    return { success: false, message: "Ya existe un insumo con ese nombre en este ciclo." };
  }

  await db.inventario.create({
    data: {
      nombre,
      unidadMedida,
      stockActual,
      stockMinimo,
    },
  });

  revalidatePath("/dashboard/inventario");
  return { success: true, message: "Insumo creado." };
}

/* =========================
   Actualizar insumo
========================= */

export async function updateInsumo(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const adminError = requireAdmin(session);
  if (adminError) return adminError;

  const idInsumo = toInt(formData.get("idInsumo"));
  const nombre = normalizeText(formData.get("nombre"));
  const unidadMedida = normalizeText(formData.get("unidadMedida"));
  const stockActual = toInt(formData.get("stockActual"), -1);
  const stockMinimo = toInt(formData.get("stockMinimo"), 0);

  if (!idInsumo) return { success: false, message: "ID inválido." };
  if (!nombre) return { success: false, message: "El nombre es obligatorio." };
  if (!unidadMedida) return { success: false, message: "La unidad de medida es obligatoria." };
  if (stockMinimo < 0) return { success: false, message: "El stock mínimo no puede ser negativo." };

  const insumoActual = await db.inventario.findUnique({
    where: { idInsumo },
    select: { nombre: true },
  });

  if (!insumoActual) return { success: false, message: "Insumo no encontrado." };

  const key = normalizeKey(nombre);

  const existentes = await db.inventario.findMany({
    where: { NOT: { idInsumo } },
    select: { nombre: true },
  });

  const existe = existentes.some((i) => normalizeKey(i.nombre) === key);

  if (existe) {
    return { success: false, message: "Ya existe otro insumo con ese nombre en este ciclo." };
  }

  const updateData: any = {
    nombre,
    unidadMedida,
    stockMinimo,
  };

  if (stockActual >= 0) {
    updateData.stockActual = stockActual;
  }

  await db.inventario.update({
    where: { idInsumo },
    data: updateData,
  });

  revalidatePath("/dashboard/inventario");
  return { success: true, message: "Insumo actualizado." };
}
