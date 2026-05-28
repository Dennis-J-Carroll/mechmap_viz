'use client';

import { useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';

export function SearchBar() {
  const { filterQuery, setFilterQuery, clearFilters } = useTransformerStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFilterQuery(value), 150);
  }, [setFilterQuery]);

  const handleClear = useCallback(() => {
    clearFilters();
    const input = document.getElementById('mechmap-search') as HTMLInputElement;
    if (input) { input.value = ''; input.focus(); }
  }, [clearFilters]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
      <input
        id="mechmap-search"
        type="text"
        defaultValue={filterQuery}
        onChange={handleChange}
        placeholder="Search components, tags, notes..."
        aria-label="Search annotations"
        autoComplete="off"
        className="h-8 w-56 pl-7 pr-7 text-xs bg-slate-800/60 border border-[rgba(0,188,212,0.2)] rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00bcd4] focus:ring-1 focus:ring-[#00bcd4] transition-colors"
      />
      {filterQuery && (
        <button
          onClick={handleClear}
          className="absolute right-2 text-slate-500 hover:text-slate-300"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
