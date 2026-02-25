import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AlumnoService } from "@/service/alumno.service";
import { getDetalleCuenta, getAlumnosConEstadoDeCuenta, getConceptosDePago } from "@/service/finanzas.service";
import { getCicloActual } from "@/lib/ciclo-session";
import EstadoCuentaSummary from "@/components/modules/finanzas/EstadoCuentaSummary";
import CargosList from "@/components/modules/finanzas/CargosList";
import PagosList from "@/components/modules/finanzas/PagosList";
import AdminFinanzasView from "@/components/modules/finanzas/AdminFinanzasView";
import { Wallet, DollarSign } from "lucide-react";

export default async function FinanzasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userRoles = session.user.roles || [];
  const isAdmin = userRoles.includes("ADMIN");
  const isPadre = userRoles.includes("PADRE");

  // === VISTA PARA PADRES (Solo ven a sus hijos) ===
  if (isPadre && !isAdmin) {
    const idPadre = session.user.idPadre;
    if (!idPadre) return <div className="p-6 text-red-600">Error: No se encontró información del perfil de padre.</div>;

    const hijos = await AlumnoService.getAlumnosDePadre(Number(idPadre));

    const estadosDeCuenta = await Promise.all(
        hijos.map(h => getDetalleCuenta(h.idAlumno))
    );

    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Wallet className="h-8 w-8 text-blue-600" />
          Mis Pagos y Cuotas
        </h1>

        {estadosDeCuenta.length > 0 ? (
            estadosDeCuenta.map((estado) => (
                <div key={estado.idAlumno} className="space-y-4 border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {estado.persona.nombre[0]}{estado.persona.apellido[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {estado.persona.apellido}, {estado.persona.nombre}
                            </h2>
                            <p className="text-sm text-gray-500">Legajo: {estado.legajo}</p>
                        </div>
                    </div>

                    <EstadoCuentaSummary alumno={estado} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Cuotas y Cargos
                            </h3>
                            <CargosList cargos={estado.cargos} />
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Wallet className="w-4 h-4" /> Historial de Pagos
                            </h3>
                            <PagosList
                                pagos={estado.pagos}
                                alumnoData={{
                                    nombre: `${estado.persona.nombre} ${estado.persona.apellido}`,
                                    legajo: estado.legajo,
                                    curso: estado.matriculas?.[0]?.curso
                                    ? `${estado.matriculas[0].curso.grado}° "${estado.matriculas[0].curso.seccion}"`
                                    : "Sin curso asignado"
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500 italic">No tenés alumnos asociados a tu cuenta.</p>
            </div>
        )}
      </div>
    );
  }

  // === VISTA PARA ADMIN (Gestión global) ===
  const cicloId = await getCicloActual();
  const [alumnosDeudores, conceptos] = await Promise.all([
    getAlumnosConEstadoDeCuenta(),
    getConceptosDePago()
  ]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <AdminFinanzasView
        conceptos={conceptos}
        alumnosDeudores={alumnosDeudores}
      />
    </div>
  );
}