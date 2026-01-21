"use client";

import { useState } from "react";
import RegistrarPagoModal from "./RegistrarPagoModal";
import { getDetalleCuenta } from "@/service/finanzas.service";

type Props = {
  alumno: Awaited<ReturnType<typeof getDetalleCuenta>>;
};

export function RegistrarPagoWrapper({ alumno }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm font-medium mr-2"
      >
        Registrar Pago
      </button>
      <RegistrarPagoModal
        alumno={alumno}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}