'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

export default function PlanillaSearchBar({ placeholder, onSearchChange }: { placeholder: string; onSearchChange: (term: string) => void }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search')?.toString() || '');

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');

    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onSearchChange(e.target.value);
        }}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={handleSearch}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-1 rounded-full hover:bg-indigo-700"
      >
        <SearchIcon size={14} />
      </button>
    </div>
  );
}
