import { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

interface SelectModelProps {
  brandName: string;
  models: string[];
  onSelect: (model: string) => void;
}

export function SelectModel({ brandName, models, onSelect }: SelectModelProps) {
  const [query, setQuery] = useState('');

  const filtered = models.filter((m) =>
    m.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-5 pt-2 pb-6">
      <h2 className="text-xl tracking-tight text-[#163300] font-bold mb-0.5">
        Select Model
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Choose your {brandName} model
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search models..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F7F7F7] text-sm text-[#163300] placeholder-gray-300 outline-none border border-transparent focus:border-[#9FE870] transition-colors"
        />
      </div>

      {/* Model list */}
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-300">No models found</p>
          </div>
        ) : (
          filtered.map((model) => (
            <button
              key={model}
              onClick={() => onSelect(model)}
              className="w-full text-left px-4 py-3.5 flex items-center justify-between rounded-xl hover:bg-[#F7F7F7] active:scale-[0.98] transition-all"
            >
              <span className="text-sm text-[#163300]">{model}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
