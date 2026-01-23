"use server";

import { PersonaService } from "@/service/persona.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function createPersonaAction(prevState: any, formData: FormData) {
  try {
    const data = {
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      dni: formData.get("dni") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      direccion: formData.get("direccion") as string,
      idRol: Number(formData.get("idRol")),
    };

    await PersonaService.create(data);

    // Esto limpia la caché para que la tabla se actualice con el nuevo dato
    revalidatePath("/dashboard/personas");
  } catch (error) {
    return "Error al crear la persona. Verificá si el DNI ya existe.";
  }

  // Si sale bien, volvemos al listado
  redirect("/dashboard/personas?success=true");
}

export async function deletePersonaAction(formData: FormData) {
  const idPersona = Number(formData.get("idPersona"));

  await PersonaService.delete(idPersona);

  // Refrescamos la página para que el usuario desaparezca de la lista
  revalidatePath("/dashboard/personas");
}

export async function updatePersonaAction(
  idPersona: number,
  prevState: any,
  formData: FormData
) {
  try {
    const data = {
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      dni: formData.get("dni") as string,
      email: formData.get("email") as string,
      telefono: formData.get("telefono") as string,
      direccion: formData.get("direccion") as string,
    };

    await PersonaService.update(idPersona, data);
    revalidatePath("/dashboard/personas");
  } catch (error) {
    return "Error al actualizar los datos.";
  }
    redirect("/dashboard/personas?success=updated");
  }
  
  export async function getTutoresDisponiblesAction(idAlumno: number) {
    return await PersonaService.getTutoresDisponibles(idAlumno);
  }

export async function habilitarAccesoAction(idPersona: number, dni: string) {
  try {
    // 1. Hashear el DNI para usarlo como contraseña
    const passwordHash = await bcrypt.hash(dni, 10);

    // 2. Buscar el usuario asociado a la persona
    const usuario = await db.usuario.findFirst({
      where: { idPersona },
    });

    if (!usuario) {
      return { success: false, message: "Usuario no encontrado para esta persona." };
    }

    // 3. Actualizar la contraseña y activar la cuenta
    await db.usuario.update({
      where: { idUsuario: usuario.idUsuario },
      data: { passwordHash, estado: true },
    });

    revalidatePath("/dashboard/personas");
    return { success: true, message: `Acceso habilitado. La contraseña es: ${dni}` };
  } catch (error) {
    console.error("Error habilitando acceso:", error);
    return { success: false, message: "Error al habilitar el acceso." };
  }
}
  