import { Sparkles } from "lucide-react";

export default function WelcomeHeader({ name, roles }: { name: string; roles: string[] }) {
  const esDocente = roles.includes("DOCENTE");
  const esPadre = roles.includes("PADRE");

  const hora = new Date().getHours();
  let saludo = "¡Hola";

  if (hora >= 6 && hora < 13) saludo = "¡Buen día";
  else if (hora >= 13 && hora < 20) saludo = "¡Buenas tardes";
  else saludo = "¡Buenas noches";

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-indigo-600 to-blue-500 p-8 shadow-xl shadow-indigo-200/40">
      <div className="absolute top-0 right-0 p-4 opacity-15">
        <Sparkles size={160} className="text-white" />
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">
          {saludo}, {name.split(" ")[0]}!
        </h1>
        <p className="text-indigo-100 font-bold text-sm tracking-wide">
          {esDocente
            ? "Bienvenido a tu panel de gestión académica. Hoy es martes 3 de febrero."
            : esPadre
              ? "Resumen escolar de tu familia y seguimiento de cuotas."
              : "Panel de control institucional."}
        </p>
      </div>

      <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
    </div>
  );
}