import { auth } from "@/auth";
import { getComunicadosRecibidos } from "@/service/comunicado.service";
import { Megaphone, Calendar, User, Plus } from "lucide-react";
import BotonLeido from "@/components/modules/comunicados/BotonLeido";
import Link from "next/link";
import db from "@/lib/db";

export default async function ComunicadosPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-20 text-center">
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
          Debes iniciar sesión para ver tus comunicados.
        </p>
      </div>
    );
  }

  const user = session.user as any;
  const idUsuario = user.idUsuario as number;
  const idPadre = user.idPadre as number | null;
  const roles = user.roles || [];
  const rolPrincipal = roles[0] || "USUARIO";
  const puedeCrear = roles.includes("ADMIN") || roles.includes("DOCENTE");

  let idsCursosHijos: number[] = [];

  if (rolPrincipal === "PADRE" && idPadre) {
    const hijos = await db.alumnoPadre.findMany({
      where: { idPadre: idPadre },
      include: {
        alumno: {
          include: {
            matriculas: {
              where: { estadoAcademico: "Activo" }
            }
          }
        }
      }
    });

    idsCursosHijos = hijos.flatMap(h =>
      h.alumno.matriculas.map(m => m.idCurso)
    );
  }

  const comunicados = await getComunicadosRecibidos(idUsuario, rolPrincipal, idsCursosHijos);

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Bandeja de Comunicados</h1>
          <p className="text-slate-500 font-medium">Información oficial de la institución</p>
        </div>

        {puedeCrear && (
          <Link href="/dashboard/comunicados/nuevo">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
              <Plus size={16} strokeWidth={3} />
              Redactar
            </button>
          </Link>
        )}
      </header>

      <div className="grid gap-4">
  {comunicados.length > 0 ? (
    comunicados.map((msg) => {
      const isRead = msg.vistos.length > 0;
      return (
        <div
          key={msg.idComunicado}
          className={`relative bg-white p-6 rounded-2rem border transition-all ${
            isRead
              ? "border-slate-200 opacity-70"
              : "border-indigo-200 shadow-md ring-1 ring-indigo-50 hover:shadow-xl"
          }`}
        >
          <Link
            href={`/dashboard/comunicados/${msg.idComunicado}`}
            className="absolute inset-0 z-10 rounded-2rem"
            aria-label={`Ver detalle de ${msg.titulo}`}
          />

          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${isRead ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white"}`}>
                <Megaphone size={18} />
              </div>
              <div className="relative z-20"> {/* z-20 para que el texto se vea sobre el link */}
                <h3 className={`font-black tracking-tight ${isRead ? "text-slate-600" : "text-slate-900"} uppercase text-sm`}>
                  {msg.titulo}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                  <User size={10} /> {msg.usuario.persona.nombre} {msg.usuario.persona.apellido}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 relative z-20">
              <Calendar size={12} /> {new Date(msg.fecha).toLocaleDateString()}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2 relative z-20">
            {msg.contenido}
          </p>

          <div className="flex justify-end items-center border-t border-slate-50 pt-4 relative z-30">
            {!isRead ? (
               <div className="relative z-40">
                 <BotonLeido idComunicado={msg.idComunicado} />
               </div>
            ) : (
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                Visto el {new Date(msg.vistos[0].fechaLectura).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
          );
        })
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No hay comunicados disponibles.</p>
          </div>
        )}
      </div>
    </div>
  );
}