import db from "@/lib/db";
import { Settings, Clock } from "lucide-react";
import HorarioConfigManager from "./HorarioConfigManager";

export default async function ConfiguracionHorariosPage() {

  const [dias, bloquesManana, bloquesTarde] = await Promise.all([
    db.diaHabil.findMany({
      orderBy: { orden: 'asc' }
    }),
    db.bloqueHorario.findMany({
      where: { turno: 'Mañana' },
      orderBy: { orden: 'asc' }
    }),
    db.bloqueHorario.findMany({
      where: { turno: 'Tarde' },
      orderBy: { orden: 'asc' }
    })
  ]);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <header className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-gray-400" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Configuración de Horarios
          </h1>
          <p className="text-gray-500">
            Define los días y bloques horarios para la planificación académica.
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <HorarioConfigManager
            diasHabiles={dias}
            bloquesManana={bloquesManana}
            bloquesTarde={bloquesTarde}
        />
      </div>

    </div>
  );
}
