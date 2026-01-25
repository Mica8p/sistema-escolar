"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { Rol } from "@prisma/client";

interface FilterFormProps {
  roles: Rol[];
  idRol?: number;
}

export default function FilterForm({ roles, idRol }: FilterFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (event.target.value) {
      params.set('idRol', event.target.value);
    } else {
      params.delete('idRol');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
        <div className="w-full">
          <label htmlFor="idRol" className="block text-sm font-medium text-slate-700 mb-1">
            Filtrar por Rol
          </label>
          <select
            id="idRol"
            name="idRol"
            defaultValue={idRol}
            onChange={handleRoleChange}
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black bg-white"
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.idRol} value={rol.idRol}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>
  );
}
