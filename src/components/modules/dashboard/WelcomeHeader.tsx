import { Sparkles } from "lucide-react";

export default function WelcomeHeader({ name, roles }: { name: string; roles: string[] }) {
  const esDocente = roles.includes("DOCENTE");
  const esPadre = roles.includes("PADRE");

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Sparkles size={160} className="text-indigo-600" />
      </div>
      <div className="relative z-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">¡Hola, {name.split(" ")[0]}!</h1>
        <p className="text-slate-500 font-medium italic">
          {esDocente ? "Panel docente para gestionar clases y notas." : esPadre ? "Resumen escolar de tu familia." : "Panel de control institucional."}
        </p>
      </div>
    </div>
  );
}