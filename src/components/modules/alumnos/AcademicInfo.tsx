import { Alumno } from "@prisma/client";

// This is a type definition for the extended Alumno object that we're getting from the service
type AlumnoExtendido = Alumno & {
  matriculas: any[]; // Define this more accurately based on your data
  // Add other extended properties here
};


export default function AcademicInfo({ alumno }: { alumno: AlumnoExtendido }) {
  const matriculaActual = alumno.matriculas[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Información Académica</h2>
      
      {matriculaActual ? (
        <div>
          <p className="text-gray-800"><strong>Curso:</strong> {matriculaActual.curso.grado}° "{matriculaActual.curso.seccion}" - {matriculaActual.curso.turno}</p>
          <p className="text-gray-800"><strong>Estado:</strong> {matriculaActual.estadoAcademico}</p>
          
          <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Calificaciones</h3>
          {matriculaActual.notas.length > 0 ? (
            <ul className="space-y-2">
              {matriculaActual.notas.map((nota: any) => (
                <li key={nota.idNota} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <div>
                    <span className="font-semibold">{nota.asignacion.materia.nombre}</span>
                    <span className="text-xs text-gray-500 ml-2">({nota.tipo})</span>
                  </div>
                  <span className="font-bold text-lg">{nota.nota}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No hay calificaciones registradas para este período.</p>
          )}
        </div>
      ) : (
        <p className="text-red-500 italic">El alumno no está matriculado en el ciclo actual.</p>
      )}
    </div>
  );
}
