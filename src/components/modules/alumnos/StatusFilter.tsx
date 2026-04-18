import Link from 'next/link';
import { EstadoAcademico } from '@prisma/client';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  currentStatus: EstadoAcademico;
}

const filterOptions: { label: string; value: EstadoAcademico }[] = [
  { label: 'Activos', value: 'Activo' },
  { label: 'Baja', value: 'Retirado' },
  { label: 'Egresados', value: 'Egresado' },
  { label: 'Suspendidos', value: 'Suspendido' },
];

export function StatusFilter({ currentStatus }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm mb-6">
      <span className="text-sm font-semibold mr-2 text-gray-800">Filtrar por estado:</span>
      {filterOptions.map((option) => {
        const href = option.value === 'Activo'
          ? '/dashboard/alumnos'
          : `/dashboard/alumnos?estado=${option.value}`;
        
        const isActive = currentStatus === option.value;

        return (
          <Link
            key={option.value}
            href={href}
            className={cn(
              'px-3 py-1.5 text-sm font-semibold rounded-md transition-all duration-150 ease-in-out',
              isActive
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
