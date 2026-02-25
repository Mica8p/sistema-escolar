import { auth } from "@/auth";
import { getComunicadosEnviados } from "@/service/comunicado.service";
import FiltroComunicados from "@/components/modules/comunicados/FiltroComunicados";
import { redirect } from "next/navigation";

export default async function EnviadosPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  const idUsuario = (session.user as any).idUsuario;
  const enviados = await getComunicadosEnviados(idUsuario);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto min-h-screen">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">
          Comunicados Enviados
        </h1>
        <p className="text-slate-500 font-medium italic">Historial de notificaciones emitidas por tu cuenta</p>
      </header>

      <main>
        <FiltroComunicados data={enviados} isEnviados={true} />
      </main>
    </div>
  );
}