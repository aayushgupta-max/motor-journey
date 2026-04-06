import { useState } from 'react';
import { Search } from 'lucide-react';
import { carBrands } from './vehicleData';
import type { CarBrand } from './vehicleData';

interface SelectBrandProps {
  onSelect: (brand: CarBrand) => void;
}

export function SelectBrand({ onSelect }: SelectBrandProps) {
  const [query, setQuery] = useState('');

  const filtered = carBrands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="px-5 pt-2 pb-6">
      <h2 className="text-xl tracking-tight text-[#2D2D2D] font-bold mb-0.5">
        Select Brand
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Choose your car brand
      </p>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F7F7F7] text-sm text-[#2D2D2D] placeholder-gray-300 outline-none border border-transparent focus:border-[#D4D4D4] transition-colors"
        />
      </div>

      {/* Brand grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-300">No brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {filtered.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onSelect(brand)}
              className="flex flex-col items-center gap-2.5 py-4 px-2 rounded-xl bg-[#F7F7F7] hover:bg-[#EFEFEF] active:scale-[0.98] transition-all border border-transparent hover:border-gray-200"
            >
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={brand.initial}
                  alt={brand.name}
                  className="w-8 h-8 object-contain rounded"
                />
              </div>
              <span className="text-xs text-[#2D2D2D]">{brand.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
