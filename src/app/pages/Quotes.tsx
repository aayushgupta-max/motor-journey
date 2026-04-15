import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Header } from '../components/Header';
import { Star, Check, Lock, X, ClipboardList, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { SlidersHorizontal, ArrowUpDown, Search, ArrowLeftRight } from 'lucide-react';
import { DLUploadBottomSheet } from '../components/DLUploadBottomSheet';
import { LoginModal } from '../components/LoginModal';
import { AiAssistantButton } from '../components/AiAssistantButton';
import { QuoteConfidenceCard } from '../components/QuoteConfidenceCard';
import { FlipPrice } from '../components/FlipPrice';
import { useAuth } from '../components/AuthContext';
import { PageHeaderBar } from '../components/PageHeaderBar';
import { MulkiyaBottomSheet } from '../components/MulkiyaBottomSheet';
import { EditDetailsSheet } from '../components/EditDetailsSheet';
import {
  applyMockDlExtraction,
  buildVehicleSubtitle,
  emptyQuoteFlowDetails,
  getCompletedFieldCount,
  getConfidenceLevel,
  getConfidenceScore,
  getNextQuotesAction,
  getTotalFieldCount,
  mergeQuoteFlowDetails,
  type QuoteFlowDetails,
} from '../lib/quoteFlow';

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

const quickFilters = ['Comprehensive', 'Third Party', 'Agency Repair', '24/7 Roadside', 'Oman Extension', 'GAP Insurance', 'Rental Car'];

const quotes = [
  {
    id: 1,
    provider: 'Orient Insurance',
    initial: 'OI',
    color: '#3A3F45',
    bg: '#F3F5F7',
    rating: 4.9,
    price: 1249,
    optimizedPrice: 1049,
    originalPrice: 1899,
    coverage: 'Comprehensive',
    features: ['Agency Repair', '24/7 Roadside', 'Oman Extension', 'Personal Accident', 'Windshield Cover', 'Rental Car (30 days)'],
    badge: 'Best Value',
  },
  {
    id: 2,
    provider: 'AXA Gulf',
    initial: 'AX',
    color: '#4B525A',
    bg: '#FAFBFC',
    rating: 4.8,
    price: 1389,
    optimizedPrice: 1159,
    originalPrice: 2100,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Windshield Cover', 'GAP Insurance', 'Off-road Cover', 'Oman Extension', 'Key Replacement'],
    badge: null,
  },
  {
    id: 3,
    provider: 'Dubai Insurance',
    initial: 'DI',
    color: '#5E6670',
    bg: '#F3F5F7',
    rating: 4.7,
    price: 1425,
    optimizedPrice: 1199,
    originalPrice: 1950,
    coverage: 'Comprehensive',
    features: ['Non-Agency Repair', '24/7 Roadside', 'Oman Extension', 'Personal Accident', 'Natural Disaster', 'Towing (200km)'],
    badge: null,
  },
  {
    id: 4,
    provider: 'Oman Insurance',
    initial: 'OM',
    color: '#5E6670',
    bg: '#FAFBFC',
    rating: 4.8,
    price: 1510,
    optimizedPrice: 1289,
    originalPrice: 2200,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Natural Disaster', 'Theft Cover', 'Windshield Cover', 'Rental Car (15 days)', 'GCC Extension'],
    badge: null,
  },
  {
    id: 5,
    provider: 'National General',
    initial: 'NG',
    color: '#8A919A',
    bg: '#F3F5F7',
    rating: 4.6,
    price: 789,
    optimizedPrice: 649,
    originalPrice: 1050,
    coverage: 'Third Party',
    features: ['Third Party Liability', '24/7 Roadside', 'Personal Accident', 'Oman Extension', 'Towing (100km)', 'Emergency Medical'],
    badge: null,
  },
  {
    id: 6,
    provider: 'RSA Insurance',
    initial: 'RS',
    color: '#3A3F45',
    bg: '#F3F5F7',
    rating: 4.7,
    price: 1299,
    optimizedPrice: 1089,
    originalPrice: 1850,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Oman Extension', 'Theft Cover', '24/7 Roadside', 'Depreciation Cover', 'Windshield Cover'],
    badge: null,
  },
  {
    id: 7,
    provider: 'Salama Insurance',
    initial: 'SI',
    color: '#4B525A',
    bg: '#FAFBFC',
    rating: 4.5,
    price: 849,
    optimizedPrice: 699,
    originalPrice: 1200,
    coverage: 'Third Party',
    features: ['Third Party Liability', 'Personal Accident', 'Emergency Medical', 'Towing (50km)', 'Oman Extension', 'Driver Cover'],
    badge: null,
  },
  {
    id: 8,
    provider: 'Zurich Insurance',
    initial: 'ZI',
    color: '#3A3F45',
    bg: '#F3F5F7',
    rating: 4.8,
    price: 1575,
    optimizedPrice: 1325,
    originalPrice: 2300,
    coverage: 'Comprehensive',
    features: ['Agency Repair', '24/7 Roadside', 'GAP Insurance', 'Oman Extension', 'Rental Car (30 days)', 'No Depreciation', 'Key Replacement'],
    badge: null,
  },
  {
    id: 9,
    provider: 'Tokio Marine',
    initial: 'TM',
    color: '#5E6670',
    bg: '#FAFBFC',
    rating: 4.6,
    price: 1350,
    optimizedPrice: 1129,
    originalPrice: 1900,
    coverage: 'Comprehensive',
    features: ['Non-Agency Repair', 'Oman Extension', '24/7 Roadside', 'Natural Disaster', 'Personal Accident', 'Windshield Cover'],
    badge: null,
  },
  {
    id: 10,
    provider: 'Noor Takaful',
    initial: 'NT',
    color: '#4B525A',
    bg: '#F3F5F7',
    rating: 4.4,
    price: 699,
    optimizedPrice: 579,
    originalPrice: 950,
    coverage: 'Third Party',
    features: ['Third Party Liability', 'Oman Extension', 'Personal Accident', 'Towing (100km)', 'Emergency Medical', 'Fire & Theft'],
    badge: null,
  },
  {
    id: 11,
    provider: 'Adamjee Insurance',
    initial: 'AI',
    color: '#5E6670',
    bg: '#FAFBFC',
    rating: 4.3,
    price: 1189,
    optimizedPrice: 989,
    originalPrice: 1650,
    coverage: 'Comprehensive',
    features: ['Non-Agency Repair', '24/7 Roadside', 'Personal Accident', 'Towing (150km)', 'Oman Extension', 'Windshield Cover'],
    badge: null,
  },
  {
    id: 12,
    provider: 'Al Sagr Insurance',
    initial: 'AS',
    color: '#3A3F45',
    bg: '#F3F5F7',
    rating: 4.5,
    price: 729,
    optimizedPrice: 599,
    originalPrice: 1100,
    coverage: 'Third Party',
    features: ['Third Party Liability', '24/7 Roadside', 'Driver Cover', 'Oman Extension', 'Emergency Medical', 'Towing (75km)'],
    badge: null,
  },
  {
    id: 13,
    provider: 'Watania Insurance',
    initial: 'WI',
    color: '#4B525A',
    bg: '#FAFBFC',
    rating: 4.6,
    price: 1449,
    optimizedPrice: 1219,
    originalPrice: 2050,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Windshield Cover', 'Oman Extension', 'Rental Car (20 days)', 'Natural Disaster', 'Personal Accident'],
    badge: null,
  },
  {
    id: 14,
    provider: 'Takaful Emarat',
    initial: 'TE',
    color: '#5E6670',
    bg: '#F3F5F7',
    rating: 4.4,
    price: 819,
    optimizedPrice: 679,
    originalPrice: 1150,
    coverage: 'Third Party',
    features: ['Third Party Liability', 'Personal Accident', 'Fire & Theft', '24/7 Roadside', 'Towing (100km)', 'GCC Extension'],
    badge: null,
  },
  {
    id: 15,
    provider: 'ADNIC',
    initial: 'AD',
    color: '#3A3F45',
    bg: '#FAFBFC',
    rating: 4.7,
    price: 1525,
    optimizedPrice: 1279,
    originalPrice: 2150,
    coverage: 'Comprehensive',
    features: ['Agency Repair', '24/7 Roadside', 'Theft Cover', 'Natural Disaster', 'GAP Insurance', 'Rental Car (30 days)', 'No Depreciation'],
    badge: null,
  },
  {
    id: 16,
    provider: 'Emirates Insurance',
    initial: 'EI',
    color: '#4B525A',
    bg: '#F3F5F7',
    rating: 4.5,
    price: 1329,
    optimizedPrice: 1109,
    originalPrice: 1850,
    coverage: 'Comprehensive',
    features: ['Non-Agency Repair', 'Oman Extension', 'Windshield Cover', '24/7 Roadside', 'Personal Accident', 'Towing (200km)'],
    badge: null,
  },
  {
    id: 17,
    provider: 'Fidelity United',
    initial: 'FU',
    color: '#5E6670',
    bg: '#FAFBFC',
    rating: 4.3,
    price: 659,
    optimizedPrice: 539,
    originalPrice: 900,
    coverage: 'Third Party',
    features: ['Third Party Liability', 'Personal Accident', 'Towing (50km)', 'Emergency Medical', 'Driver Cover', 'Oman Extension'],
    badge: null,
  },
  {
    id: 18,
    provider: 'Al Dhafra Insurance',
    initial: 'DH',
    color: '#3A3F45',
    bg: '#F3F5F7',
    rating: 4.6,
    price: 1399,
    optimizedPrice: 1169,
    originalPrice: 1950,
    coverage: 'Comprehensive',
    features: ['Agency Repair', '24/7 Roadside', 'Personal Accident', 'Off-road Cover', 'Oman Extension', 'Key Replacement'],
    badge: null,
  },
  {
    id: 19,
    provider: 'Methaq Takaful',
    initial: 'MT',
    color: '#4B525A',
    bg: '#FAFBFC',
    rating: 4.4,
    price: 759,
    optimizedPrice: 629,
    originalPrice: 1050,
    coverage: 'Third Party',
    features: ['Third Party Liability', '24/7 Roadside', 'Oman Extension', 'Fire & Theft', 'Personal Accident', 'Towing (100km)'],
    badge: null,
  },
  {
    id: 20,
    provider: 'Sukoon Insurance',
    initial: 'SK',
    color: '#5E6670',
    bg: '#F3F5F7',
    rating: 4.5,
    price: 1475,
    optimizedPrice: 1239,
    originalPrice: 2100,
    coverage: 'Comprehensive',
    features: ['Agency Repair', 'Oman Extension', 'GAP Insurance', 'Theft Cover', 'Depreciation Cover', 'Rental Car (15 days)'],
    badge: null,
  },
];

function buildInitialProfile(state: unknown, isLoggedIn: boolean): QuoteFlowDetails {
  const next = mergeQuoteFlowDetails(emptyQuoteFlowDetails, {});
  const navState = (state ?? {}) as {
    brand?: { name?: string } | string;
    model?: string;
    year?: number;
    isBrandNew?: boolean | null;
    extractedRequirementDetails?: Partial<QuoteFlowDetails>;
  };

  if (navState.extractedRequirementDetails) {
    Object.assign(next, mergeQuoteFlowDetails(next, navState.extractedRequirementDetails));
  }

  if (typeof navState.brand === 'string') {
    next.brand = navState.brand;
  } else if (navState.brand?.name) {
    next.brand = navState.brand.name;
  }
  if (navState.model) next.model = navState.model;
  if (navState.year) next.year = String(navState.year);
  if (navState.isBrandNew === true) next.condition = 'Brand new';
  if (navState.isBrandNew === false) next.condition = 'Pre-owned';
  if (isLoggedIn && !next.mobileNumber) next.mobileNumber = '+971 50 123 4567';

  return next;
}

export default function Quotes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, login } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);
  const [unlocked, setUnlocked] = useState(isLoggedIn);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'rating'>('price-low');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [profile, setProfile] = useState<QuoteFlowDetails>(() => buildInitialProfile(location.state, isLoggedIn));
  const [showMulkiyaSheet, setShowMulkiyaSheet] = useState(false);
  const [showDLSheet, setShowDLSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const toggleCompare = (id: number) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };
  const answeredCount = getCompletedFieldCount(profile, isLoggedIn);
  const totalQuestions = getTotalFieldCount(profile);
  const allSurveyDone = getNextQuotesAction(profile, isLoggedIn) === 'done';

  useEffect(() => {
    if (!isLoggedIn) return;
    setProfile((prev) => (prev.mobileNumber ? prev : { ...prev, mobileNumber: '+971 50 123 4567' }));
  }, [isLoggedIn]); // handles login during session

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
    const featureFilters = activeFilters.filter((f) => !['Comprehensive', 'Third Party'].includes(f));
    if (featureFilters.length > 0) {
      filtered = filtered.filter((q) =>
        featureFilters.every((f) => q.features.some((feat) => feat.includes(f)))
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
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Top bar */}
      <div className="sticky top-0 z-40">
        <PageHeaderBar
          title="Your quotes"
          subtitle={buildVehicleSubtitle(profile)}
          onBack={() => navigate('/')}
          rightSlot={isLoggedIn ? (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
              key={answeredCount}
              className="relative rounded-full p-[2px]"
              style={{
                background: `conic-gradient(${getConfidenceLevel(getConfidenceScore(profile, isLoggedIn)).color} ${getConfidenceScore(profile, isLoggedIn)}%, #D6DADE 0%)`,
              }}
            >
              <div className={`flex items-center gap-1.5 rounded-full px-1 py-1 ${allSurveyDone ? 'bg-[#FAFBFC]' : 'bg-[#F3F5F7]'}`}>
                <ClipboardList className={`w-3 h-3 ${allSurveyDone ? 'text-[#0F1113]' : 'text-[#5E6670]'}`} />
                <span className={`text-[10px] whitespace-nowrap ${allSurveyDone ? 'text-[#0F1113]' : 'text-[#5E6670]'}`}>{answeredCount}/{totalQuestions}</span>
                <button
                  onClick={() => setShowEditSheet(true)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F1113]/10"
                >
                  <Pencil className="w-2.5 h-2.5 text-[#0F1113]" />
                </button>
              </div>
            </motion.div>
          ) : undefined}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-4 max-w-5xl">

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
              <Search className="w-3.5 h-3.5 text-[#5E6670] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search insurer..."
                className={`w-full h-10 pl-8.5 pr-8 rounded-xl bg-[#FFFFFF] text-xs text-[#0F1113] placeholder:text-[#B0B6BE] outline-none border ${searchQuery ? 'border-[#B0B6BE]' : 'border-[#D6DADE]'}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-[#B0B6BE]" />
                </button>
              )}
            </div>

            {/* Filters icon */}
            <button
              onClick={() => setShowAllFilters(true)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all relative ${
                activeFilters.length > 0 ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#5E6670] border border-[#D6DADE]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-[#D6DADE] text-[#0F1113] text-[9px] flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Sort icon with dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  sortBy !== 'price-low' ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#5E6670] border border-[#D6DADE]'
                }`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                  <div className="absolute right-0 top-11 z-20 bg-[#FFFFFF] rounded-xl border border-[#D6DADE] py-1 min-w-[160px] overflow-hidden">
                    {[
                      { value: 'price-low', label: 'Price: Low → High' },
                      { value: 'price-high', label: 'Price: High → Low' },
                      { value: 'rating', label: 'Top Rated' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value as typeof sortBy); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between ${
                          sortBy === opt.value ? 'text-[#0F1113] bg-[#F3F5F7]' : 'text-[#5E6670]'
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#0F1113]" />}
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
                className="h-10 px-3 rounded-xl text-[11px] text-[#5E6670] hover:text-[#3A3F45] border border-dashed border-[#D6DADE] flex items-center gap-1 flex-shrink-0"
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
                      ? 'bg-[#0F1113] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#5E6670] border border-[#D6DADE]'
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
        {isLoggedIn && (
          <div className="mt-1">
            <QuoteConfidenceCard
              details={profile}
              setDetails={setProfile}
              isLoggedIn={isLoggedIn}
              onOpenMulkiya={() => setShowMulkiyaSheet(true)}
              onOpenDl={() => setShowDLSheet(true)}
            />
          </div>
        )}

        {/* Best Quote - Fully Visible */}
        {bestQuote && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#FFFFFF] rounded-[20px] overflow-hidden mb-3 border border-[#D6DADE]"
        >
          {/* Badge */}
          <div className="bg-[#D6DADE] px-4 py-1.5 flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-[#0F1113]" />
            <span className="text-xs text-[#0F1113]">Best Value · Recommended for you</span>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                  style={{ backgroundColor: bestQuote.bg }}
                >
                  <span className="text-sm" style={{ color: bestQuote.color }}>{bestQuote.initial}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F1113]">{bestQuote.provider}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-[#5E6670] fill-[#B0B6BE]" />
                    <span className="text-[12px] text-[#5E6670]">{bestQuote.rating}</span>
                    <span className="text-[12px] text-[#5E6670] mx-0.5">·</span>
                    <span className="text-[12px] text-[#5E6670] whitespace-nowrap">{bestQuote.coverage}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <FlipPrice value={allSurveyDone ? bestQuote.optimizedPrice : bestQuote.price} className="text-lg font-bold text-[#0F1113]" />
                <p className="text-[11px] text-[#8A919A] mt-0.5">per year</p>
              </div>
            </div>

            {/* Features */}
            <div className="-mx-4 px-4 overflow-x-auto mb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-1.5 w-max">
                {bestQuote.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 text-[11px] bg-[#F3F5F7] text-[#4B525A] px-2 py-1 rounded-lg whitespace-nowrap">
                    <Check className="w-3 h-3 text-[#8A919A]" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="h-9 px-4 rounded-xl bg-[#F3F5F7] text-[#0F1113] flex items-center justify-center text-xs transition-all active:scale-[0.98] flex-shrink-0"
              >
                View details
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex-1 min-w-0 h-9 rounded-xl bg-[#0F1113] text-[#FFFFFF] flex items-center justify-center text-xs transition-all active:scale-[0.98]"
              >
                <span className="truncate px-2">{allSurveyDone ? `Buy Now · د.إ ${bestQuote.optimizedPrice}/yr` : `Starting at د.إ ${bestQuote.price}/yr`}</span>
              </button>
            </div>
            <button
              onClick={() => toggleCompare(bestQuote.id)}
              className={`mt-2 w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.98] ${
                compareIds.includes(bestQuote.id) ? 'bg-[#0F1113]/5 text-[#0F1113] ring-1 ring-[#0F1113]' : 'bg-[#FFFFFF] text-[#5E6670] border border-[#D6DADE]'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${compareIds.includes(bestQuote.id) ? 'bg-[#0F1113] border-[#0F1113]' : 'border-[#B0B6BE]'}`}>
                {compareIds.includes(bestQuote.id) && <Check className="w-2.5 h-2.5 text-[#FFFFFF]" />}
              </div>
              Add to compare
            </button>
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
                className={`bg-[#FFFFFF] rounded-[20px] p-4 border border-[#D6DADE] ${!unlocked ? 'blur-[6px]' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-[14px] flex items-center justify-center"
                      style={{ backgroundColor: quote.bg }}
                    >
                      <span className="text-sm" style={{ color: quote.color }}>{quote.initial}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0F1113]">{quote.provider}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-[#5E6670] fill-[#B0B6BE]" />
                        <span className="text-[12px] text-[#5E6670]">{quote.rating}</span>
                        <span className="text-[12px] text-[#5E6670] mx-0.5">·</span>
                        <span className="text-[12px] text-[#5E6670] whitespace-nowrap">{quote.coverage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <FlipPrice value={allSurveyDone ? quote.optimizedPrice : quote.price} className="text-lg font-bold text-[#0F1113]" />
                    <p className="text-[11px] text-[#8A919A] mt-0.5">per year</p>
                  </div>
                </div>
                <div className="-mx-4 px-4 overflow-x-auto mb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-1.5 w-max">
                    {quote.features.map((f) => (
                      <span key={f} className="inline-flex items-center gap-1 text-[11px] bg-[#F3F5F7] text-[#4B525A] px-2 py-1 rounded-lg whitespace-nowrap">
                        <Check className="w-3 h-3 text-[#8A919A]" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                {unlocked && (
                  <>
                    <div className="flex gap-2 mt-3">
                      <button className="h-9 px-4 rounded-xl bg-[#F3F5F7] text-[#0F1113] flex items-center justify-center text-xs transition-all active:scale-[0.98] flex-shrink-0">
                        View details
                      </button>
                      <button className="flex-1 min-w-0 h-9 rounded-xl bg-[#0F1113] text-[#FFFFFF] flex items-center justify-center text-xs transition-all active:scale-[0.98]">
                        <span className="truncate px-2">{allSurveyDone ? `Buy Now · د.إ ${quote.optimizedPrice}/yr` : `Starting at د.إ ${quote.price}/yr`}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => toggleCompare(quote.id)}
                      className={`mt-2 w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all active:scale-[0.98] ${
                        compareIds.includes(quote.id) ? 'bg-[#0F1113]/5 text-[#0F1113] ring-1 ring-[#0F1113]' : 'bg-[#FFFFFF] text-[#5E6670] border border-[#D6DADE]'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${compareIds.includes(quote.id) ? 'bg-[#0F1113] border-[#0F1113]' : 'border-[#B0B6BE]'}`}>
                        {compareIds.includes(quote.id) && <Check className="w-2.5 h-2.5 text-[#FFFFFF]" />}
                      </div>
                      Add to compare
                    </button>
                  </>
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
              className="bg-[#FFFFFF] rounded-[20px] p-4 mx-4 max-w-sm w-full text-center shadow-lg shadow-black/5 border border-[#D6DADE]"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F3F5F7] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-[#0F1113]" />
              </div>
              <h3 className="text-base text-[#0F1113] mb-0.5">
                {remainingQuotes.length} more quotes available
              </h3>
              <p className="text-xs text-[#5E6670] mb-3">
                Sign in to unlock all quotes, compare plans and buy your policy instantly
              </p>
              <div
                onClick={() => setShowLoginModal(true)}
                className="w-full h-10 rounded-xl bg-[#F3F5F7] flex items-center gap-2 px-3 mb-3 cursor-pointer"
              >
                <span className="text-xs text-[#5E6670]">🇦🇪 +971</span>
                <span className="text-xs text-[#5E6670]">Enter mobile number</span>
              </div>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full h-10 rounded-xl bg-[#0F1113] text-[#FFFFFF] flex items-center justify-center gap-2 text-xs transition-all active:scale-[0.98]"
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
        <LoginModal onClose={() => setShowLoginModal(false)} onUnlock={handleUnlock} quotesCount={allFiltered.length} initialPhone={profile.mobileNumber} />
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

      <MulkiyaBottomSheet
        open={showMulkiyaSheet}
        onOpenChange={setShowMulkiyaSheet}
        onComplete={(details) => {
          setProfile((prev) => mergeQuoteFlowDetails(prev, details));
        }}
      />

      {/* DL Upload Bottom Sheet */}
      <DLUploadBottomSheet
        open={showDLSheet}
        onOpenChange={setShowDLSheet}
        onComplete={() => {
          setProfile((prev) => mergeQuoteFlowDetails(prev, applyMockDlExtraction(prev)));
        }}
      />
      {compareIds.length > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#0F1113] text-[#FFFFFF] shadow-lg shadow-black/20 flex items-center justify-center active:scale-[0.98] transition-transform border border-[#1D1E20]"
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-[#FFFFFF] text-[#0F1113] text-[11px] font-bold flex items-center justify-center shadow-sm">
            {compareIds.length}
          </span>
        </motion.button>
      )}
      <AiAssistantButton />
      <EditDetailsSheet
        open={showEditSheet}
        onOpenChange={setShowEditSheet}
        details={profile}
        onSave={(updated) => setProfile(updated)}
      />
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
      <div className="absolute inset-0 bg-[#0F1113]/45" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 z-10 max-h-[80vh] flex flex-col border border-[#D6DADE]"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 bg-[#D6DADE] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D6DADE]">
          <h3 className="text-lg text-[#0F1113]">All Filters</h3>
          <div className="flex items-center gap-3">
            {activeFilters.length > 0 && (
              <button onClick={onClear} className="text-xs text-[#5E6670] hover:text-[#3A3F45]">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center">
              <X className="w-4 h-4 text-[#5E6670]" />
            </button>
          </div>
        </div>

        {/* Filter groups */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {grouped.map(({ category, filters }) => (
            <div key={category}>
              <p className="text-xs text-[#5E6670] mb-2.5">{category}</p>
              <div className="flex flex-wrap gap-2">
                {filters.map(({ label }) => {
                  const isActive = activeFilters.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleFilter(label)}
                      className={`h-9 px-4 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#0F1113] text-[#FFFFFF]'
                          : 'bg-[#F3F5F7] text-[#4B525A]'
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
        <div className="px-6 py-4 border-t border-[#D6DADE]">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#0F1113] text-[#FFFFFF] flex items-center justify-center text-sm transition-all active:scale-[0.98]"
          >
            Show Results{activeFilters.length > 0 ? ` (${activeFilters.length} filters)` : ''}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
