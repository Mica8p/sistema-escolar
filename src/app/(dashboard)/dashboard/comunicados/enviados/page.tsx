import { auth } from "@/auth";
import { getComunicadosEnviados } from "@/service/comunicado.service";
import EnviadoCard from "@/components/modules/comunicados/EnviadosCard";

export default async function EnviadosPage() {
  const session = await auth();

  if (!session?.user) return null;

  const idUsuario = (session.user as any).idUsuario;
  const enviados = await getComunicadosEnviados(idUsuario);

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Comunicados Enviados</h1>
        <p className="text-slate-500 font-medium">Historial de notificaciones emitidas por tu cuenta</p>
      </header>

      <div className="grid gap-4">
        {enviados.length > 0 ? (
          enviados.map((msg) => (
            <EnviadoCard key={msg.idComunicado} msg={msg} />
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Aún no has enviado ningún comunicado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}