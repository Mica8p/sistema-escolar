"use client";

import { Trash2 } from "lucide-react";
import { borrarErrorAsignacionAction } from "@/lib/actions/profesor-actions";
import GenericDeleteButton from "@/components/shared/GenericDeletButton";

export default function DeleteErrorButton({ id }: { id: number }) {
  return (
    <GenericDeleteButton
      id={id}
      action={borrarErrorAsignacionAction}
      title="Eliminar Registro"
      message="¿Estás seguro de borrar este registro permanentemente? Solo hacelo si fue un error de carga."
      variant="danger"
      icon={Trash2}
    />
  );
}