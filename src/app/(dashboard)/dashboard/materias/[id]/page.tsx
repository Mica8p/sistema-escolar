import { getMateriaById } from '@/lib/actions/materia-actions';
import { MateriaForm } from '@/components/modules/materias/MateriaForm';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditarMateriaPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id)) {
    notFound();
  }

  const materia = await getMateriaById(id);

  if (!materia) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Editar Materia</h1>
      <MateriaForm materia={materia} />
    </div>
  );
}
