"use server";

import { signIn, signOut, auth, AccountDisabledError } from "@/auth";
import { AuthError } from "next-auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const dni = formData.get("dni");
    const password = formData.get("password");

    if (!dni || !password) return "Faltan credenciales";

    await signIn("credentials", {
      dni,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AccountDisabledError) {
      return "Tu cuenta está deshabilitada. Contacta al administrador.";
    }
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return "DNI o contraseña incorrectos.";
      }
      return "Algo salió mal. Intentá de nuevo.";
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

import { sendPasswordResetEmail } from "@/lib/email";

export async function requestPasswordReset(
  prevState: { message: string | null; isError: boolean },
  formData: FormData,
) {
  const email = formData.get("email") as string;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return {
      message: "Por favor, ingresa un correo electrónico válido.",
      isError: true,
    };
  }

  try {
    const persona = await db.persona.findFirst({
      where: { email: { equals: email } },
      include: { usuario: true },
    });

    if (persona && persona.usuario) {
      const token = uuidv4();
      const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          userId: persona.usuario.idUsuario,
          token,
          expires,
        },
      });

      await sendPasswordResetEmail(persona.email!, token);
    }

    return {
      message:
        "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      isError: false,
    };
  } catch (error) {
    console.error(error);
    return {
      message:
        "Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.",
      isError: true,
    };
  }
}

export async function changePasswordAction(
  prevState: unknown,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.idUsuario)
    return { success: false, message: "No autorizado" };

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      message: "La contraseña debe tener al menos 6 caracteres.",
    };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.usuario.update({
      where: { idUsuario: Number(session.user.idUsuario) },
      data: {
        passwordHash,
        defaultPassword: false,
      },
    });

    return { success: true, message: "Contraseña actualizada correctamente." };
  } catch {
    return { success: false, message: "Error al actualizar la contraseña." };
  }
}

export async function resetPassword(
  prevState: { message: string | null; isError: boolean; success: boolean },
  formData: FormData,
) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return {
      message: "Falta el token de restablecimiento.",
      isError: true,
      success: false,
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      message: "La contraseña debe tener al menos 6 caracteres.",
      isError: true,
      success: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      message: "Las contraseñas no coinciden.",
      isError: true,
      success: false,
    };
  }

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return {
        message: "El token no es válido.",
        isError: true,
        success: false,
      };
    }

    if (new Date() > resetToken.expires) {
      return {
        message: "El token ha expirado.",
        isError: true,
        success: false,
      };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.$transaction([
      db.usuario.update({
        where: { idUsuario: resetToken.userId },

        data: {
          passwordHash,
          defaultPassword: false,
        },
      }),

      db.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return {
      message: "¡Contraseña actualizada con éxito!",
      isError: false,
      success: true,
    };
  } catch (error) {
    console.error("Reset password error:", error);

    return {
      message: "Ocurrió un error al restablecer la contraseña.",
      isError: true,
      success: false,
    };
  }
}
