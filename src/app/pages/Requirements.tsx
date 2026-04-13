import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Search, Check, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { carBrands, modelsByBrand, getModelImage, getYearRange, shouldAskBrandNew } from '../components/vehicle-details/vehicleData';
import type { CarBrand } from '../components/vehicle-details/vehicleData';
import { emptyQuoteFlowDetails, mergeQuoteFlowDetails } from '../lib/quoteFlow';
import { AiAssistantButton } from '../components/AiAssistantButton';

/* ── Slide animation ────────────────────────────── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function Requirements() {
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill from home brand click
  const initBrand = (location.state as { brand?: CarBrand })?.brand ?? null;

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  // Step 0+1: Brand & Model
  const [brand, setBrand] = useState<CarBrand | null>(null);
  const [query, setQuery] = useState(initBrand ? initBrand.name + ' ' : '');
  const [model, setModel] = useState<string | null>(null);

  // Step 2: Year
  const [year, setYear] = useState<number | null>(null);

  // Step 3: Brand new
  const [isBrandNew, setIsBrandNew] = useState<boolean | null>(null);

  /* ── Derived ─────────────────────────────────── */
  const years = getYearRange();
  const currentYear = 2026;
  const needsBrandNewQ = year !== null && shouldAskBrandNew(year);

  const totalSteps = 2; // step 0: search, step 1: year (+condition inline)
  const progress = Math.min(((step + 1) / totalSteps) * 100, 100);

  // Popular models — last 2 (most popular) from each brand
  const popularModels = useMemo(() => {
    const results: { brand: CarBrand; model: string }[] = [];
    for (const b of carBrands) {
      const bModels = modelsByBrand[b.name] ?? [];
      // Last 2 entries are most popular per our data ordering
      const top = bModels.slice(-2).reverse();
      for (const m of top) results.push({ brand: b, model: m });
    }
    return results;
  }, []);

  // Unified search: brands first, then all models across brands
  const q = query.toLowerCase().trim();

  const filteredBrands = useMemo(() =>
    q ? carBrands.filter((b) => b.name.toLowerCase().includes(q)) : carBrands,
    [q]
  );

  // Check if query starts with a recognized brand name
  const recognizedBrand = useMemo(() =>
    q ? carBrands.find((b) => q.startsWith(b.name.toLowerCase())) : null,
    [q]
  );

  const allModelResults = useMemo(() => {
    if (!q) return [];
    const results: { brand: CarBrand; model: string }[] = [];
    if (recognizedBrand) {
      // Brand recognized — show only its models
      const remainder = q.slice(recognizedBrand.name.length).trim();
      const bModels = modelsByBrand[recognizedBrand.name] ?? [];
      for (const m of bModels) {
        if (!remainder || m.toLowerCase().includes(remainder)) {
          results.push({ brand: recognizedBrand, model: m });
        }
      }
    } else {
      for (const b of carBrands) {
        const bModels = modelsByBrand[b.name] ?? [];
        for (const m of bModels) {
          if (m.toLowerCase().includes(q) || `${b.name} ${m}`.toLowerCase().includes(q)) {
            results.push({ brand: b, model: m });
          }
        }
      }
    }
    return results;
  }, [q, recognizedBrand]);

  /* ── Handlers ────────────────────────────────── */
  const goForward = () => { setDir(1); setStep((s) => s + 1); };
  const goBack = () => {
    if (step === 0) { navigate('/'); return; }
    setDir(-1);
    setStep((s) => s - 1);
  };

  const handleBrandSelect = (b: CarBrand) => {
    setBrand(b);
    setModel(null);
    setQuery('');
  };

  const handleModelSelect = (m: string, b?: CarBrand) => {
    if (b) setBrand(b);
    setModel(m);
    setQuery('');
    setDir(1);
    setStep(1);
  };

  const handleYearSelect = (y: number) => {
    setYear(y);
    setIsBrandNew(null);
    if (!shouldAskBrandNew(y)) {
      goToQuotes(y, null);
    }
    // else: wait for condition selection below
  };

  const handleConditionSelect = (brandNew: boolean) => {
    setIsBrandNew(brandNew);
    goToQuotes(year!, brandNew);
  };

  const goToQuotes = (y: number, brandNew: boolean | null) => {
    const details = mergeQuoteFlowDetails(emptyQuoteFlowDetails, {
      brand: brand!.name,
      model: model!,
      year: String(y),
      condition: brandNew === true ? 'Brand new' : brandNew === false ? 'Pre-owned' : '',
    });
    setTimeout(() => {
      navigate('/quotes', {
        state: { extractedRequirementDetails: details, brand: brand, model, year: y, isBrandNew: brandNew },
      });
    }, 200);
  };

  /* ── Step labels ─────────────────────────────── */
  const stepLabel = step === 0 ? 'Find your car' : 'Model year';
  const subtitle = step === 0
    ? 'Search by make or model'
    : `When was your ${brand?.name} ${model} made?`;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* ── Header ────────────────────────────── */}
      <div className="bg-[#FFFFFF] border-b border-[#D6DADE] sticky top-0 z-40">
        <div className="container mx-auto max-w-5xl px-5 py-2.5 flex items-center gap-3">
          <button
            onClick={goBack}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3F5F7]"
          >
            <ArrowLeft className="h-4 w-4 text-[#0F1113]" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] leading-5 font-bold text-[#0F1113]">{stepLabel}</p>
            <p className="text-[12px] leading-4 text-[#8A919A]">{subtitle}</p>
          </div>
          <span className="text-[11px] text-[#8A919A] bg-[#F3F5F7] px-2.5 py-1 rounded-full flex-shrink-0">
            {step + 1} / {totalSteps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-[#F3F5F7]">
          <div
            className="h-full bg-[#0F1113] transition-all duration-300 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Search bar inside sticky header */}
        {step === 0 && (
          <div className="container mx-auto max-w-5xl px-5 pt-3 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8A919A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); if (brand) { setBrand(null); setModel(null); } }}
                placeholder="Search make or model..."
                autoFocus
                className="w-full h-11 pl-10 pr-4 rounded-[12px] bg-[#FFFFFF] text-[14px] text-[#0F1113] placeholder:text-[#B0B6BE] outline-none border border-[#D6DADE] focus:border-[#8A919A] transition-colors shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Step Content ──────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={dir}>
          {/* Step 0: Brand + Model */}
          {step === 0 && (
            <motion.div
              key="step-brand-model"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="container mx-auto max-w-5xl px-5 pt-2 pb-4"
            >
              {/* Results */}
              {q ? (
                <div className="space-y-4">
                  {/* Brand suggestions — only when no brand recognized yet */}
                  {!recognizedBrand && filteredBrands.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-[#8A919A] uppercase tracking-wide mb-2">Brands</p>
                      <div className="space-y-1.5">
                        {filteredBrands.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => setQuery(b.name + ' ')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] bg-[#FFFFFF] border border-[#D6DADE] active:scale-[0.98] transition-all"
                          >
                            <div className="w-8 h-8 rounded-[10px] bg-[#F3F5F7] flex items-center justify-center overflow-hidden">
                              <img src={b.initial} alt={b.name} className="w-5 h-5 object-contain rounded" />
                            </div>
                            <span className="flex-1 text-left text-[14px] text-[#0F1113] font-medium">{b.name}</span>
                            <ChevronRight className="w-4 h-4 text-[#B0B6BE]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Model suggestions */}
                  {allModelResults.length > 0 && (
                    <div>
                      {!recognizedBrand && (
                        <p className="text-[11px] font-semibold text-[#8A919A] uppercase tracking-wide mb-2">Models</p>
                      )}
                      <div className="space-y-1.5">
                        {allModelResults.map(({ brand: b, model: m }) => (
                          <button
                            key={`${b.name}-${m}`}
                            onClick={() => handleModelSelect(m, b)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-[14px] bg-[#FFFFFF] border border-[#D6DADE] active:scale-[0.98] transition-all"
                          >
                            <div className="w-10 h-10 rounded-[10px] bg-[#F3F5F7] flex items-center justify-center overflow-hidden">
                              <img
                                src={getModelImage(b.name, m)}
                                alt={`${b.name} ${m}`}
                                className="w-10 h-10 object-cover"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-[14px] text-[#0F1113]">{m}</p>
                              <p className="text-[11px] text-[#8A919A]">{b.name}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#B0B6BE]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!recognizedBrand && filteredBrands.length === 0 && allModelResults.length === 0 && (
                    <p className="text-center text-[13px] text-[#8A919A] py-8">No results found</p>
                  )}
                  {recognizedBrand && allModelResults.length === 0 && (
                    <p className="text-center text-[13px] text-[#8A919A] py-8">No models found</p>
                  )}
                </div>
              ) : (
                /* Default — compact brand row + popular models */
                <div className="space-y-5">
                  {/* Brand row — 4 cols, compact */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A919A] uppercase tracking-wide mb-2">Brands</p>
                    <div className="grid grid-cols-4 gap-2">
                      {carBrands.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setQuery(b.name + ' ')}
                          className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-[12px] bg-[#FFFFFF] border border-[#D6DADE] active:scale-[0.97] transition-all"
                        >
                          <div className="w-8 h-8 rounded-[8px] bg-[#F3F5F7] flex items-center justify-center overflow-hidden">
                            <img src={b.initial} alt={b.name} className="w-5 h-5 object-contain rounded" />
                          </div>
                          <span className="text-[11px] text-[#0F1113]">{b.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular models */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A919A] uppercase tracking-wide mb-2">Popular Models</p>
                    <div className="grid grid-cols-2 gap-2">
                      {popularModels.map(({ brand: b, model: m }) => (
                        <button
                          key={`${b.name}-${m}`}
                          onClick={() => handleModelSelect(m, b)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] bg-[#FFFFFF] border border-[#D6DADE] active:scale-[0.98] transition-all"
                        >
                          <div className="w-9 h-9 rounded-[8px] bg-[#F3F5F7] flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={getModelImage(b.name, m)}
                              alt={`${b.name} ${m}`}
                              className="w-9 h-9 object-cover"
                            />
                          </div>
                          <div className="min-w-0 text-left">
                            <p className="text-[13px] text-[#0F1113] font-medium truncate">{m}</p>
                            <p className="text-[10px] text-[#8A919A]">{b.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 1: Year + inline condition */}
          {step === 1 && (
            <motion.div
              key="step-year"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="container mx-auto max-w-5xl px-5 py-4"
            >
              {/* Selected summary */}
              <div className="flex items-center gap-2 mb-4">
                <img src={brand!.initial} alt={brand!.name} className="w-8 h-8 rounded-[10px] object-contain bg-[#F3F5F7] p-1" />
                <div>
                  <p className="text-[14px] font-semibold text-[#0F1113]">{brand!.name} {model}</p>
                  <p className="text-[12px] text-[#8A919A]">Select the model year</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => handleYearSelect(y)}
                    className={`h-11 rounded-[12px] text-[14px] font-medium transition-all active:scale-[0.97] ${
                      year === y
                        ? 'bg-[#0F1113] text-[#FFFFFF]'
                        : y >= currentYear - 1
                          ? 'bg-[#FFFFFF] text-[#0F1113] border border-[#D6DADE] ring-1 ring-[#0F1113]/5'
                          : 'bg-[#FFFFFF] text-[#0F1113] border border-[#D6DADE]'
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              {/* Inline condition question — appears below year grid */}
              <AnimatePresence>
                {year !== null && shouldAskBrandNew(year) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#F3F5F7] rounded-[14px] p-4 mt-4">
                      <p className="text-[13px] text-[#0F1113] font-medium mb-3">
                        Is your {year} {brand?.name} brand new?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConditionSelect(true)}
                          className={`flex-1 h-10 rounded-[10px] text-[13px] font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                            isBrandNew === true
                              ? 'bg-[#0F1113] text-[#FFFFFF]'
                              : 'bg-[#FFFFFF] text-[#0F1113] border border-[#D6DADE]'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Brand New
                        </button>
                        <button
                          onClick={() => handleConditionSelect(false)}
                          className={`flex-1 h-10 rounded-[10px] text-[13px] font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                            isBrandNew === false
                              ? 'bg-[#0F1113] text-[#FFFFFF]'
                              : 'bg-[#FFFFFF] text-[#0F1113] border border-[#D6DADE]'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          Pre-owned
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AiAssistantButton />
    </div>
  );
}
