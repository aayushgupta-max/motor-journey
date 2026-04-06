import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { ArrowLeft, Star, Check, Lock, X, Eye, EyeOff, ClipboardList, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, Search } from 'lucide-react';
import { DLUploadBottomSheet } from '../components/DLUploadBottomSheet';
import { LoginModal } from '../components/LoginModal';
import { AiAssistantButton } from '../components/AiAssistantButton';
import { QuoteConfidenceCard } from '../components/QuoteConfidenceCard';
import { FlipPrice } from '../components/FlipPrice';
import { useAuth } from '../components/AuthContext';

const allFilterOptions = [
  { label: 'Comprehensive', category: 'Coverage' },
  { label: 'Third Party', category: 'Coverage' },
  { label: 'Agency Repair', category: 'Repair' },
  { label: 'Non-Agency Repair', category: 'Repair' },
  { label: 'Roadside Assist', category: 'Benefits' },
  { label: 'Oman Cover', category: 'Benefits' },
  { label: 'Windshield Cover', category: 'Benefits' },
  { label: 'Personal Accident', category: 'Benefits' },
  { label: 'GAP Insurance', category: 'Benefits' },
  { label: 'Natural Disaster', category: 'Benefits' },
  { label: 'Theft Cover', category: 'Benefits' },
];

const quickFilters = ['Comprehensive', 'Third Party', 'Agency Repair', 'Roadside Assist', 'Oman Cover'];

const quotes = [
  {
    id: 1,
    provider: 'Orient Insurance',
    initial: 'OI',
    color: '#666666',
    bg: '#ECECEC',
    rating: 4.9,
    price: 1249,
    optimizedPrice: 1049,
    originalPrice: 1899,
    coverage: 'Comprehensive',
    features: ['Agency Repair', '24/7 Roadside', 'Oman Extension', 'Personal Accident'],
    badge: 'Best Value',
  },
  {
    id: 2,
    provider: 'AXA Gulf',
    initial: 'AX',
    color: '#555555',
    bg: '#E8E8E8',
    rating: 4.8,
    price: 1389,
    optimizedPrice: 1159,
    originalPrice: 2100,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Windshield Cover', 'GAP Insurance'],
    badge: null,
  },
  {
    id: 3,
    provider: 'Dubai Insurance',
    initial: 'DI',
    color: '#777777',
    bg: '#F0F0F0',
    rating: 4.7,
    price: 1425,
    optimizedPrice: 1199,
    originalPrice: 1950,
    coverage: 'Comprehensive',
    features: ['Non-Agency Repair', '24/7 Roadside', 'Oman Extension'],
    badge: null,
  },
  {
    id: 4,
    provider: 'Oman Insurance',
    initial: 'OM',
    color: '#888888',
    bg: '#EFEFEF',
    rating: 4.8,
    price: 1510,
    optimizedPrice: 1289,
    originalPrice: 2200,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Natural Disaster', 'Theft Cover'],
    badge: null,
  },
  {
    id: 5,
    provider: 'National General',
    initial: 'NG',
    color: '#999999',
    bg: '#F2F2F2',
    rating: 4.6,
    price: 1599,
    optimizedPrice: 1349,
    originalPrice: 2050,
    coverage: 'Third Party',
    features: ['Basic Cover', '24/7 Roadside'],
    badge: null,
  },
];

export default function Quotes() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);
  const [unlocked, setUnlocked] = useState(isLoggedIn);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('price-low');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [gccAnswer, setGccAnswer] = useState<'yes' | 'no' | null>(null);
  const [gccSelection, setGccSelection] = useState<'yes' | 'no' | null>(null);
  const [showDLUpload, setShowDLUpload] = useState(false);
  const [dlUploaded, setDlUploaded] = useState(false);
  const [dlSkipped, setDlSkipped] = useState(false);
  const [showDLSheet, setShowDLSheet] = useState(false);
  const [claimMonths, setClaimMonths] = useState<string | null>(null);
  const [hasNoClaimProof, setHasNoClaimProof] = useState<'yes' | 'no' | null>(null);
  const [surveyStep, setSurveyStep] = useState(0); // 0=gcc+dl, 1=claim months, 2=no claim proof, 3=dl retry (if skipped)

  const noClaimProofNeeded = claimMonths === 'Never claimed';
  const totalQuestions = noClaimProofNeeded ? 4 : 3;
  const answeredCount = (gccSelection !== null ? 1 : 0) + (dlUploaded ? 1 : 0) + (claimMonths !== null ? 1 : 0) + (noClaimProofNeeded && hasNoClaimProof !== null ? 1 : 0);
  const allSurveyDone = gccSelection !== null && dlUploaded && claimMonths !== null && (!noClaimProofNeeded || hasNoClaimProof !== null);
  const [surveyBadgeDismissed, setSurveyBadgeDismissed] = useState(false);

  useEffect(() => {
    if (allSurveyDone) {
      const timer = setTimeout(() => setSurveyBadgeDismissed(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [allSurveyDone]);

  const toggleFilter = (f: string) => {
    setActiveFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const filterAndSort = (list: typeof quotes) => {
    let filtered = [...list];
    if (searchQuery.trim()) {
      filtered = filtered.filter((q) =>
        q.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const coverageFilters = activeFilters.filter((f) => ['Comprehensive', 'Third Party'].includes(f));
    if (coverageFilters.length > 0) {
      filtered = filtered.filter((q) => coverageFilters.includes(q.coverage));
    }
    const featureMap: Record<string, string> = {
      'Agency Repair': 'Agency Repair',
      'Non-Agency Repair': 'Non-Agency Repair',
      'Roadside Assist': '24/7 Roadside',
      'Oman Cover': 'Oman Extension',
      'Windshield Cover': 'Windshield Cover',
      'Personal Accident': 'Personal Accident',
      'GAP Insurance': 'GAP Insurance',
      'Natural Disaster': 'Natural Disaster',
      'Theft Cover': 'Theft Cover',
    };
    const featureFilters = activeFilters.filter((f) => f in featureMap);
    if (featureFilters.length > 0) {
      filtered = filtered.filter((q) =>
        featureFilters.every((f) => q.features.includes(featureMap[f]))
      );
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    return filtered;
  };

  const allFiltered = filterAndSort(quotes);
  const bestQuote = allFiltered[0];
  const remainingQuotes = allFiltered.slice(1);

  const handleUnlock = () => {
    login();
    setShowLoginModal(false);
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-5 py-3 max-w-5xl flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-[#2D2D2D]" />
          </button>
          <div>
            <p className="text-sm text-[#2D2D2D]">Your Quotes</p>
            <p className="text-xs text-gray-500">Toyota Camry 2023 · Dubai</p>
          </div>
          {isLoggedIn && (
          <div className="ml-auto">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              key={answeredCount}
              className="relative rounded-full p-[2px]"
              style={{
                background: `conic-gradient(#2D2D2D ${allSurveyDone ? 100 : ((8 + answeredCount) / 12) * 100}%, #D4D4D4 0%)`,
              }}
            >
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${allSurveyDone ? 'bg-[#EFEFEF]' : 'bg-[#F5F5F5]'}`}>
                <ClipboardList className={`w-3 h-3 ${allSurveyDone ? 'text-[#2D2D2D]' : 'text-[#666666]'}`} />
                <span className={`text-[10px] whitespace-nowrap ${allSurveyDone ? 'text-[#2D2D2D]' : 'text-[#666666]'}`}>{allSurveyDone ? 12 : 8 + answeredCount}/12</span>
                <button
                  onClick={() => {
                    setGccSelection(null);
                    setShowDLUpload(false);
                    setDlUploaded(false);
                    setDlSkipped(false);
                    setClaimMonths(null);
                    setHasNoClaimProof(null);
                    setSurveyStep(0);
                    setSurveyBadgeDismissed(false);
                  }}
                  className="ml-0.5 w-5 h-5 rounded-full bg-[#2D2D2D]/10 flex items-center justify-center"
                >
                  <Pencil className="w-2.5 h-2.5 text-[#2D2D2D]" />
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-4 max-w-5xl">

        {/* Filter & Sort Bar */}
        {unlocked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-3"
        >
          {/* Row 1: Icon buttons + expandable search */}
          <div className="flex items-center gap-2 mb-2">
            {/* Full-width search input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search insurer..."
                className={`w-full h-10 pl-8.5 pr-8 rounded-xl bg-white text-xs text-[#2D2D2D] placeholder-gray-300 outline-none border ${searchQuery ? 'border-[#D4D4D4]' : 'border-gray-200/60'}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-gray-300" />
                </button>
              )}
            </div>

            {/* Filters icon */}
            <button
              onClick={() => setShowAllFilters(true)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all relative ${
                activeFilters.length > 0 ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-white text-gray-500 border border-gray-200/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-[#D4D4D4] text-[#2D2D2D] text-[9px] flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Sort icon with dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  sortBy !== 'price-low' ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-white text-gray-500 border border-gray-200/60'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-11 z-20 bg-white rounded-xl border border-gray-100 py-1 min-w-[160px] overflow-hidden">
                    {[
                      { value: 'price-low', label: 'Price: Low → High' },
                      { value: 'price-high', label: 'Price: High → Low' },
                      { value: 'rating', label: 'Top Rated' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value as typeof sortBy); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between ${
                          sortBy === opt.value ? 'text-[#2D2D2D] bg-[#F7F7F7]' : 'text-gray-500'
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#D4D4D4]" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Clear all - only when filters active */}
            {activeFilters.length > 0 && (
              <button
                onClick={() => setActiveFilters([])}
                className="h-10 px-3 rounded-xl text-[11px] text-gray-500 hover:text-gray-600 border border-dashed border-gray-200 flex items-center gap-1 flex-shrink-0"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Row 2: Quick filter suggestion chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {quickFilters.map((filter) => {
              const isActive = activeFilters.includes(filter);
              return (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`flex-shrink-0 h-9 px-4 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-[#2D2D2D] text-[#D4D4D4]'
                      : 'bg-white text-gray-500 border border-gray-100'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </motion.div>
        )}

        {/* Quote Confidence Card — only for logged-in users */}
        {isLoggedIn && <QuoteConfidenceCard
          quotesCount={quotes.length}
          plansCount={allFiltered.length}
          answeredCount={answeredCount}
          totalDataPoints={12}
          allSurveyDone={allSurveyDone}
          gccSelection={gccSelection}
          setGccSelection={setGccSelection}
          showDLUpload={showDLUpload}
          setShowDLUpload={setShowDLUpload}
          dlUploaded={dlUploaded}
          dlSkipped={dlSkipped}
          setDlSkipped={setDlSkipped}
          setShowDLSheet={setShowDLSheet}
          claimMonths={claimMonths}
          setClaimMonths={setClaimMonths}
          hasNoClaimProof={hasNoClaimProof}
          setHasNoClaimProof={setHasNoClaimProof}
          surveyStep={surveyStep}
          setSurveyStep={setSurveyStep}
        />}

        {/* Best Quote - Fully Visible */}
        {bestQuote && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-200/60"
        >
          {/* Badge */}
          <div className="bg-[#D4D4D4] px-4 py-1.5 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-[#2D2D2D]" />
            <span className="text-xs text-[#2D2D2D]">Best Value · Recommended for you</span>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: bestQuote.bg }}
                >
                  <span className="text-sm" style={{ color: bestQuote.color }}>{bestQuote.initial}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2D2D2D]">{bestQuote.provider}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-gray-500 fill-gray-400" />
                    <span className="text-xs text-gray-500">{bestQuote.rating}</span>
                    <span className="text-xs text-gray-500 mx-1">·</span>
                    <span className="text-xs text-gray-500">{bestQuote.coverage}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 line-through">AED {bestQuote.originalPrice}</p>
                <FlipPrice value={allSurveyDone ? bestQuote.optimizedPrice : bestQuote.price} className="text-lg font-bold text-[#2D2D2D]" />
                <p className="text-[10px] text-[#D4D4D4] bg-[#2D2D2D] px-2 py-0.5 rounded-full mt-1 ml-1 inline-block whitespace-nowrap">
                  Save {Math.round(((bestQuote.originalPrice - bestQuote.price) / bestQuote.originalPrice) * 100)}%
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {bestQuote.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 text-xs bg-[#F7F7F7] text-gray-600 px-2.5 py-1 rounded-lg">
                  <Check className="w-3 h-3 text-[#D4D4D4]" />
                  {f}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className="h-10 px-4 rounded-xl bg-[#F0F0F0] text-[#2D2D2D] flex items-center justify-center text-xs transition-all active:scale-[0.98] flex-shrink-0"
              >
                View details
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex-1 min-w-0 h-10 rounded-xl bg-[#2D2D2D] text-[#D4D4D4] flex items-center justify-center text-xs transition-all active:scale-[0.98]"
              >
                <span className="truncate px-2">{allSurveyDone ? `Buy Now · AED ${bestQuote.optimizedPrice}/yr` : `Starting at AED ${bestQuote.price}/yr`}</span>
              </button>
            </div>
          </div>
        </motion.div>
        )}

        {/* Blurred Quotes with Login Wall */}
        <div className="relative">
          {/* Blurred cards */}
          <div className={`space-y-2.5 ${!unlocked ? 'select-none pointer-events-none' : ''}`}>
            {remainingQuotes.map((quote, i) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`bg-white rounded-2xl p-4 border border-gray-200/60 ${!unlocked ? 'blur-[6px]' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: quote.bg }}
                    >
                      <span className="text-sm" style={{ color: quote.color }}>{quote.initial}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2D2D2D]">{quote.provider}</p>
                      <p className="text-xs text-gray-500">{quote.coverage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <FlipPrice value={allSurveyDone ? quote.optimizedPrice : quote.price} className="text-lg font-bold text-[#2D2D2D]" />
                  </div>
                </div>
                <div className="flex gap-2">
                  {quote.features.slice(0, 2).map((f) => (
                    <span key={f} className="text-xs bg-[#F7F7F7] text-gray-500 px-2.5 py-1 rounded-lg">{f}</span>
                  ))}
                </div>
                {unlocked && (
                  <div className="flex gap-2 mt-3">
                    <button className="h-10 px-4 rounded-xl bg-[#F0F0F0] text-[#2D2D2D] flex items-center justify-center text-xs transition-all active:scale-[0.98] flex-shrink-0">
                      View details
                    </button>
                    <button className="flex-1 min-w-0 h-10 rounded-xl bg-[#2D2D2D] text-[#D4D4D4] flex items-center justify-center text-xs transition-all active:scale-[0.98]">
                      <span className="truncate px-2">{allSurveyDone ? `Buy Now · AED ${quote.optimizedPrice}/yr` : `Starting at AED ${quote.price}/yr`}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Overlay CTA */}
          {!unlocked && (
          <div className="absolute inset-0 flex items-start justify-center pt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-4 mx-4 max-w-sm w-full text-center shadow-lg shadow-black/5"
            >
              <div className="w-11 h-11 rounded-xl bg-[#EFEFEF] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-[#2D2D2D]" />
              </div>
              <h3 className="text-base text-[#2D2D2D] mb-0.5">
                {remainingQuotes.length} more quotes available
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Sign in to unlock all quotes, compare plans and buy your policy instantly
              </p>
              <div
                onClick={() => setShowLoginModal(true)}
                className="w-full h-10 rounded-xl bg-[#F7F7F7] flex items-center gap-2 px-3 mb-3 cursor-pointer"
              >
                <span className="text-xs text-gray-500">🇦🇪 +971</span>
                <span className="text-xs text-gray-500">Enter mobile number</span>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full h-10 rounded-xl bg-[#2D2D2D] text-[#D4D4D4] flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
              >
                <Lock className="w-4 h-4" />
                Sign in to Unlock
              </button>
            </motion.div>
          </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} onUnlock={handleUnlock} quotesCount={allFiltered.length} />
      )}

      {/* All Filters Bottom Sheet */}
      {showAllFilters && (
        <AllFiltersSheet
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          onClear={() => setActiveFilters([])}
          onClose={() => setShowAllFilters(false)}
        />
      )}

      {/* DL Upload Bottom Sheet */}
      <DLUploadBottomSheet
        open={showDLSheet}
        onOpenChange={setShowDLSheet}
        onComplete={() => {
          setDlUploaded(true);
          setDlSkipped(false);
          if (surveyStep === 1) {
            setSurveyStep(2);
          }
          // If step 4 (retry), dlUploaded=true + dlSkipped=false → allSurveyDone triggers
        }}
      />
      <AiAssistantButton />
    </div>
  );
}

function AllFiltersSheet({
  activeFilters,
  toggleFilter,
  onClear,
  onClose,
}: {
  activeFilters: string[];
  toggleFilter: (f: string) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const categories = ['Coverage', 'Repair', 'Benefits'] as const;
  const grouped = categories.map((cat) => ({
    category: cat,
    filters: allFilterOptions.filter((f) => f.category === cat),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 z-10 max-h-[80vh] flex flex-col"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg text-[#2D2D2D]">All Filters</h3>
          <div className="flex items-center gap-3">
            {activeFilters.length > 0 && (
              <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-600">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filter groups */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {grouped.map(({ category, filters }) => (
            <div key={category}>
              <p className="text-xs text-gray-500 mb-2.5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {filters.map(({ label }) => {
                  const isActive = activeFilters.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleFilter(label)}
                      className={`h-9 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#2D2D2D] text-[#D4D4D4]'
                          : 'bg-[#F7F7F7] text-gray-600'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Apply button */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#2D2D2D] text-[#D4D4D4] flex items-center justify-center text-sm transition-all active:scale-[0.98]"
          >
            Show Results{activeFilters.length > 0 ? ` (${activeFilters.length} filters)` : ''}
          </button>
        </div>
      </motion.div>
    </div>
  );
}