// src/lib/actions/auth-actions.ts
"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

// Agregamos 'prevState' como primer argumento
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const dni = formData.get("dni");
    const password = formData.get("password");

    if (!dni || !password) return "Faltan credenciales";

    // Importante: No envolver el signIn en un try/catch que no relance el error
    // porque NextAuth usa excepciones para manejar las redirecciones.
    await signIn("credentials", {
      dni,
      password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "DNI o contraseña incorrectos.";
        default:
          return "Algo salió mal. Intentá de nuevo.";
      }
    }
    // Si no es un error de Auth, lo relanzamos (para que el redirect funcione)
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function changePasswordAction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.idUsuario) return { success: false, message: "No autorizado" };

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: "La contraseña debe tener al menos 6 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.usuario.update({
      where: { idUsuario: Number(session.user.idUsuario) },
      data: { passwordHash },
    });

    return { success: true, message: "Contraseña actualizada correctamente." };
  } catch (error) {
    return { success: false, message: "Error al actualizar la contraseña." };
  }
}