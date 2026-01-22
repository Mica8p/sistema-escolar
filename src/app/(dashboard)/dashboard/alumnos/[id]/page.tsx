import { AlumnoService } from "@/service/alumno.service";
import { notFound } from "next/navigation";
import AcademicInfo from "@/components/modules/alumnos/AcademicInfo";
import PaymentInfo from "@/components/modules/alumnos/PaymentInfo";
import TutorLink from "@/components/modules/alumnos/TutorLink";

export default async function AlumnoProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alumno = await AlumnoService.getById(Number(id));

  if (!alumno) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Perfil de {alumno.persona.nombre} {alumno.persona.apellido}
        </h1>
        <span className="font-mono text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded">
          Legajo: {alumno.legajo}
        </span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AcademicInfo alumno={alumno} />
          <PaymentInfo alumno={alumno} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <TutorLink alumno={alumno} />
        </div>
      </div>
    </div>
  );
}
