"use server";

import { PersonaService } from "@/service/persona.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPersonaAction(prevState: any, formData: FormData) {
  try {
    const data = {
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      dni: formData.get("dni") as string,
      email: formData.get("email") as string,
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

export async function updatePersonaAction(idPersona: number, prevState: any, formData: FormData) {
  try {
    const data = {
      nombre: formData.get("nombre") as string,
      apellido: formData.get("apellido") as string,
      dni: formData.get("dni") as string,
      email: formData.get("email") as string,
    };

    await PersonaService.update(idPersona, data);
    revalidatePath("/dashboard/personas");
  } catch (error) {
    return "Error al actualizar los datos.";
  }
  redirect("/dashboard/personas?success=updated");
}