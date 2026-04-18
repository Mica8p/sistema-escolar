import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AlumnoService } from "@/service/alumno.service";
import { getDetalleCuenta, getAlumnosConEstadoDeCuenta, getConceptosDePago } from "@/service/finanzas.service";
import { getCicloActual, getCicloActivoDelSistema } from "@/lib/ciclo-session";
import AdminFinanzasView from "@/components/modules/finanzas/AdminFinanzasView";
import PadreFinanzasView from "@/components/modules/finanzas/PadreFinanzasView";

export default async function FinanzasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRoles = session.user.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isPadre = userRoles.includes("PADRE");

  // Obtener información del ciclo
  const [idCicloActual, cicloActivoDelSistema] = await Promise.all([
    getCicloActual(),
    getCicloActivoDelSistema()
  ]);

  const esElCicloActivo = idCicloActual === cicloActivoDelSistema?.idCiclo;

  // === VISTA PARA PADRES (Solo ven a sus hijos) ===
  if (isPadre && !isAdmin) {
    const idPadre = session.user.idPadre;
    if (!idPadre) return <div className="p-6 text-red-600">Error: No se encontró información del perfil de padre.</div>;

    const hijos = await AlumnoService.getAlumnosDePadre(Number(idPadre));

    const estadosDeCuenta = await Promise.all(
        hijos.map(h => getDetalleCuenta(h.idAlumno, idCicloActual))
    );

    return <PadreFinanzasView hijos={hijos} estadosDeCuenta={estadosDeCuenta} esElCicloActivo={esElCicloActivo} />;
  }

  // === VISTA PARA ADMIN (Gestión global) ===
  const [alumnosDeudores, conceptos] = await Promise.all([
    getAlumnosConEstadoDeCuenta(idCicloActual),
    getConceptosDePago(idCicloActual)
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AdminFinanzasView
        conceptos={conceptos}
        alumnosDeudores={alumnosDeudores}
        esElCicloActivo={esElCicloActivo}
      />
    </div>
  );
}