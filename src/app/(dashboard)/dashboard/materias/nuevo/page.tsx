import { MateriaForm } from '@/components/modules/materias/MateriaForm';

export default function NuevaMateriaPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Agregar Nueva Materia</h1>
      <MateriaForm />
    </div>
  );
}
