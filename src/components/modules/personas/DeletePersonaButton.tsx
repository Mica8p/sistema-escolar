"use client"; // Clave: esto lo hace interactivo

import { deletePersonaAction } from "@/lib/actions/persona-actions";

export default function DeletePersonaButton({ idPersona }: { idPersona: number }) {
  return (
    <form
      action={deletePersonaAction}
      onSubmit={(e) => {
        if (!confirm("¿Estás seguro de que querés desactivar a esta persona?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="idPersona" value={idPersona} />
      <button
        type="submit"
        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
      >
        Inhabilitar
      </button>
    </form>
  );
}