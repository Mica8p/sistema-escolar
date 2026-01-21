"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { createDeuda, type State } from "./finanzas-actions";

// Asumimos que tienes estos componentes de UI (estilo shadcn)
// Si los nombres son diferentes, habría que ajustarlos.
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { toast } from "sonner";

// El tipo para los conceptos de pago, inferido de tu schema.prisma
interface ConceptoDePago {
  id: number;
  nombre: string;
  montoFijo: number | null;
}

interface CrearDeudaDialogProps {
  alumnoId: number;
  conceptos: ConceptoDePago[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando Deuda..." : "Crear Deuda"}
    </Button>
  );
}

export function CrearDeudaDialog({ alumnoId, conceptos }: CrearDeudaDialogProps) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createDeuda, initialState);

  const [open, setOpen] = useState(false);
  const [selectedConceptoId, setSelectedConceptoId] = useState<string>("");
  const [monto, setMonto] = useState<string>("");

  // Efecto para actualizar el monto cuando se selecciona un concepto con monto fijo
  useEffect(() => {
    const selectedConcepto = conceptos.find(c => c.id === Number(selectedConceptoId));
    if (selectedConcepto && selectedConcepto.montoFijo) {
      setMonto(String(selectedConcepto.montoFijo));
    } else {
      setMonto(""); // Resetea si no hay monto fijo
    }
  }, [selectedConceptoId, conceptos]);

  // Efecto para cerrar el modal y mostrar notificación en éxito
  useEffect(() => {
    if (state.message && !state.errors) {
      setOpen(false);
      toast.success(state.message);
    } else if (state.message && state.errors) {
      toast.error(state.message)
    }
  }, [state]);


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Deuda</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Deuda</DialogTitle>
          <DialogDescription>
            Asigna un nuevo cargo o deuda al alumno. Selecciona un concepto y define los detalles.
          </DialogDescription>
        </DialogHeader>
        <form action={dispatch}>
          <input type="hidden" name="alumnoId" value={alumnoId} />
          <div className="grid gap-4 py-4">
            
            {/* Selector de Concepto */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="conceptoId" className="text-right">
                Concepto
              </Label>
              <div className="col-span-3">
                <Select name="conceptoId" value={selectedConceptoId} onValueChange={setSelectedConceptoId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un concepto" />
                    </SelectTrigger>
                    <SelectContent>
                        {conceptos.map((concepto) => (
                            <SelectItem key={concepto.id} value={String(concepto.id)}>
                                {concepto.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {state.errors?.conceptoId && <p className="text-sm text-red-500 mt-1">{state.errors.conceptoId[0]}</p>}
              </div>
            </div>

            {/* Campo de Monto */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monto" className="text-right">
                Monto
              </Label>
              <Input
                id="monto"
                name="monto"
                type="number"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="col-span-3"
                placeholder="Ej: 1500.00"
              />
               {state.errors?.monto && <p className="col-start-2 col-span-3 text-sm text-red-500 mt-1">{state.errors.monto[0]}</p>}
            </div>

            {/* Campo de Fecha de Vencimiento */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fechaVencimiento" className="text-right">
                Vencimiento
              </Label>
              <Input
                id="fechaVencimiento"
                name="fechaVencimiento"
                type="date"
                className="col-span-3"
              />
              {state.errors?.fechaVencimiento && <p className="col-start-2 col-span-3 text-sm text-red-500 mt-1">{state.errors.fechaVencimiento[0]}</p>}
            </div>

          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="ghost">Cancelar</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
