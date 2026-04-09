import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import { SendHorizonal, Sparkles, Pencil, Check, Plus, X } from 'lucide-react';
import { PageHeaderBar } from './PageHeaderBar';
import {
  carBrands,
  getYearRange,
  normalizeVehicleQuery,
  parseVehicleInput,
  modelsByBrand,
} from './vehicle-details/vehicleData';

const popularBrands = carBrands.slice(0, 6);
// Progressive suggestion phases
type SuggestionPhase = 'brand' | 'model' | 'year' | 'condition' | 'done';
type CoverageType = 'Comprehensive' | 'Third Party';
type SuggestionCategory = keyof RequirementDetails;

type RequirementDetails = {
  brand: string;
  model: string;
  year: string;
  condition: string;
  coverage: string;
  spec: string;
  budget: string;
  city: string;
  usage: string;
  expiry: string;
};

type ChatMessage = {
  id: number;
  text: string;
  role: 'user' | 'assistant';
};

type AttachmentItem = {
  id: number;
  name: string;
  kind: 'image' | 'file';
};

const emptyDetails: RequirementDetails = {
  brand: '',
  model: '',
  year: '',
  condition: '',
  coverage: '',
  spec: '',
  budget: '',
  city: '',
  usage: '',
  expiry: '',
};

const detailLabels: Record<keyof RequirementDetails, string> = {
  brand: 'Car brand',
  model: 'Car model',
  year: 'Year',
  condition: 'Condition',
  coverage: 'Coverage',
  spec: 'Car spec',
  budget: 'Budget',
  city: 'City',
  usage: 'Usage',
  expiry: 'Current policy expiry',
};

const primaryDetailFields: Array<keyof RequirementDetails> = ['brand', 'model', 'year'];
const secondaryDetailFields: Array<keyof RequirementDetails> = ['city', 'usage', 'expiry', 'budget'];

const cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah'];
const conversationPrefixes = [
  'i have a ',
  'i have an ',
  'i drive a ',
  'i drive an ',
  'i own a ',
  'i own an ',
  'my car is a ',
  'my car is an ',
  "it's a ",
  'its a ',
  'i got a ',
  'i got an ',
  'my ',
  'i have ',
  'i drive ',
  'i own ',
];

// Only ask brand new vs pre-owned for current year or last year (if within 6 months)
function shouldAskCondition(year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  if (year === currentYear) return true;
  if (year === currentYear - 1 && now.getMonth() < 6) return true; // Jan–Jun
  return false;
}

function getSentencePrefix(inputText: string): string {
  const lower = inputText.toLowerCase();
  const matchedPrefix = conversationPrefixes.find((prefix) => lower.startsWith(prefix));
  if (matchedPrefix) {
    return inputText.slice(0, matchedPrefix.length);
  }
  return 'I have a ';
}

function getRemainderAfterPrefix(inputText: string): string {
  const normalized = normalizeVehicleQuery(inputText);
  const matchedPrefix = conversationPrefixes.find((prefix) => normalized.startsWith(prefix));
  if (!matchedPrefix) return normalized;
  return normalized.slice(matchedPrefix.length).trim();
}

function getUnmatchedModelFragment(remainder: string, brand?: string): string {
  if (!brand) return remainder;
  const withoutBrand = remainder.replace(new RegExp(`^${brand.toLowerCase()}\\s*`), '');
  const beforeYear = withoutBrand.split(',')[0]?.trim() ?? '';
  return beforeYear;
}

function getCurrentFragment(inputText: string): string {
  const trimmed = inputText.trim();
  if (!trimmed) return '';
  const fragments = trimmed.split(/[.!?]+/);
  return fragments[fragments.length - 1]?.trim() ?? '';
}

function getNextMissingCategory(details: RequirementDetails): SuggestionCategory | null {
  if (!details.brand) return 'brand';
  if (!details.model) return 'model';
  if (!details.year) return 'year';
  if (shouldAskCondition(Number(details.year)) && !details.condition) return 'condition';
  if (!details.coverage) return 'coverage';
  if (!details.spec) return 'spec';
  if (!details.city) return 'city';
  if (!details.usage) return 'usage';
  if (!details.expiry) return 'expiry';
  if (!details.budget) return 'budget';
  return null;
}

function detectSuggestionCategory(
  inputText: string,
  details: RequirementDetails,
  phase: SuggestionPhase,
  activeQuestion?: string
): SuggestionCategory | null {
  const fragment = normalizeVehicleQuery(getCurrentFragment(inputText));
  const normalizedQuestion = normalizeVehicleQuery(activeQuestion ?? '');

  if (!fragment && normalizedQuestion) {
    if (normalizedQuestion.includes('third party') || normalizedQuestion.includes('comprehensive')) return 'coverage';
    if (normalizedQuestion.includes('gcc')) return 'spec';
    if (normalizedQuestion.includes('emirate') || normalizedQuestion.includes('registered')) return 'city';
    if (normalizedQuestion.includes('personal') || normalizedQuestion.includes('business')) return 'usage';
    if (normalizedQuestion.includes('expires') || normalizedQuestion.includes('policy')) return 'expiry';
    if (normalizedQuestion.includes('budget')) return 'budget';
    if (normalizedQuestion.includes('brand new') || normalizedQuestion.includes('pre-owned')) return 'condition';
    if (normalizedQuestion.includes('which year')) return 'year';
    if (normalizedQuestion.includes('which make')) return 'brand';
    if (normalizedQuestion.includes('which') && normalizedQuestion.includes('model')) return 'model';
  }

  if (!fragment) {
    return getNextMissingCategory(details);
  }

  if (/\b(third party|third-party|comprehensive|cover|insurance)\b/.test(fragment)) return 'coverage';
  if (/\b(gcc|non-gcc|imported|american|european|japanese|spec)\b/.test(fragment)) return 'spec';
  if (/\b(budget|aed|dhs?)\b/.test(fragment)) return 'budget';
  if (/\b(expire|expiry|expiring|renewal|renew)\b/.test(fragment)) return 'expiry';
  if (/\b(dubai|abu dhabi|sharjah|ajman|ras al khaimah|umm al quwain|fujairah|registered|emirate)\b/.test(fragment)) return 'city';
  if (/\b(personal|private|commercial|business|delivery|taxi|use)\b/.test(fragment)) return 'usage';
  if (/\b(brand new|pre-owned|pre owned|used|new)\b/.test(fragment)) return 'condition';

  if (!details.brand || phase === 'brand') return 'brand';
  if (details.brand && !details.model) return 'model';
  if (details.brand && details.model && !details.year) return 'year';
  if (details.year && !details.condition && shouldAskCondition(Number(details.year))) return 'condition';

  return getNextMissingCategory(details);
}

function getSentenceTemplates(
  category: SuggestionCategory,
  inputText: string,
  details: RequirementDetails
): string[] {
  const prefix = getSentencePrefix(inputText);
  const remainder = getRemainderAfterPrefix(inputText);
  const fragment = normalizeVehicleQuery(getCurrentFragment(inputText));

  if (category === 'brand') {
    const brandFragment = (fragment.split(/\s+/).pop() ?? remainder.split(/\s+/)[0] ?? '').trim();
    const matchingBrands = carBrands.filter((brand) =>
      !brandFragment || brand.name.toLowerCase().startsWith(brandFragment)
    );
    return (brandFragment ? matchingBrands : carBrands).slice(0, 6).map((brand) => `${prefix}${brand.name}`);
  }

  if (category === 'model' && details.brand) {
    const modelFragment = getUnmatchedModelFragment(remainder || fragment, details.brand).toLowerCase();
    return [...(modelsByBrand[details.brand] ?? [])]
      .filter((model) => !modelFragment || model.toLowerCase().startsWith(modelFragment))
      .reverse()
      .slice(0, 6)
      .map((model) => `${prefix}${details.brand} ${model}`);
  }

  if (category === 'year' && details.brand && details.model) {
    const yearFragment = fragment.match(/(\d{0,4})$/)?.[1] ?? '';
    return [...getYearRange()]
      .reverse()
      .filter((year) => !yearFragment || String(year).startsWith(yearFragment))
      .slice(0, 6)
      .map((year) => `${prefix}${details.brand} ${details.model}, ${year} model`);
  }

  if (category === 'condition' && details.brand && details.model && details.year) {
    const baseText = `${prefix}${details.brand} ${details.model}, ${details.year} model`;
    return [`${baseText}, brand new`, `${baseText}, pre-owned`];
  }

  if (category === 'coverage') {
    return ['I want Third Party insurance.', 'I want Comprehensive insurance.'];
  }

  if (category === 'spec') {
    return ['My car is GCC spec.', 'My car is non-GCC spec.', 'It is an imported car.'];
  }

  if (category === 'city') {
    return ['My car is registered in Dubai.', 'My car is registered in Abu Dhabi.', 'My car is registered in Sharjah.'];
  }

  if (category === 'usage') {
    return ['I use it for personal driving.', 'I use it for business use.', 'It is for daily commute.'];
  }

  if (category === 'expiry') {
    return ['My current policy expires next month.', 'My current policy already expired.', 'My renewal is due this week.'];
  }

  if (category === 'budget') {
    return ['My budget is AED 2,000.', 'My budget is around AED 3,000.', 'I want the best value option.'];
  }

  return [];
}

function isSuggestionRelevant(
  query: string,
  suggestion: string,
  category: SuggestionCategory
): boolean {
  const fragment = normalizeVehicleQuery(getCurrentFragment(query));
  if (!fragment) return true;

  const normalizedSuggestion = normalizeVehicleQuery(suggestion);
  if (normalizedSuggestion.startsWith(fragment)) return true;

  if (category === 'coverage') {
    return ['third party', 'comprehensive', 'insurance', 'cover'].some((term) => fragment.includes(term) && normalizedSuggestion.includes(term));
  }

  if (category === 'spec') {
    return ['gcc', 'non-gcc', 'imported', 'spec'].some((term) => fragment.includes(term) && normalizedSuggestion.includes(term));
  }

  if (category === 'city') {
    return cities.some((city) => fragment.includes(city.toLowerCase()) && normalizedSuggestion.includes(city.toLowerCase()));
  }

  return fragment.length >= 2 && normalizedSuggestion.includes(fragment);
}

function generateSuggestions(
  inputText: string,
  phase: SuggestionPhase,
  details: RequirementDetails,
  activeQuestion?: string
): { text: string; phase: SuggestionPhase }[] {
  const category = detectSuggestionCategory(inputText, details, phase, activeQuestion);
  if (!category) return [];

  const nextPhase: SuggestionPhase =
    category === 'brand' || category === 'model' || category === 'year' || category === 'condition'
      ? category
      : phase;

  return getSentenceTemplates(category, inputText, details)
    .filter((template) => isSuggestionRelevant(inputText, template, category))
    .slice(0, 6)
    .map((text) => ({ text, phase: nextPhase }));
}

function parseDetailsFromText(inputText: string): Partial<RequirementDetails> {
  const normalized = normalizeVehicleQuery(inputText);
  const parsedVehicle = parseVehicleInput(normalized);
  const lower = inputText.toLowerCase();
  const next: Partial<RequirementDetails> = {};

  if (parsedVehicle?.brand) next.brand = parsedVehicle.brand;
  if (parsedVehicle?.model) next.model = parsedVehicle.model;
  if (parsedVehicle?.year) next.year = String(parsedVehicle.year);
  if (parsedVehicle?.isBrandNew !== undefined) next.condition = parsedVehicle.isBrandNew ? 'Brand new' : 'Pre-owned';
  if (parsedVehicle?.spec) next.spec = parsedVehicle.spec === 'gcc' ? 'GCC' : 'Non-GCC';

  let coverage: CoverageType | null = null;
  if (lower.includes('third party') || lower.includes('third-party')) coverage = 'Third Party';
  if (lower.includes('comprehensive')) coverage = 'Comprehensive';
  if (coverage) next.coverage = coverage;

  const budgetMatch = inputText.match(/(?:budget|aed|dhs?)\s*[:\-]?\s*([0-9][0-9,\.]{2,})/i);
  if (budgetMatch?.[1]) next.budget = `AED ${budgetMatch[1].replace(/,/g, '')}`;

  const foundCity = cities.find((city) => lower.includes(city.toLowerCase()));
  if (foundCity) next.city = foundCity;

  if (/\b(commercial|business|delivery|taxi)\b/i.test(inputText)) {
    next.usage = 'Commercial';
  } else if (/\b(personal|private|daily commute|family)\b/i.test(inputText)) {
    next.usage = 'Personal';
  }

  if (/\b(already expired|expired already)\b/i.test(inputText)) {
    next.expiry = 'Already expired';
  } else {
    const expiryPatterns: RegExp[] = [
      /\b(?:expire|expires|expiry|expiring|renewal(?:\s+is)?\s+due)\b[^.!,;]*?\b(next month|this month|next week|this week|tomorrow|today)\b/i,
      /\b(?:expire|expires|expiry|expiring|renewal(?:\s+is)?\s+due)\b[^.!,;]*?\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b/i,
      /\b(?:expire|expires|expiry|expiring|renewal(?:\s+is)?\s+due)\b[^.!,;]*?\b\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?\b/i,
      /\b(?:expire|expires|expiry|expiring|renewal(?:\s+is)?\s+due)\b[^.!,;]*?\b\d{4}-\d{2}-\d{2}\b/i,
    ];

    const expiryMatch = expiryPatterns
      .map((pattern) => inputText.match(pattern))
      .find(Boolean);

    if (expiryMatch?.[0]) {
      const cleanedExpiry = expiryMatch[0]
        .replace(/^(my|the)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      next.expiry = cleanedExpiry;
    }
  }

  return next;
}

function mergeDetails(prev: RequirementDetails, next: Partial<RequirementDetails>): RequirementDetails {
  return {
    ...prev,
    ...Object.fromEntries(Object.entries(next).filter(([, value]) => Boolean(value && String(value).trim()))),
  };
}

function hasCompletedSentence(inputText: string): boolean {
  return /[.!?]\s*$/.test(inputText.trim());
}

function hasVehicleCore(details: RequirementDetails): boolean {
  return Boolean(details.brand && details.model && details.year);
}

function getGuidancePrompts(details: RequirementDetails, inputText: string): Array<{ key: keyof RequirementDetails; text: string }> {
  if (!hasVehicleCore(details)) return [];
  if (!hasCompletedSentence(inputText) && inputText.trim().length > 0) return [];

  const prompts: Array<{ key: keyof RequirementDetails; text: string }> = [];

  if (!details.coverage) {
    prompts.push({ key: 'coverage', text: 'I want Third Party cover.' });
    prompts.push({ key: 'coverage', text: 'I want Comprehensive cover.' });
    return prompts;
  }

  if (!details.spec) {
    prompts.push({ key: 'spec', text: 'My car is GCC spec.' });
    prompts.push({ key: 'spec', text: 'My car is non-GCC spec.' });
    return prompts;
  }

  if (!details.condition && shouldAskCondition(Number(details.year))) {
    prompts.push({ key: 'condition', text: 'It is brand new.' });
    prompts.push({ key: 'condition', text: 'It is pre-owned.' });
    return prompts;
  }

  if (!details.city) {
    prompts.push({ key: 'city', text: 'My car is registered in Dubai.' });
    prompts.push({ key: 'city', text: 'My car is registered in Abu Dhabi.' });
    return prompts;
  }

  if (!details.usage) {
    prompts.push({ key: 'usage', text: 'I use it for personal driving.' });
    prompts.push({ key: 'usage', text: 'I use it for business use.' });
    return prompts;
  }

  if (!details.expiry) {
    prompts.push({ key: 'expiry', text: 'My current policy expires next month.' });
    prompts.push({ key: 'expiry', text: 'My current policy already expired.' });
    return prompts;
  }

  if (!details.budget) {
    prompts.push({ key: 'budget', text: 'My budget is AED 2,000.' });
    prompts.push({ key: 'budget', text: 'My budget is around AED 3,000.' });
  }

  return prompts;
}

function getNextQuestion(details: RequirementDetails): string {
  if (!details.brand) return 'Which make is your car?';
  if (!details.model) return `Which ${details.brand} model do you have?`;
  if (!details.year) return 'Which year model is it?';
  if (hasVehicleCore(details)) {
    if (!details.coverage) return 'We have enough to start quotes.\nTell me if you want Third Party or Comprehensive insurance.';
    if (!details.spec) return 'Quotes are ready.\nTell me if your car is GCC spec or non-GCC for better matching.';
    if (!details.city) return 'Quotes are ready.\nTell me which emirate the car is registered in for better matching.';
    if (!details.usage) return 'Quotes are ready.\nTell me whether the car is for personal or business use.';
    if (!details.expiry) return 'Quotes are ready.\nTell me when your current policy expires if you want better matching.';
    if (!details.budget) return 'Quotes are ready.\nTell me your budget if you want help narrowing the options.';
    return 'Quotes are ready.\nYou can continue adding details, or go ahead and see quotes.';
  }
  if (!details.condition && shouldAskCondition(Number(details.year))) return 'Is it brand new or pre-owned?';
  return 'Anything else you want us to consider before showing quotes?';
}

function getEstimatedQuoteCount(details: RequirementDetails): number {
  let count = 0;

  if (details.brand) count += 4;
  if (details.model) count += 5;
  if (details.year) count += 5;
  if (details.condition) count += 2;
  if (details.coverage) count += 3;
  if (details.spec) count += 2;
  if (details.city) count += 2;
  if (details.usage) count += 2;
  if (details.expiry) count += 1;
  if (details.budget) count += 2;

  return Math.max(0, Math.min(28, count));
}

function getCoreStatusText(details: RequirementDetails, quoteCount: number): string {
  const missingCore: string[] = [];

  if (!details.brand) missingCore.push('make');
  if (!details.model) missingCore.push('model');
  if (!details.year) missingCore.push('year');

  if (missingCore.length === 0) {
    return `${quoteCount} quotes ready so far`;
  }

  if (missingCore.length === 1) {
    return `Need ${missingCore[0]} to unlock quotes`;
  }

  return `Need ${missingCore.slice(0, -1).join(', ')} and ${missingCore[missingCore.length - 1]}`;
}

function renderAssistantMessage(text: string) {
  const [intro, emphasis, ...rest] = text.split('\n');

  if (!emphasis) {
    return <p className="text-[14px] leading-5">{text}</p>;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[14px] leading-5">{intro}</p>
      <p className="text-[14px] font-semibold leading-5 text-[#0F1113]">{emphasis}</p>
      {rest.map((line, index) => (
        <p key={`${line}-${index}`} className="text-[14px] leading-5 text-[#0F1113]">
          {line}
        </p>
      ))}
    </div>
  );
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

export function SmartVehicleInput({ mode = 'trigger', initialQuery: initialQueryProp }: { mode?: 'trigger' | 'page'; initialQuery?: string } = {}) {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputSizerRef = useRef<HTMLDivElement>(null);
  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const detailRailRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Partial<Record<keyof RequirementDetails, HTMLDivElement | null>>>({});
  const previousDetailsRef = useRef<RequirementDetails>(emptyDetails);
  const [expanded, setExpanded] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [viewportOffsetTop, setViewportOffsetTop] = useState(0);
  const [suggestionsHeight, setSuggestionsHeight] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SuggestionPhase>('brand');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [details, setDetails] = useState<RequirementDetails>(emptyDetails);
  const [editMode, setEditMode] = useState(false);
  const [editingDraft, setEditingDraft] = useState<RequirementDetails>(emptyDetails);
  const [isExtracting, setIsExtracting] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<Array<keyof RequirementDetails>>([]);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const extractionTimerRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const didInitPageMode = useRef(false);

  // Auto-expand when rendered as a page
  useEffect(() => {
    if (mode !== 'page' || didInitPageMode.current) return;
    didInitPageMode.current = true;
    if (initialQueryProp) {
      setQuery(initialQueryProp);
      const parsed = parseVehicleInput(normalizeVehicleQuery(initialQueryProp));
      if (parsed?.brand && parsed?.model && parsed?.year) setPhase('condition');
      else if (parsed?.brand && parsed?.model) setPhase('year');
      else if (parsed?.brand) setPhase('model');
      else setPhase('brand');
    }
    setExpanded(true);
    focusInput();
  }, [mode, initialQueryProp]);

  const normalizedQuery = normalizeVehicleQuery(query);
  const draftDetails = mergeDetails(details, parseDetailsFromText(query));
  const activeAssistantQuestion = [...messages].reverse().find((message) => message.role === 'assistant')?.text;
  const currentSuggestions = generateSuggestions(query, phase, draftDetails, activeAssistantQuestion);
  const ghost = normalizedQuery === query.toLowerCase().trim()
    ? getGhostText(query, currentSuggestions)
    : null;
  const previewText = ghost && query.length > 0 ? ghost : query;
  const guidancePrompts: Array<{ key: keyof RequirementDetails; text: string }> = [];
  const isQuoteReady = Boolean(details.brand && details.model && details.year);
  const quoteCount = getEstimatedQuoteCount(details);
  const coreStatusText = getCoreStatusText(details, quoteCount);
  const canSubmit = Boolean(query.trim() || attachments.length > 0);
  const visiblePrimaryFields = primaryDetailFields.filter((field) => details[field]);
  const missingPrimaryFields = primaryDetailFields.filter((field) => !details[field]);
  const visibleSecondaryFields = ['coverage', 'spec', 'condition', ...secondaryDetailFields].filter((field) => details[field as keyof RequirementDetails]) as Array<keyof RequirementDetails>;
  const hasExtraction = messages.length > 0 || Object.values(details).some(Boolean);

  const filteredSuggestions = currentSuggestions;

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
    return () => {
      if (extractionTimerRef.current) {
        window.clearTimeout(extractionTimerRef.current);
      }
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousDetails = previousDetailsRef.current;
    const newlyCapturedFields = (Object.keys(details) as Array<keyof RequirementDetails>).filter(
      (field) => !previousDetails[field] && Boolean(details[field])
    );

    previousDetailsRef.current = details;

    if (newlyCapturedFields.length === 0) return;

    setHighlightedFields(newlyCapturedFields);

    const lastCapturedField = newlyCapturedFields[newlyCapturedFields.length - 1];
    const chipNode = chipRefs.current[lastCapturedField];
    if (chipNode) {
      chipNode.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }

    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
    }

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedFields([]);
      highlightTimerRef.current = null;
    }, 2000);
  }, [details]);

  useEffect(() => {
    if (!expanded) return;

    const viewport = window.visualViewport;

    const syncViewportHeight = () => {
      setViewportHeight(viewport?.height ?? window.innerHeight);
      setViewportOffsetTop(viewport?.offsetTop ?? 0);
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
      setViewportOffsetTop(0);
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
  }, [expanded, phase, filteredSuggestions.length, messages.length, isExtracting]);

  useLayoutEffect(() => {
    const textarea = inputRef.current;
    const sizer = inputSizerRef.current;
    if (!textarea || !sizer) return;

    sizer.textContent = `${previewText || query || ''}\n`;
    const lineHeight = 20;
    const maxHeight = lineHeight * 4;
    const nextHeight = Math.min(Math.max(sizer.scrollHeight, lineHeight), maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = sizer.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [query, previewText, expanded]);

  const openExpanded = (initialQuery?: string) => {
    navigate('/requirements', { state: { initialQuery: initialQuery || '' } });
  };

  const closeExpanded = () => {
    setExpanded(false);
    setQuery('');
    setPhase('brand');
    setMessages([]);
    setDetails(emptyDetails);
    setEditMode(false);
    setEditingDraft(emptyDetails);
    setIsExtracting(false);
    setHighlightedFields([]);
    setAttachments([]);
    navigate('/');
    if (extractionTimerRef.current) {
      window.clearTimeout(extractionTimerRef.current);
      extractionTimerRef.current = null;
    }
    if (highlightTimerRef.current) {
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    previousDetailsRef.current = emptyDetails;
  };

  const handleSuggestionClick = (suggestion: { text: string; phase: SuggestionPhase }) => {
    const shouldAppend = Boolean(
      query.trim() &&
      hasCompletedSentence(query) &&
      !normalizeVehicleQuery(suggestion.text).startsWith(normalizeVehicleQuery(query))
    );
    const nextText = shouldAppend ? `${query.trim()} ${suggestion.text}` : suggestion.text;

    if (suggestion.phase === 'brand') {
      setPhase('model');
      setQuery(nextText + ' ');
    } else if (suggestion.phase === 'model') {
      setPhase('year');
      setQuery(nextText + ', ');
    } else if (suggestion.phase === 'year') {
      const parsed = parseVehicleInput(nextText);
      if (parsed?.year && shouldAskCondition(parsed.year)) {
        setPhase('condition');
        setQuery(nextText + ', ');
      } else {
        setQuery(nextText);
        setPhase('done');
        return;
      }
    } else if (suggestion.phase === 'condition') {
      setQuery(nextText);
      setPhase('done');
      return;
    } else {
      setQuery(nextText + ' ');
      setPhase(phase);
      return;
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = (text?: string) => {
    const input = text || query;
    if (!input.trim() && attachments.length === 0) return;

    const extracted = parseDetailsFromText(input);
    const nextDetails = mergeDetails(details, extracted);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input.trim() || `Added ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}.`,
        role: 'user',
      },
    ]);
    setDetails(nextDetails);
    setEditingDraft(nextDetails);
    setQuery('');
    setAttachments([]);
    setIsExtracting(true);

    if (extractionTimerRef.current) {
      window.clearTimeout(extractionTimerRef.current);
    }
    extractionTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: getNextQuestion(nextDetails), role: 'assistant' },
      ]);
      setIsExtracting(false);
      extractionTimerRef.current = null;
    }, 700);

    const parsed = parseVehicleInput(normalizeVehicleQuery(input));
    if (parsed?.brand && parsed?.model && parsed?.year && shouldAskCondition(parsed.year) && parsed?.isBrandNew === undefined) {
      setPhase('condition');
    } else if (parsed?.brand && parsed?.model && !parsed?.year) {
      setPhase('year');
    } else if (parsed?.brand && !parsed?.model) {
      setPhase('model');
    } else {
      setPhase('done');
    }
  };

  const goToQuotes = () => {
    if (!details.brand || !details.model || !details.year) return;
    const parsedYear = Number(details.year);
    const brandObj = carBrands.find((b) => b.name === details.brand);
    const isBrandNew = details.condition.toLowerCase().includes('brand') ? true : details.condition.toLowerCase().includes('pre') ? false : null;

    setTimeout(() => {
      navigate('/quotes', {
        state: {
          brand: brandObj,
          model: details.model,
          year: Number.isNaN(parsedYear) ? undefined : parsedYear,
          isBrandNew,
          userRequirementMessages: messages.map((m) => m.text),
          extractedRequirementDetails: details,
        },
      });
    }, 150);
  };

  const saveEditingDraft = () => {
    setDetails(editingDraft);
    setEditMode(false);
  };

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setAttachments((prev) => [
      ...prev,
      ...files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        kind: file.type.startsWith('image/') ? 'image' : 'file',
      })),
    ]);

    event.target.value = '';
  };

  const removeAttachment = (id: number) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghost && query.length < ghost.length) {
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

  // Page mode: render the expanded UI as a full-screen page (no overlay, no home behind)
  if (mode === 'page') {
    return (
      <div
        ref={overlayRef}
        className="flex flex-col bg-white"
        style={{
          height: viewportHeight ? `${viewportHeight}px` : '100svh',
          transform: `translateY(${viewportOffsetTop}px)`,
        }}
      >
        {/* Header */}
        <div ref={headerRef}>
          <PageHeaderBar
            title="Your requirements"
            subtitle="Tell us about your car in detail"
            onBack={closeExpanded}
          />
        </div>

        <div ref={questionRef} className="relative z-10 bg-[#F3F5F7] px-5 pt-3 pb-3 shadow-[0_14px_30px_rgba(15,17,19,0.10)] flex-shrink-0">
          {!hasExtraction ? (
            <p className="text-[36px] leading-tight font-bold text-[#0F1113]">
              What car do you own?
            </p>
          ) : (
            <>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[16px] leading-5 font-semibold text-[#0F1113]">
                    {visiblePrimaryFields.length > 0 ? visiblePrimaryFields.map((field) => details[field]).join(' · ') : 'Extracting vehicle details'}
                  </p>
                  <p className="text-[11px] text-[#8A919A]">{coreStatusText}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDraft(details);
                    setEditMode((prev) => !prev);
                  }}
                  className="inline-flex h-7 items-center gap-1 rounded-full border border-[#D6DADE] bg-[#FFFFFF] px-2.5 text-[11px] text-[#0F1113]"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              <div className="-mx-5 overflow-x-auto px-5 pt-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div ref={detailRailRef} className="flex min-w-max gap-1.5 pb-0.5">
                  {visibleSecondaryFields.map((field) => (
                    <div
                      key={field}
                      ref={(node) => {
                        chipRefs.current[field] = node;
                      }}
                      className={`inline-flex items-center gap-1 rounded-full bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] leading-none shadow-[0_1px_0_rgba(15,17,19,0.04)] ring-1 transition-all duration-500 ${
                        highlightedFields.includes(field)
                          ? 'ring-[#0F1113] shadow-[0_0_0_3px_rgba(15,17,19,0.12)]'
                          : 'ring-[#D6DADE]'
                      }`}
                    >
                      <span className="text-[#5E6670]">{detailLabels[field]}</span>
                      <span className="font-medium text-[#0F1113]">{details[field]}</span>
                    </div>
                  ))}
                  {missingPrimaryFields.map((field) => (
                    <div
                      key={field}
                      ref={(node) => {
                        chipRefs.current[field] = node;
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border border-dashed bg-[#FAFBFC] px-2.5 py-1.5 text-[12px] leading-none transition-all duration-500 ${
                        highlightedFields.includes(field)
                          ? 'border-[#0F1113] shadow-[0_0_0_3px_rgba(15,17,19,0.12)] text-[#0F1113]'
                          : 'border-[#B0B6BE] text-[#8A919A]'
                      }`}
                    >
                      <span>{detailLabels[field]}</span>
                    </div>
                  ))}
                </div>
              </div>
              {editMode && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(Object.keys(detailLabels) as Array<keyof RequirementDetails>).map((field) => (
                    <label key={field} className="rounded-xl bg-[#FAFBFC] px-3 py-2">
                      <span className="mb-1 block text-[11px] text-[#5E6670]">{detailLabels[field]}</span>
                      <input
                        value={editingDraft[field]}
                        onChange={(e) => setEditingDraft((prev) => ({ ...prev, [field]: e.target.value }))}
                        className="h-8 w-full bg-transparent text-xs text-[#0F1113] outline-none"
                      />
                    </label>
                  ))}
                  <div className="col-span-2 flex items-center gap-2 pt-1">
                    <button type="button" onClick={saveEditingDraft} className="h-9 rounded-full bg-[#0F1113] px-4 text-sm text-white">Save</button>
                    <button type="button" onClick={() => setEditMode(false)} className="h-9 rounded-full border border-[#D6DADE] px-4 text-sm text-[#0F1113]">Cancel</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Conversation + details */}
        <div
          ref={suggestionsScrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FAFBFC]"
          style={suggestionsHeight !== null ? { height: `${suggestionsHeight}px` } : { flex: 1 }}
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-3 space-y-2.5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl bg-[#1D1E20] px-3.5 py-2.5 text-[14px] leading-5 text-white'
                    : 'mr-auto max-w-[85%] rounded-2xl border border-[#D6DADE] bg-[#FFFFFF] px-3.5 py-2.5 text-[14px] leading-5 text-[#0F1113]'
                }
              >
                {message.role === 'assistant' ? renderAssistantMessage(message.text) : message.text}
              </div>
            ))}
            {isExtracting && (
              <div className="mr-auto inline-flex items-center gap-2 rounded-2xl border border-[#D6DADE] bg-[#FFFFFF] px-3.5 py-2.5 text-[14px] text-[#0F1113]">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B525A] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B525A] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B525A] [animation-delay:300ms]" />
                </div>
                <span>Extracting details...</span>
              </div>
            )}
            {hasExtraction && isQuoteReady && (
              <div className="pt-0.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToQuotes}
                  className="h-9 rounded-full bg-[#0F1113] px-4 text-sm"
                >
                  <span className="shimmer-text">{`See ${quoteCount} Quotes`}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom input */}
        <div ref={inputBarRef} className="bg-[#FFFFFF] border-t border-[#D6DADE] px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex-shrink-0">
          {messages.length === 0 && (
            <p className="mb-1.5 text-[12px] text-[#5E6670]">
              Type naturally and we will capture important details for better quotes.
            </p>
          )}
          {(filteredSuggestions.length > 0 || guidancePrompts.length > 0) && (
            <div className="mb-1.5 rounded-[18px] border border-[#D6DADE] bg-[#F3F5F7] p-[2px] shadow-[0_1px_2px_rgba(15,17,19,0.04)]">
              <div className="overflow-hidden rounded-[16px] bg-[#FFFFFF]">
                {guidancePrompts.slice(0, 3).map((prompt, index) => (
                  <button
                    key={`${prompt.key}-${prompt.text}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleGuidancePromptClick(prompt.text)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-[14px] text-[#4B525A] transition-colors hover:bg-[#FAFBFC] ${
                      index !== guidancePrompts.slice(0, 3).length - 1 || filteredSuggestions.length > 0 ? 'border-b border-[#D6DADE]' : ''
                    }`}
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 text-[#B0B6BE] flex-shrink-0" />
                    <span className="min-w-0 whitespace-normal break-words leading-5">{prompt.text}</span>
                  </button>
                ))}
                {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={suggestion.text}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`flex w-full items-start gap-2.5 px-3 py-2 text-left text-[14px] text-[#4B525A] transition-colors hover:bg-[#FAFBFC] ${
                      index !== filteredSuggestions.slice(0, 5).length - 1 ? 'border-b border-[#D6DADE]' : ''
                    }`}
                  >
                    <Sparkles className="mt-0.5 h-4 w-4 text-[#B0B6BE] flex-shrink-0" />
                    <span className="min-w-0 whitespace-normal break-words leading-5">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {attachments.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F3F5F7] px-3 py-1.5 text-[12px] text-[#0F1113]"
                >
                  <span className="max-w-40 truncate">
                    {attachment.kind === 'image' ? 'Image' : 'File'}: {attachment.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[#5E6670]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="w-full rounded-[22px] border border-[#D6DADE] bg-[#F3F5F7] px-3 py-2.5 text-left shadow-[0_8px_24px_rgba(15,17,19,0.08)] transition-all focus-within:border-[#0F1113] focus-within:bg-[#FFFFFF] focus-within:shadow-[0_10px_26px_rgba(15,17,19,0.10)]">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFFFFF] text-[#0F1113] shadow-[0_1px_2px_rgba(15,17,19,0.06)] ring-1 ring-[#D6DADE] flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                onChange={handleFilePick}
                className="hidden"
              />
              <div className="relative min-w-0 flex-1">
                <div
                  ref={inputSizerRef}
                  className="invisible absolute left-0 top-0 -z-10 w-full whitespace-pre-wrap break-words p-0 m-0 text-[14px] leading-5"
                  aria-hidden="true"
                />
                {ghost && query.length > 0 && (
                  <div className="absolute inset-x-0 top-0 pointer-events-none z-0 whitespace-pre-wrap break-words text-[14px] leading-5">
                    <span className="text-transparent">{query}</span>
                    <span className="text-[#B0B6BE]">{ghost.slice(query.length)}</span>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  autoFocus
                  rows={1}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your car and requirement..."
                  className="relative z-10 m-0 block h-5 min-h-5 w-full resize-none overflow-hidden bg-transparent p-0 text-[14px] leading-5 text-[#0F1113] placeholder:text-[#8A919A] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!canSubmit}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform flex-shrink-0 ${
                  canSubmit
                    ? 'bg-[#0F1113] shadow-[0_8px_18px_rgba(15,17,19,0.22)] active:scale-[0.98]'
                    : 'bg-[#B0B6BE] cursor-not-allowed'
                }`}
              >
                  <SendHorizonal className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trigger mode: only show the collapsed trigger on the home page
  return (
    <div className="space-y-2.5 overflow-visible py-5">
        <div className="px-5">
          <p className="text-[16px] text-[#0F1113] font-bold mb-1.5">Tell us your requirement</p>
        </div>

        <div className="overflow-x-auto px-5 pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-max space-y-2">
            <div className="flex w-max gap-1.5">
              {popularBrands.slice(0, 3).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => openExpanded('I have a ' + brand.name + ' ')}
                  className="inline-flex w-fit items-center rounded-[999px] bg-[#FFFFFF] border border-[#D6DADE] px-2.5 py-1.5 text-left hover:border-[#B0B6BE] hover:bg-[#FAFBFC] transition-all"
                >
                  <span className="whitespace-nowrap text-[13px] text-[#4B525A]">
                    <span className="font-normal">I have a </span>
                    <span className="font-medium text-[#1D1E20]">{brand.name}</span>
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
                  className="inline-flex w-fit items-center rounded-[999px] bg-[#FFFFFF] border border-[#D6DADE] px-2.5 py-1.5 text-left hover:border-[#B0B6BE] hover:bg-[#FAFBFC] transition-all"
                >
                  <span className="whitespace-nowrap text-[13px] text-[#4B525A]">
                    <span className="font-normal">I have a </span>
                    <span className="font-medium text-[#1D1E20]">{brand.name}</span>
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
            className="w-full rounded-[18px] border border-[#D6DADE] bg-[#FFFFFF] px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(15,17,19,0.04)] transition-all hover:border-[#B0B6BE] hover:bg-[#FAFBFC]"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-5 text-[#8A919A]">
                  Write about your car and insurance requirement...
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F1113]">
                <SendHorizonal className="w-4 h-4 text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>
  );
}
