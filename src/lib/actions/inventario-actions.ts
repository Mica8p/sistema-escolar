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

// Normaliza para comparar nombres (sin tocar BD):
// - trim
// - colapsa espacios múltiples
// - lowercase
function normalizeKey(value: unknown) {
  return normalizeText(value)
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


export async function createInsumo(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const roles = session.user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  if (!isAdmin) return { success: false, message: "Solo ADMIN puede crear insumos." };

  const nombre = normalizeText(formData.get("nombre"));
  const unidadMedida = normalizeText(formData.get("unidadMedida"));
  const stockActual = toInt(formData.get("stockActual"), 0);
  const stockMinimo = toInt(formData.get("stockMinimo"), 0);

  if (!nombre) return { success: false, message: "El nombre es obligatorio." };
  if (!unidadMedida) return { success: false, message: "La unidad de medida es obligatoria." };
  if (stockActual < 0) return { success: false, message: "El stock actual no puede ser negativo." };
  if (stockMinimo < 0) return { success: false, message: "El stock mínimo no puede ser negativo." };

  // Anti-duplicados (case-insensitive + espacios)
  const key = normalizeKey(nombre);

  // Primero una búsqueda rápida case-insensitive por "contains" (reduce filas),
  // luego verificamos exactitud con normalizeKey para cubrir espacios.
  const existentes = await db.inventario.findMany({
  select: { nombre: true },
});

const existe = existentes.some(
  (i) => normalizeKey(i.nombre) === key
);

if (existe) {
  return { success: false, message: "Ya existe un insumo con ese nombre." };
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

export async function updateInsumo(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "No autorizado" };

  const roles = session.user.roles ?? [];
  const isAdmin = roles.includes("ADMIN");
  if (!isAdmin) return { success: false, message: "Solo ADMIN puede editar insumos." };

  const idInsumo = toInt(formData.get("idInsumo"));
  const nombre = normalizeText(formData.get("nombre"));
  const unidadMedida = normalizeText(formData.get("unidadMedida"));
  const stockMinimo = toInt(formData.get("stockMinimo"), 0);

  if (!idInsumo) return { success: false, message: "ID inválido." };
  if (!nombre) return { success: false, message: "El nombre es obligatorio." };
  if (!unidadMedida) return { success: false, message: "La unidad de medida es obligatoria." };
  if (stockMinimo < 0) return { success: false, message: "El stock mínimo no puede ser negativo." };

  // Anti-duplicados en edición (excluye este mismo insumo)
  const key = normalizeKey(nombre);

  const existentes = await db.inventario.findMany({
  where: { NOT: { idInsumo } },
  select: { nombre: true },
});

const existe = existentes.some(
  (i) => normalizeKey(i.nombre) === key
);

if (existe) {
  return { success: false, message: "Ya existe otro insumo con ese nombre." };
}

  await db.inventario.update({
    where: { idInsumo },
    data: {
      nombre,
      unidadMedida,
      stockMinimo,
    },
  });

  revalidatePath("/dashboard/inventario");
  return { success: true, message: "Insumo actualizado." };
}
