import { getAlumnosConEstadoDeCuenta } from "@/service/finanzas.service";
import ReporteDeudoresTable from "@/components/modules/finanzas/ReporteDeudoresTable";
import PaginationControls from "@/components/shared/PaginationControls";

export default async function ReporteDeudoresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const todosLosAlumnos = await getAlumnosConEstadoDeCuenta();

  const deudores = todosLosAlumnos
    .filter((a) => a.deudaTotal > 0)
    .map((a) => ({
      ...a,
      deudaFormateada: new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(a.deudaTotal),
    }));

  const page = params["page"] ?? "1";
  const perPage = 5;
  const currentPage = Math.max(Number(page), 1);

  const paginatedDeudores = deudores.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const totalPages = Math.ceil(deudores.length / perPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const totalDeudores = deudores.length;
  const montoGlobal = deudores.reduce((acc, a) => acc + a.deudaTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Reporte de Morosidad
          </h1>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            Ciclo Lectivo 2026 - Corte al {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      <ReporteDeudoresTable
        deudores={paginatedDeudores}
        totalDeudores={totalDeudores}
        montoGlobal={montoGlobal}
      />
      <PaginationControls
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        totalPages={totalPages}
      />
    </div>
  );
}