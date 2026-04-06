import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { getYearRange, shouldAskBrandNew } from './vehicleData';

interface SelectYearProps {
  modelName: string;
  onSelect: (year: number, isBrandNew: boolean | null) => void;
}

export function SelectYear({ modelName, onSelect }: SelectYearProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isBrandNew, setIsBrandNew] = useState<boolean | null>(null);
  const years = getYearRange();

  const handleYearTap = (year: number) => {
    setSelectedYear(year);
    setIsBrandNew(null);

    if (!shouldAskBrandNew(year)) {
      setTimeout(() => onSelect(year, null), 250);
    }
  };

  const handleBrandNew = (value: boolean) => {
    setIsBrandNew(value);
    setTimeout(() => onSelect(selectedYear!, value), 250);
  };

  return (
    <div className="px-5 pt-2 pb-6">
      <h2 className="text-xl tracking-tight text-[#163300] font-bold mb-0.5">
        Model Year
      </h2>
      <p className="text-sm text-gray-400 mb-5">
        When was your {modelName} made?
      </p>

      {/* Year grid */}
      <div
        className="grid grid-cols-3 gap-2.5 overflow-y-auto pb-2"
        style={{ maxHeight: 'calc(100vh - 320px)' }}
      >
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearTap(year)}
            className={`h-12 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
              selectedYear === year
                ? 'bg-[#163300] text-[#9FE870]'
                : 'bg-[#F7F7F7] text-[#163300] hover:bg-[#EFEFEF]'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Brand new question */}
      <AnimatePresence>
        {selectedYear !== null && shouldAskBrandNew(selectedYear) && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-[#F7F7F7] rounded-xl p-4 mt-4">
              <p className="text-sm text-[#163300] font-medium mb-3">
                Is this car brand new?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBrandNew(true)}
                  className={`flex-1 h-10 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    isBrandNew === true
                      ? 'bg-[#163300] text-[#9FE870]'
                      : 'bg-white text-[#163300] border border-gray-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Yes
                </button>
                <button
                  onClick={() => handleBrandNew(false)}
                  className={`flex-1 h-10 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                    isBrandNew === false
                      ? 'bg-[#163300] text-[#9FE870]'
                      : 'bg-white text-[#163300] border border-gray-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
