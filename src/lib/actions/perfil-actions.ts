"use server";

import { auth } from "@/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

type ActionState = {
  ok: boolean;
  message: string;
};

export async function cambiarPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "No autorizado." };

  const actual = String(formData.get("actual") ?? "");
  const nueva = String(formData.get("nueva") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");

  if (!actual || !nueva || !confirmar) {
    return { ok: false, message: "Completá los 3 campos." };
  }

  if (nueva !== confirmar) {
    return {
      ok: false,
      message: "La nueva contraseña y la confirmación no coinciden.",
    };
  }

  if (nueva.length < 6) {
    return {
      ok: false,
      message: "La nueva contraseña debe tener al menos 6 caracteres.",
    };
  }

  const idUsuario = session.user.idUsuario;

  const usuario = await db.usuario.findUnique({
    where: { idUsuario },
    select: { passwordHash: true },
  });

  if (!usuario?.passwordHash) {
    return { ok: false, message: "No se pudo validar tu cuenta." };
  }

  const passOk = await bcrypt.compare(actual, usuario.passwordHash);
  if (!passOk) {
    return { ok: false, message: "La contraseña actual es incorrecta." };
  }

  const newHash = await bcrypt.hash(nueva, 10);

  await db.usuario.update({
    where: { idUsuario },
    data: { passwordHash: newHash },
  });

  return { ok: true, message: "Contraseña modificada exitosamente." };
}
