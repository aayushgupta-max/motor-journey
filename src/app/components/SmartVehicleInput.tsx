import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Check, X, ArrowLeft, SendHorizonal, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  carBrands,
  searchVehicles,
  getYearRange,
  shouldAskBrandNew,
  parseVehicleInput,
  modelsByBrand,
} from './vehicle-details/vehicleData';
import type { VehicleSuggestion } from './vehicle-details/vehicleData';

const popularBrands = carBrands.slice(0, 8);

// Progressive suggestion phases
type SuggestionPhase = 'brand' | 'model' | 'year' | 'condition' | 'done';

// Only ask brand new vs pre-owned for current year or last year (if within 6 months)
function shouldAskCondition(year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  if (year === currentYear) return true;
  if (year === currentYear - 1 && now.getMonth() < 6) return true; // Jan–Jun
  return false;
}

function generateSuggestions(
  inputText: string,
  phase: SuggestionPhase
): { text: string; phase: SuggestionPhase }[] {
  if (phase === 'brand') {
    // Reversed so most popular (Toyota) is at bottom — visible first on open
    return [...carBrands].reverse().map((b) => ({
      text: `I have a ${b.name}`,
      phase: 'brand' as SuggestionPhase,
    }));
  }

  if (phase === 'model') {
    // Models already sorted least→most popular in data; bottom = most popular
    const parsed = parseVehicleInput(inputText);
    if (parsed?.brand) {
      const models = modelsByBrand[parsed.brand] ?? [];
      return models.map((m) => ({
        text: `I have a ${parsed.brand} ${m}`,
        phase: 'model' as SuggestionPhase,
      }));
    }
  }

  if (phase === 'year') {
    const parsed = parseVehicleInput(inputText);
    if (parsed?.brand && parsed?.model) {
      // Oldest first, newest last (bottom = most recent, shown first on open)
      const years = getYearRange();
      return years.map((y) => ({
        text: `I have a ${parsed.brand} ${parsed.model}, ${y} model`,
        phase: 'year' as SuggestionPhase,
      }));
    }
  }

  if (phase === 'condition') {
    const parsed = parseVehicleInput(inputText);
    if (parsed?.brand && parsed?.model && parsed?.year) {
      return [
        {
          text: `I have a ${parsed.brand} ${parsed.model}, ${parsed.year} model, pre-owned`,
          phase: 'condition' as SuggestionPhase,
        },
        {
          text: `I have a ${parsed.brand} ${parsed.model}, ${parsed.year} model, brand new`,
          phase: 'condition' as SuggestionPhase,
        },
      ];
    }
  }

  return [];
}

// Ghost autocomplete
function getGhostText(query: string, suggestions: { text: string }[]): string | null {
  if (!query.trim()) return null;
  const q = query.toLowerCase();
  for (const s of suggestions) {
    if (s.text.toLowerCase().startsWith(q) && s.text.length > query.length) {
      return s.text;
    }
  }
  return null;
}

export function SmartVehicleInput() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SuggestionPhase>('brand');

  const currentSuggestions = generateSuggestions(query, phase);
  const ghost = getGhostText(query, currentSuggestions);

  // Filter suggestions based on typed text
  const filteredSuggestions = query.trim()
    ? currentSuggestions.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase().replace(/,?\s*\d{4}\s*model\s*$/, '').trim())
        || s.text.toLowerCase().startsWith(query.toLowerCase())
      )
    : currentSuggestions;

  useEffect(() => {
    if (expanded) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [expanded, phase]);

  // Auto-scroll suggestions to bottom so last items show first
  useEffect(() => {
    if (expanded && scrollAreaRef.current) {
      // Immediate scroll
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      // Also scroll after AnimatePresence exit+enter animations complete
      const t1 = setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
      const t2 = setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 400);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [expanded, phase]);

  const openExpanded = (initialQuery?: string) => {
    if (initialQuery) {
      setQuery(initialQuery);
      // Determine phase from initial query
      const parsed = parseVehicleInput(initialQuery);
      if (parsed?.brand && parsed?.model && parsed?.year) setPhase('condition');
      else if (parsed?.brand && parsed?.model) setPhase('year');
      else if (parsed?.brand) setPhase('model');
      else setPhase('brand');
    }
    setExpanded(true);
  };

  const closeExpanded = () => {
    setExpanded(false);
    setQuery('');
    setPhase('brand');
  };

  const handleSuggestionClick = (suggestion: { text: string; phase: SuggestionPhase }) => {
    if (suggestion.phase === 'brand') {
      setPhase('model');
      setQuery(suggestion.text + ' ');
    } else if (suggestion.phase === 'model') {
      setPhase('year');
      setQuery(suggestion.text + ', ');
    } else if (suggestion.phase === 'year') {
      const parsed = parseVehicleInput(suggestion.text);
      if (parsed?.year && shouldAskCondition(parsed.year)) {
        setPhase('condition');
        setQuery(suggestion.text + ', ');
      } else {
        handleSubmit(suggestion.text);
        return;
      }
    } else if (suggestion.phase === 'condition') {
      handleSubmit(suggestion.text);
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = (text?: string) => {
    const input = text || query;
    const parsed = parseVehicleInput(input);

    if (parsed?.brand && parsed?.model && parsed?.year && (parsed?.isBrandNew !== undefined || !shouldAskCondition(parsed.year))) {
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
    } else if (parsed?.brand && parsed?.model && parsed?.year && shouldAskCondition(parsed.year)) {
      setPhase('condition');
    } else if (parsed?.brand && parsed?.model) {
      setPhase('year');
    } else if (parsed?.brand) {
      setPhase('model');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && ghost && query.length < ghost.length) {
      e.preventDefault();
      setQuery(ghost);
      // Advance phase based on what ghost completed
      const parsed = parseVehicleInput(ghost);
      if (parsed?.brand && parsed?.model && parsed?.year) {
        // Don't auto-navigate, let user confirm
      } else if (parsed?.brand && parsed?.model) {
        setPhase('year');
      } else if (parsed?.brand) {
        setPhase('model');
      }
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // When query changes manually (typing), detect phase
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const parsed = parseVehicleInput(val);
    if (parsed?.brand && parsed?.model && parsed?.year && (parsed?.isBrandNew !== undefined || !shouldAskCondition(parsed.year))) {
      setPhase('done');
    } else if (parsed?.brand && parsed?.model && parsed?.year && shouldAskCondition(parsed.year)) {
      setPhase('condition');
    } else if (parsed?.brand && parsed?.model) {
      setPhase('year');
    } else if (parsed?.brand) {
      setPhase('model');
    } else {
      setPhase('brand');
    }
  };

  return (
    <>
      {/* Collapsed trigger on home page */}
      <div className="space-y-3">
        <p className="text-sm text-[#2D2D2D] font-bold mb-2">Tell us about your car</p>

        <button
          onClick={() => openExpanded()}
          className="w-full h-12 pl-10 pr-4 rounded-xl bg-white text-sm text-gray-300 text-left border border-gray-200 relative"
        >
          <Search className="w-4 h-4 text-gray-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
          e.g. Toyota Camry or just Camry...
        </button>

        <div>
          <p className="text-xs text-gray-400 mb-2.5">I have a...</p>
          <div className="grid grid-cols-4 gap-2">
            {popularBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => openExpanded('I have a ' + brand.name + ' ')}
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
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-gray-100 flex-shrink-0">
              <div className="container mx-auto px-5 py-3 max-w-5xl flex items-center gap-3">
                <button
                  onClick={closeExpanded}
                  className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#2D2D2D]" />
                </button>
                <div>
                  <p className="text-sm text-[#2D2D2D] font-bold">Find your car</p>
                  <p className="text-xs text-gray-400">Tap a suggestion or just type freely</p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="px-5 pt-5 pb-3 flex-shrink-0">
              <h2 className="text-xl font-bold text-[#2D2D2D] tracking-tight">
                {phase === 'brand' && 'Tell us about your car'}
                {phase === 'model' && 'Which model?'}
                {phase === 'year' && 'What year?'}
                {phase === 'condition' && 'Brand new or pre-owned?'}
                {phase === 'done' && 'Looking good!'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {phase === 'brand' && 'Pick a suggestion or type freely'}
                {phase === 'model' && 'Select your model below'}
                {phase === 'year' && 'Almost there — pick the year'}
                {phase === 'condition' && 'Last step — just one more thing'}
                {phase === 'done' && 'Hit send to get your quotes'}
              </p>
            </div>

            {/* Suggestions — scrollable, anchored to bottom near input */}
            <div ref={scrollAreaRef} className="flex-1 overflow-auto bg-[#F7F7F7] flex flex-col">
              <div className="flex-1" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                  className="px-4 pb-2 pt-3 space-y-1.5"
                >
                {filteredSuggestions.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSuggestionClick(s)}
                      className="w-full flex items-center gap-3 px-4 min-h-[52px] py-3 rounded-2xl bg-white text-left active:scale-[0.99] active:bg-gray-50 transition-all"
                    >
                      {phase === 'brand' && (
                        <div className="w-7 h-7 rounded-lg bg-[#F7F7F7] flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={carBrands.find((b) => s.text.includes(b.name))?.initial}
                            alt=""
                            className="w-4.5 h-4.5 object-contain"
                          />
                        </div>
                      )}
                      <span className="text-sm text-[#2D2D2D] flex-1">{s.text}</span>
                      {phase === 'condition' && (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}

                {/* Quick match for full parse */}
                {phase === 'done' && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSubmit()}
                    className="w-full p-4 rounded-2xl bg-[#2D2D2D] text-left flex items-center gap-3 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#D4D4D4]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{query}</p>
                      <p className="text-xs text-gray-400">Tap to get quotes instantly →</p>
                    </div>
                  </motion.button>
                )}
                <div ref={suggestionsEndRef} />
              </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom fixed input */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  {/* Ghost autocomplete */}
                  {ghost && query.length > 0 && (
                    <div className="absolute inset-0 flex items-center px-4 pointer-events-none z-0">
                      <span className="text-sm text-transparent">{query}</span>
                      <span className="text-sm text-gray-300">{ghost.slice(query.length)}</span>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="I have a Toyota Camry, 5 years old..."
                    className="relative z-10 w-full h-12 px-4 rounded-xl bg-[#F7F7F7] text-sm text-[#2D2D2D] placeholder-gray-300 outline-none border border-transparent focus:border-[#2D2D2D] focus:bg-white transition-colors"
                  />
                </div>
                {query.trim() && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => handleSubmit()}
                    className="w-12 h-12 rounded-xl bg-[#2D2D2D] flex items-center justify-center flex-shrink-0 active:scale-[0.95] transition-transform"
                  >
                    <SendHorizonal className="w-5 h-5 text-[#D4D4D4]" />
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
