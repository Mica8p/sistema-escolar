// src/lib/actions/auth-actions.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

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