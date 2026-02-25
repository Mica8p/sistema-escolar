import { getCursoById } from '@/lib/actions/curso-actions';
import { CursoForm } from '@/components/modules/cursos/CursoForm';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default async function EditarCursoPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const id = parseInt(resolvedParams.id, 10);
  if (isNaN(id)) {
    notFound();
  }

  const curso = await getCursoById(id);

  if (!curso) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Editar Curso</h1>
      <CursoForm curso={curso} />
    </div>
  );
}
