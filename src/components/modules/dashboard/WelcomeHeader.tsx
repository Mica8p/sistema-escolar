import { Sparkles, Zap, UserCheck } from "lucide-react";
import Link from "next/link";

interface ClaseActual {
  idHorario: number;
  horaFin: string;
  asignacion: {
    materia: { nombre: string };
    curso: { grado: string | number; seccion: string };
  };
}

interface WelcomeProps {
  name: string;
  claseActual?: ClaseActual;
}

export default function WelcomeHeader({ name, claseActual }: WelcomeProps) {
  const hora = new Date().getHours();

  let saludo = "¡Hola";
  if (hora >= 6 && hora < 13) saludo = "¡Buen día";
  else if (hora >= 13 && hora < 20) saludo = "¡Buenas tardes";
  else saludo = "¡Buenas noches";

  const fechaHoy = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-indigo-500 via-indigo-400 to-blue-300 p-1 shadow-2xl shadow-indigo-200/40">
      <div className="bg-indigo-900/10 backdrop-blur-md rounded-[2.4rem] p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-center gap-6">

        <div className="relative z-10 text-center lg:text-left">
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-1 uppercase italic">
            {saludo}, {name.split(" ")[0]}!
          </h1>
          <p className="text-indigo-100 font-bold text-[10px] uppercase tracking-[0.2em] opacity-80">
            {fechaHoy}
          </p>
        </div>

        {claseActual ? (
          <div className="relative z-20 flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-4xl border border-white/20 animate-in zoom-in-95 duration-500">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg">
               <Zap size={24} fill="currentColor" />
            </div>
            <div className="text-center md:text-left">
              <span className="bg-amber-400 text-indigo-900 text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase mb-1 inline-block">
                En curso ahora
              </span>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">
                {claseActual.asignacion.materia.nombre}
              </h2>
              <p className="text-[10px] text-indigo-100 font-bold opacity-80">
                {claseActual.asignacion.curso.grado}° &quot;{claseActual.asignacion.curso.seccion}&quot; · Hasta {claseActual.horaFin}
              </p>
            </div>
            <Link
              href={`/dashboard/asistencias/nueva?idHorario=${claseActual.idHorario}`}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2"
            >
              <UserCheck size={14} /> Asistencia
            </Link>
          </div>
        ) : (
          <div className="hidden lg:block opacity-20">
            <Sparkles size={80} className="text-white" />
          </div>
        )}
      </div>

      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
    </div>
  );
}