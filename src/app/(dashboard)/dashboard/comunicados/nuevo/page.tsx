import FormComunicado from "@/components/modules/comunicados/FormComunicado";
import { Megaphone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { getCursosParaComunicado } from "@/service/curso.service";



export default async function NuevoComunicadoPage() {

  const session = await auth();
  const user = session?.user as { roles?: string[]; idProfesor?: number } | undefined;
  const roles = user?.roles || [];
  const idProfesor = user?.idProfesor;
  const rolPrincipal = roles.includes("ADMIN") ? "ADMIN" : "DOCENTE";

  const cursos = await getCursosParaComunicado(rolPrincipal, idProfesor);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/comunicados" className="p-3 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 border border-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Nuevo Comunicado</h1>
            <p className="text-slate-500 font-medium">Redacta una notificación oficial</p>
          </div>
        </div>
        <div className="hidden md:block p-4 bg-indigo-50 rounded-3xl">
          <Megaphone className="text-indigo-600" size={32} />
        </div>
      </div>

      <FormComunicado cursos={cursos} rolPrincipal={rolPrincipal} />
    </div>
  );
}
