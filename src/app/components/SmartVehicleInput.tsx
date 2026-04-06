import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Check, ChevronRight, X, Pencil, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  carBrands,
  searchVehicles,
  getYearRange,
  shouldAskBrandNew,
  parseVehicleInput,
} from './vehicle-details/vehicleData';
import type { VehicleSuggestion } from './vehicle-details/vehicleData';

type Step = 'vehicle' | 'year' | 'brand-new';

const popularBrands = carBrands.slice(0, 8);

export function SmartVehicleInput() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<Step>('vehicle');
  const [suggestions, setSuggestions] = useState<VehicleSuggestion[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSuggestion | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isBrandNew, setIsBrandNew] = useState<boolean | null>(null);

  const years = getYearRange();
  const parsed = query.trim().length > 2 ? parseVehicleInput(query) : null;
  const hasQuickMatch = parsed?.brand && parsed?.model;

  useEffect(() => {
    if (query.trim().length > 0) {
      setSuggestions(searchVehicles(query));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleQuickMatch = () => {
    if (!parsed?.brand || !parsed?.model) return;
    const brand = carBrands.find((b) => b.name === parsed.brand);
    if (!brand) return;

    const vehicle: VehicleSuggestion = {
      brand: parsed.brand,
      model: parsed.model,
      logo: brand.initial,
      display: `${parsed.brand} ${parsed.model}`,
    };

    if (parsed.year) {
      // We have everything — go straight to quotes
      setSelectedVehicle(vehicle);
      setSelectedYear(parsed.year);
      setIsBrandNew(parsed.isBrandNew ?? null);
      setQuery('');
      setSuggestions([]);

      if (!parsed.isBrandNew && shouldAskBrandNew(parsed.year)) {
        setStep('brand-new');
      } else {
        const brandObj = carBrands.find((b) => b.name === parsed.brand);
        setTimeout(() => {
          navigate('/quotes', {
            state: {
              brand: brandObj,
              model: parsed.model,
              year: parsed.year,
              isBrandNew: parsed.isBrandNew ?? null,
            },
          });
        }, 250);
      }
    } else {
      // Have brand+model, need year
      handleSelectVehicle(vehicle);
    }
  };

  useEffect(() => {
    if (expanded && step === 'vehicle') {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [expanded, step]);

  const openExpanded = (initialQuery?: string) => {
    if (initialQuery) setQuery(initialQuery);
    setExpanded(true);
  };

  const closeExpanded = () => {
    setExpanded(false);
    setQuery('');
    setSuggestions([]);
    setSelectedVehicle(null);
    setSelectedYear(null);
    setIsBrandNew(null);
    setStep('vehicle');
  };

  const handleSelectVehicle = (suggestion: VehicleSuggestion) => {
    setSelectedVehicle(suggestion);
    setQuery('');
    setSuggestions([]);
    setStep('year');
  };

  const handleSelectYear = (year: number) => {
    setSelectedYear(year);
    if (shouldAskBrandNew(year)) {
      setStep('brand-new');
    } else {
      navigateToQuotes(year, null);
    }
  };

  const handleBrandNew = (value: boolean) => {
    setIsBrandNew(value);
    navigateToQuotes(selectedYear!, value);
  };

  const navigateToQuotes = (year: number, brandNew: boolean | null) => {
    const brand = carBrands.find((b) => b.name === selectedVehicle?.brand);
    setTimeout(() => {
      navigate('/quotes', {
        state: {
          brand,
          model: selectedVehicle?.model,
          year,
          isBrandNew: brandNew,
        },
      });
    }, 250);
  };

  const handleEditVehicle = () => {
    setSelectedVehicle(null);
    setSelectedYear(null);
    setIsBrandNew(null);
    setStep('vehicle');
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Collapsed trigger on home page */}
      <div className="space-y-3">
        <p className="text-sm text-[#2D2D2D] font-bold mb-2">Tell us about your car</p>

        {/* Fake search input - opens full screen */}
        <button
          onClick={() => openExpanded()}
          className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-sm text-gray-300 text-left border border-gray-200 relative"
        >
          <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
          e.g. Toyota Camry or just Camry...
        </button>

        {/* Brand grid */}
        <div>
          <p className="text-xs text-gray-400 mb-2.5">Popular brands</p>
          <div className="grid grid-cols-4 gap-2">
            {popularBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => openExpanded(brand.name + ' ')}
                className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl bg-white border border-gray-100 hover:border-gray-300 active:scale-[0.97] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center overflow-hidden">
                  <img src={brand.initial} alt={brand.name} className="w-5 h-5 object-contain" />
                </div>
                <span className="text-xs text-[#2D2D2D] font-medium">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-[#F7F7F7]"
          >
            {/* Header — matches Quotes page */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
              <div className="container mx-auto px-5 py-3 max-w-5xl flex items-center gap-3">
                <button
                  onClick={closeExpanded}
                  className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#2D2D2D]" />
                </button>
                <div>
                  <p className="text-sm text-[#2D2D2D]">Find your car</p>
                  <p className="text-xs text-gray-500">Search or pick a brand to get started</p>
                </div>
              </div>
            </div>

            <div className="px-5 pt-4 pb-8 overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              {/* Confirmed vehicle pill */}
              <AnimatePresence>
                {selectedVehicle && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100 mb-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={selectedVehicle.logo} alt={selectedVehicle.brand} className="w-6 h-6 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2D2D2D] truncate">{selectedVehicle.display}</p>
                      {selectedYear && (
                        <p className="text-xs text-gray-500">{selectedYear}{isBrandNew ? ' · Brand New' : ''}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#2D2D2D]" />
                      <button onClick={handleEditVehicle} className="w-7 h-7 rounded-full bg-[#F7F7F7] flex items-center justify-center">
                        <Pencil className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {/* Step: Vehicle search */}
                {step === 'vehicle' && (
                  <motion.div
                    key="vehicle-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* Real search input */}
                    <p className="text-sm text-[#2D2D2D] font-bold mb-2">What car do you drive?</p>
                    <div className="relative mb-4">
                      <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Nissan Magnite 5 years old..."
                        className="w-full h-12 pl-10 pr-10 rounded-xl bg-white text-sm text-[#2D2D2D] placeholder-gray-300 outline-none border border-gray-200 focus:border-[#2D2D2D] transition-colors"
                      />
                      {query && (
                        <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                          <X className="w-4 h-4 text-gray-300" />
                        </button>
                      )}
                    </div>

                    {/* Quick match card */}
                    {hasQuickMatch && (
                      <motion.button
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleQuickMatch}
                        className="w-full mb-3 p-4 rounded-xl bg-[#F0F0F0] border border-gray-200 text-left flex items-center gap-3 active:scale-[0.98] transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <img
                            src={carBrands.find((b) => b.name === parsed?.brand)?.initial}
                            alt={parsed?.brand}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2D2D2D] font-medium">
                            {parsed?.brand} {parsed?.model}
                            {parsed?.year ? ` · ${parsed.year}` : ''}
                            {parsed?.isBrandNew ? ' · New' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {parsed?.year ? 'Tap to get quotes instantly' : 'Tap to continue'}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </motion.button>
                    )}

                    {/* Suggestions list */}
                    {suggestions.length > 0 ? (
                      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        {suggestions.map((s, i) => (
                          <button
                            key={`${s.brand}-${s.model}`}
                            onClick={() => handleSelectVehicle(s)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F7F7F7] active:scale-[0.99] transition-all ${
                              i > 0 ? 'border-t border-gray-50' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img src={s.logo} alt={s.brand} className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-sm text-[#2D2D2D] flex-1">{s.display}</span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                          </button>
                        ))}
                      </div>
                    ) : query.length === 0 ? (
                      <div>
                        <p className="text-xs text-gray-400 mb-2.5">Or pick a brand to get started</p>
                        <div className="grid grid-cols-4 gap-2">
                          {popularBrands.map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => setQuery(brand.name + ' ')}
                              className="flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl bg-white border border-gray-100 hover:border-gray-300 active:scale-[0.97] transition-all"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#F7F7F7] flex items-center justify-center overflow-hidden">
                                <img src={brand.initial} alt={brand.name} className="w-5 h-5 object-contain" />
                              </div>
                              <span className="text-xs text-[#2D2D2D] font-medium">{brand.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : !hasQuickMatch ? (
                      <p className="text-xs text-gray-400 text-center py-3">No matches found</p>
                    ) : null}
                  </motion.div>
                )}

                {/* Step: Year selection */}
                {step === 'year' && (
                  <motion.div
                    key="year-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-sm text-[#2D2D2D] font-bold mb-3">Great choice! What year is your {selectedVehicle?.model}?</p>
                    <div className="grid grid-cols-4 gap-2">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleSelectYear(year)}
                          className={`h-11 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                            selectedYear === year
                              ? 'bg-[#2D2D2D] text-[#D4D4D4]'
                              : 'bg-white text-[#2D2D2D] border border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step: Brand new question */}
                {step === 'brand-new' && (
                  <motion.div
                    key="brand-new-step"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-sm text-[#2D2D2D] font-bold mb-3">Almost there! Is your {selectedVehicle?.model} brand new?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBrandNew(true)}
                        className={`flex-1 h-11 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                          isBrandNew === true
                            ? 'bg-[#2D2D2D] text-[#D4D4D4]'
                            : 'bg-white text-[#2D2D2D] border border-gray-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        Yes, brand new
                      </button>
                      <button
                        onClick={() => handleBrandNew(false)}
                        className={`flex-1 h-11 rounded-xl text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                          isBrandNew === false
                            ? 'bg-[#2D2D2D] text-[#D4D4D4]'
                            : 'bg-white text-[#2D2D2D] border border-gray-100'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        No, pre-owned
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
