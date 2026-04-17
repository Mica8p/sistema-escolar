"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";

type ActionState = { ok: boolean; message: string };

const MAX_BYTES = 2 * 1024 * 1024; 
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    return { ok: false, message: "La nueva contraseña y la confirmación no coinciden." };
  }
  if (nueva.length < 6) {
    return { ok: false, message: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  const idUsuario = session.user.idUsuario;

  const usuario = await db.usuario.findUnique({
    where: { idUsuario },
    select: { passwordHash: true },
  });

  if (!usuario?.passwordHash) return { ok: false, message: "No se pudo validar tu cuenta." };

  const passOk = await bcrypt.compare(actual, usuario.passwordHash);
  if (!passOk) return { ok: false, message: "La contraseña actual es incorrecta." };

  const newHash = await bcrypt.hash(nueva, 10);

  await db.usuario.update({
    where: { idUsuario },
    data: { passwordHash: newHash },
  });

  revalidatePath("/perfil");
  revalidatePath("/");

  return { ok: true, message: "Contraseña modificada exitosamente." };
}

export async function updatePersonalDataAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "No autorizado." };

  const idPersona = session.user.idPersona;
  
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();

  if (!nombre || !apellido) {
    return { ok: false, message: "Nombre y apellido son obligatorios." };
  }

  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, message: "Email inválido." };
  }

  try {
    await db.persona.update({
      where: { idPersona },
      data: {
        nombre,
        apellido,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
      },
    });

    revalidatePath("/perfil");
    revalidatePath("/");

    return { ok: true, message: "Datos personales actualizados exitosamente." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "No se pudieron actualizar los datos. Intentá de nuevo." };
  }
}

// HELPERS PERMISOS

interface AuthSessionWithPersona {
  user?: {
    idPersona?: number;
    roles?: string[];
  };
}

async function canEditPersonaAvatar(session: AuthSessionWithPersona, targetIdPersona: number) {
  const myIdPersona = session.user?.idPersona;
  const roles: string[] = session.user?.roles ?? [];

  if (myIdPersona === targetIdPersona) return true;

  if (roles.includes("ADMIN")) return true;

  if (roles.includes("PADRE")) {
    const padre = await db.padre.findUnique({
      where: { idPersona: myIdPersona },
      select: { idPadre: true },
    });

    if (!padre) return false;

    const vinculo = await db.alumnoPadre.findFirst({
      where: {
        idPadre: padre.idPadre,
        alumno: { persona: { idPersona: targetIdPersona } },
      },
      select: { idAlumno: true },
    });

    return !!vinculo;
  }

  return false;
}

export async function updateAvatarAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "No autorizado." };

  const target = Number(formData.get("idPersona") ?? session.user.idPersona);
  if (!target) return { ok: false, message: "Falta idPersona." };

  const allowed = await canEditPersonaAvatar(session, target);
  if (!allowed) return { ok: false, message: "No tenés permisos para cambiar esa foto." };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { ok: false, message: "Seleccioná una imagen." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Formato inválido. Usá JPG, PNG o WEBP." };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, message: "La imagen es muy grande (máx 2MB)." };
  }

  try {
    // 1) Traigo el avatar anterior (para borrarlo)
    const persona = await db.persona.findUnique({
      where: { idPersona: target },
      select: { avatarPublicId: true },
    });

    // 2) Subo a Cloudinary (stream)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "sistema-escolar/avatars",
            resource_type: "image",
            allowed_formats: ["jpg", "png", "webp", "jpeg"],
          },
          (err, result) => {
            if (err || !result) return reject(err ?? new Error("Upload falló"));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(buffer);
      }
    );

    // 3) Borro anterior (si existe)
    if (persona?.avatarPublicId) {
      await cloudinary.uploader.destroy(persona.avatarPublicId, { resource_type: "image" });
    }

    // 4) Guardo en BD + cache-buster para evitar que se vea la foto vieja
    await db.persona.update({
      where: { idPersona: target },
      data: {
        avatarUrl: `${uploaded.secure_url}?v=${Date.now()}`,
        avatarPublicId: uploaded.public_id,
      },
    });

    // 5) Revalidar
    revalidatePath("/perfil");
    revalidatePath("/");

    return { ok: true, message: "Foto actualizada." };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "No se pudo actualizar la foto. Probá de nuevo." };
  }
}

// AVATAR - DELETE

export async function deleteAvatarAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "No autorizado." };

  const target = Number(formData.get("idPersona") ?? session.user.idPersona);
  if (!target) return { ok: false, message: "Falta idPersona." };

  const allowed = await canEditPersonaAvatar(session, target);
  if (!allowed) return { ok: false, message: "No tenés permisos para borrar esa foto." };

  try {
    const persona = await db.persona.findUnique({
      where: { idPersona: target },
      select: { avatarPublicId: true },
    });

    if (persona?.avatarPublicId) {
      await cloudinary.uploader.destroy(persona.avatarPublicId, { resource_type: "image" });
    }

    await db.persona.update({
      where: { idPersona: target },
      data: { avatarUrl: null, avatarPublicId: null },
    });

    revalidatePath("/perfil");
    revalidatePath("/");

    return { ok: true, message: "Foto eliminada." };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "No se pudo borrar la foto." };
  }
}
