import { CursoForm } from '@/components/modules/cursos/CursoForm';

export default function NuevoCursoPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Agregar Nuevo Curso</h1>
      <CursoForm />
    </div>
  );
}
