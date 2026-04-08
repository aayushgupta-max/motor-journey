import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import { flushSync } from 'react-dom';
import { Search, Check, X, ArrowLeft, SendHorizonal, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  carBrands,
  searchVehicles,
  getYearRange,
  normalizeVehicleQuery,
  shouldAskBrandNew,
  parseVehicleInput,
  modelsByBrand,
} from './vehicle-details/vehicleData';
import type { VehicleSuggestion } from './vehicle-details/vehicleData';

const popularBrands = carBrands.slice(0, 6);
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
    // Models in data are least→most popular; reverse so the most relevant model appears first in the stack.
    const parsed = parseVehicleInput(inputText);
    if (parsed?.brand) {
      const models = [...(modelsByBrand[parsed.brand] ?? [])].reverse();
      return models.map((m) => ({
        text: `I have a ${parsed.brand} ${m}`,
        phase: 'model' as SuggestionPhase,
      }));
    }
  }

  if (phase === 'year') {
    const parsed = parseVehicleInput(inputText);
    if (parsed?.brand && parsed?.model) {
      // Show newest model years first so the stack starts with the most likely choice.
      const years = [...getYearRange()].reverse();
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputSizerRef = useRef<HTMLDivElement>(null);
  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [suggestionsHeight, setSuggestionsHeight] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SuggestionPhase>('brand');

  const normalizedQuery = normalizeVehicleQuery(query);
  const currentSuggestions = generateSuggestions(normalizedQuery || query, phase);
  const ghost = normalizedQuery === query.toLowerCase().trim()
    ? getGhostText(query, currentSuggestions)
    : null;
  const previewText = ghost && query.length > 0 ? ghost : query;

  // Filter suggestions based on typed text
  const filteredSuggestions = query.trim()
    ? currentSuggestions.filter((s) =>
        s.text.toLowerCase().includes(query.toLowerCase().replace(/,?\s*\d{4}\s*model\s*$/, '').trim())
        || s.text.toLowerCase().startsWith(query.toLowerCase())
      )
    : currentSuggestions;

  const focusInput = () => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      const caretPosition = input.value.length;
      input.setSelectionRange(caretPosition, caretPosition);
    });
  };

  useEffect(() => {
    if (expanded) {
      focusInput();
    }
  }, [expanded, phase]);

  useEffect(() => {
    if (!expanded) return;

    const viewport = window.visualViewport;

    const syncViewportHeight = () => {
      setViewportHeight(viewport?.height ?? window.innerHeight);
    };

    syncViewportHeight();
    viewport?.addEventListener('resize', syncViewportHeight);
    viewport?.addEventListener('scroll', syncViewportHeight);
    window.addEventListener('resize', syncViewportHeight);

    return () => {
      viewport?.removeEventListener('resize', syncViewportHeight);
      viewport?.removeEventListener('scroll', syncViewportHeight);
      window.removeEventListener('resize', syncViewportHeight);
      setViewportHeight(null);
    };
  }, [expanded]);

  useLayoutEffect(() => {
    if (!expanded) return;

    const measure = () => {
      const availableHeight = viewportHeight ?? window.visualViewport?.height ?? window.innerHeight;
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const questionHeight = questionRef.current?.offsetHeight ?? 0;
      const inputHeight = inputBarRef.current?.offsetHeight ?? 0;
      const nextHeight = Math.max(0, Math.floor(availableHeight - headerHeight - questionHeight - inputHeight));
      setSuggestionsHeight(nextHeight);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (questionRef.current) resizeObserver.observe(questionRef.current);
    if (inputBarRef.current) resizeObserver.observe(inputBarRef.current);
    if (overlayRef.current) resizeObserver.observe(overlayRef.current);

    return () => {
      resizeObserver.disconnect();
      setSuggestionsHeight(null);
    };
  }, [expanded, viewportHeight, phase, query]);

  useLayoutEffect(() => {
    if (!expanded || !suggestionsScrollRef.current) return;

    const scrollArea = suggestionsScrollRef.current;
    scrollArea.scrollTop = scrollArea.scrollHeight;
  }, [expanded, phase, filteredSuggestions.length]);

  useLayoutEffect(() => {
    const textarea = inputRef.current;
    const sizer = inputSizerRef.current;
    if (!textarea || !sizer) return;

    sizer.textContent = `${previewText || query || ''}\n`;
    const lineHeight = 20;
    const maxHeight = lineHeight * 4;
    const nextHeight = Math.min(Math.max(sizer.scrollHeight, lineHeight), maxHeight);
    textarea.style.height = `${nextHeight}px`;
  }, [query, previewText, expanded]);

  const openExpanded = (initialQuery?: string) => {
    flushSync(() => {
      if (initialQuery) {
        setQuery(initialQuery);
        // Determine phase from initial query
        const parsed = parseVehicleInput(normalizeVehicleQuery(initialQuery));
        if (parsed?.brand && parsed?.model && parsed?.year) setPhase('condition');
        else if (parsed?.brand && parsed?.model) setPhase('year');
        else if (parsed?.brand) setPhase('model');
        else setPhase('brand');
      }
      setExpanded(true);
    });

    focusInput();
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
        setQuery(suggestion.text);
        setPhase('done');
        return;
      }
    } else if (suggestion.phase === 'condition') {
      setQuery(suggestion.text);
      setPhase('done');
      return;
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = (text?: string) => {
    const input = text || query;
    const parsed = parseVehicleInput(normalizeVehicleQuery(input));

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && ghost && query.length < ghost.length) {
      e.preventDefault();
      setQuery(ghost);
      // Advance phase based on what ghost completed
      const parsed = parseVehicleInput(normalizeVehicleQuery(ghost));
      if (parsed?.brand && parsed?.model && parsed?.year) {
        // Don't auto-navigate, let user confirm
      } else if (parsed?.brand && parsed?.model) {
        setPhase('year');
      } else if (parsed?.brand) {
        setPhase('model');
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // When query changes manually (typing), detect phase
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const parsed = parseVehicleInput(normalizeVehicleQuery(val));
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
      <div className="space-y-2.5 overflow-visible py-5">
        <div className="px-5">
          <p className="text-[16px] text-[#2D2D2D] font-bold mb-1.5">Tell us your requirement</p>
        </div>

        <div className="overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-max space-y-2">
            <div className="flex w-max gap-1.5">
              {popularBrands.slice(0, 3).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => openExpanded('I have a ' + brand.name + ' ')}
                  className="inline-flex w-fit items-center rounded-[999px] bg-white/70 border border-black/5 px-2.5 py-1.5 text-left hover:border-black/10 hover:bg-white transition-all"
                >
                  <span className="whitespace-nowrap text-[13px] text-[#4B5563]">
                    <span className="font-normal">I have a </span>
                    <span className="font-medium text-[#374151]">{brand.name}</span>
                    <span className="font-normal">...</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flex w-max gap-1.5">
              {popularBrands.slice(3, 6).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => openExpanded('I have a ' + brand.name + ' ')}
                  className="inline-flex w-fit items-center rounded-[999px] bg-white/70 border border-black/5 px-2.5 py-1.5 text-left hover:border-black/10 hover:bg-white transition-all"
                >
                  <span className="whitespace-nowrap text-[13px] text-[#4B5563]">
                    <span className="font-normal">I have a </span>
                    <span className="font-medium text-[#374151]">{brand.name}</span>
                    <span className="font-normal">...</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5">
          <button
            onClick={() => openExpanded()}
            className="w-full rounded-[18px] border border-gray-200 bg-white px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-5 text-gray-400">
                  Write about your car and insurance requirement...
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2D2D2D]">
                <SendHorizonal className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 h-[100svh] overflow-hidden bg-white flex flex-col"
            style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
          >
            {/* Header */}
            <div ref={headerRef} className="border-b border-gray-100 bg-white flex-shrink-0">
              <div className="container mx-auto px-5 py-3 max-w-5xl flex items-center gap-3">
                <button
                  onClick={closeExpanded}
                  className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#2D2D2D]" />
                </button>
                <div>
                  <p className="text-[16px] text-[#2D2D2D] font-bold">Your requirements</p>
                  <p className="text-xs text-gray-400">Tell us about your car in detail</p>
                </div>
              </div>
            </div>

            <div ref={questionRef} className="bg-white px-5 pt-5 pb-0 flex-shrink-0">
              <p className="text-[36px] leading-tight font-bold text-[#2D2D2D]">
                What car do you own?
              </p>
            </div>

            {/* Suggestions — scrollable, anchored to bottom near input */}
            <div
              ref={suggestionsScrollRef}
              className="min-h-0 flex-1 bg-white"
              style={suggestionsHeight !== null ? { height: `${suggestionsHeight}px` } : { flex: 1 }}
            />

            {/* Bottom fixed input */}
            <div ref={inputBarRef} className="bg-white border-t border-gray-100 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] flex-shrink-0">
              {filteredSuggestions.length > 0 && (
                <div className="mb-2 rounded-[18px] border border-gray-200 bg-[#FAFAFA] p-[2px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="overflow-hidden rounded-[16px] bg-white">
                    {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                      <button
                        key={suggestion.text}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-[#4B5563] transition-colors hover:bg-[#F7F7F7] ${
                          index !== filteredSuggestions.slice(0, 5).length - 1 ? 'border-b border-black/5' : ''
                        }`}
                      >
                        <Sparkles className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        <span className="truncate">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="w-full rounded-[18px] border border-gray-200 bg-[#FAFAFA] p-2 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:border-gray-300 hover:bg-[#F7F7F7] focus-within:border-[#2D2D2D] focus-within:ring-2 focus-within:ring-black/5">
                <div className="flex items-center gap-3 min-h-9">
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280] flex-shrink-0 transition-colors hover:bg-[#E5E7EB]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <div className="relative flex-1 min-w-0">
                    <div
                      ref={inputSizerRef}
                      className="invisible absolute left-0 top-0 -z-10 w-full whitespace-pre-wrap break-words p-0 m-0 text-sm leading-5"
                      aria-hidden="true"
                    />
                    {ghost && query.length > 0 && (
                      <div className="absolute inset-0 pointer-events-none z-0 whitespace-pre-wrap break-words p-0 m-0 text-sm leading-5">
                        <span className="text-transparent">{query}</span>
                        <span className="text-gray-300">{ghost.slice(query.length)}</span>
                      </div>
                    )}
                    <textarea
                      ref={inputRef}
                      autoFocus
                      rows={1}
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type here..."
                      className="relative z-10 m-0 max-h-20 w-full resize-none overflow-y-auto bg-transparent p-0 text-sm leading-5 text-[#2D2D2D] placeholder-gray-400 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2D2D2D] flex-shrink-0"
                  >
                    <SendHorizonal className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
