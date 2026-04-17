import InventarioView from "@/components/modules/inventario/InventarioView";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ ciclo?: string }>;
}

export default async function InventarioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cicloParam = params?.ciclo ? Number(params.ciclo) : undefined;

  return <InventarioView />;
}
