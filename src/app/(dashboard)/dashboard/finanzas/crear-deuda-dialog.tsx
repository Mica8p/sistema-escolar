"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useReducer, useRef, useEffect } from "react";
import { createDeuda, type State } from "./finanzas-actions";
import { toast } from "sonner";
import { X, DollarSign, Loader2 } from "lucide-react";

interface ConceptoDePago {
  id: number;
  nombre: string;
  montoFijo: number | null;
}

type DialogState = {
  open: boolean;
  selectedConceptoId: string;
};

type DialogAction = 
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SELECT_CONCEPTO'; payload: string }
  | { type: 'CLOSE_ON_SUCCESS' };

const dialogReducer = (state: DialogState, action: DialogAction): DialogState => {
  switch (action.type) {
    case 'OPEN':
      return { ...state, open: true };
    case 'CLOSE':
      return { ...state, open: false, selectedConceptoId: '' };
    case 'SELECT_CONCEPTO':
      return { ...state, selectedConceptoId: action.payload };
    case 'CLOSE_ON_SUCCESS':
      return { ...state, open: false, selectedConceptoId: '' };
    default:
      return state;
  }
};

export function CrearDeudaDialog({ alumnoId, conceptos }: { alumnoId: number; conceptos: ConceptoDePago[] }) {
  const initialState: State = {
    message: "",
    errors: {}
  };

  const [dialogState, dispatch] = useReducer(dialogReducer, { open: false, selectedConceptoId: '' });
  const montoInputRef = useRef<HTMLInputElement>(null);
  const hasProcessedRef = useRef(false);

  const [state, formDispatch] = useFormState(createDeuda, initialState);

  // Actualizar monto automático cuando cambia el concepto
  const handleConceptoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const conceptoId = e.target.value;
    dispatch({ type: 'SELECT_CONCEPTO', payload: conceptoId });
    
    const selected = conceptos.find(c => c.id === Number(conceptoId));
    if (montoInputRef.current && selected?.montoFijo) {
      montoInputRef.current.value = String(selected.montoFijo);
    } else if (montoInputRef.current) {
      montoInputRef.current.value = "";
    }
  };

  // Cerrar dialog cuando hay éxito (usando dispatch, no setState)
  useEffect(() => {
    if (state.message && !Object.keys(state.errors || {}).length && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      toast.success(state.message);
      dispatch({ type: 'CLOSE_ON_SUCCESS' });
      hasProcessedRef.current = false;
    }
  }, [state.message, state.errors]);

  const { open, selectedConceptoId } = dialogState;

  if (!open) {
    return (
      <button
        onClick={() => dispatch({ type: 'OPEN' })}
        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
      >
        Crear Deuda
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 pb-0 flex flex-col items-center text-center relative">
          <button onClick={() => dispatch({ type: 'CLOSE' })} className="absolute top-0 right-0 p-2 text-slate-400 hover:bg-slate-50 rounded-full">
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
            <DollarSign size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">Nueva Deuda</h2>
          <p className="text-slate-500 text-sm font-medium">Asigna un nuevo cargo al alumno.</p>
        </div>

        <form action={formDispatch} className="p-8 space-y-4">
          <input type="hidden" name="alumnoId" value={alumnoId} />

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Concepto</label>
            <select
              name="conceptoId"
              value={selectedConceptoId}
              onChange={handleConceptoChange}
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-700 font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="">Seleccionar...</option>
              {conceptos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Monto</label>
            <input
              ref={montoInputRef}
              name="monto"
              type="number"
              step="0.01"
              defaultValue=""
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-700 font-bold outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Vencimiento</label>
            <input
              name="fechaVencimiento"
              type="date"
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl text-slate-700 font-bold outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => dispatch({ type: 'CLOSE' })} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200">
              Cancelar
            </button>
            <SubmitBtn />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50">
      {pending ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Crear Deuda"}
    </button>
  );
}
