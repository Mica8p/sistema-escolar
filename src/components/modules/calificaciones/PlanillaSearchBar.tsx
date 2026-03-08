'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Search as SearchIcon } from 'lucide-react';

export default function PlanillaSearchBar({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (term: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');

      if (term) {
        params.set('search', term);
      } else {
        params.delete('search');
      }

      replace(`${pathname}?${params.toString()}`);
    }, 300);
  };

  return (
    <div className="relative mb-4 max-w-sm">
      <label htmlFor="search-planilla" className="sr-only">
        Buscar
      </label>
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" />
      <input
        id="search-planilla"
        className="peer block w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 text-slate-700 focus:ring-2 focus:ring-indigo-400"
        placeholder={placeholder}
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('search')?.toString() || ''}
      />
    </div>
  );
}
