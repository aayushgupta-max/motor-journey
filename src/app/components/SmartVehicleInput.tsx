import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import TextareaAutosize from 'react-textarea-autosize';
import { SendHorizonal, Sparkles, Pencil, Check, Plus, X, ArrowRight, ChevronRight, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { PageHeaderBar } from './PageHeaderBar';
import { EditDetailsSheet } from './EditDetailsSheet';
import {
  emptyQuoteFlowDetails,
  isQuoteUnlockReady,
  shouldRequireCondition,
  mergeQuoteFlowDetails,
  getCompletedFieldCount,
  getTotalFieldCount,
  getConfidenceScore,
  getConfidenceLevel,
  type QuoteFlowDetails,
} from '../lib/quoteFlow';
import { startElevenLabsRequirementSession, type ElevenLabsRequirementSession } from '../lib/elevenLabsAgent';
import {
  carBrands,
  getYearRange,
  normalizeVehicleQuery,
  parseVehicleInput,
  modelsByBrand,
} from './vehicle-details/vehicleData';

const popularBrands = carBrands.slice(0, 6);

const exampleMessages = [
  'I want to renew my 2022 Toyota Camry insurance at a better rate',
  'I just bought a new Nissan Patrol and need comprehensive cover',
  'I want the cheapest third party for my 2019 Honda Civic',
  'I need full coverage for my BMW X5 with Oman extension',
];

const highlightKeywords = /\b(renew|comprehensive|third party|full coverage|cheapest|better rate|Oman extension)\b/gi;

function renderTypewriterText(text: string) {
  const parts = text.split(highlightKeywords);
  return parts.map((part, i) =>
    highlightKeywords.test(part)
      ? <span key={i} className="font-semibold italic text-[#5E6670]">{part}</span>
      : <span key={i}>{part}</span>
  );
}
// Progressive suggestion phases
type SuggestionPhase = 'brand' | 'model' | 'year' | 'condition' | 'done';
type CoverageType = 'Comprehensive' | 'Third Party';
type SuggestionCategory = keyof RequirementDetails;
type RequirementDetails = QuoteFlowDetails;

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

const emptyDetails: RequirementDetails = emptyQuoteFlowDetails;


const cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah'];
const nationalities = ['Indian', 'Pakistani', 'Filipino', 'Bangladeshi', 'Sri Lankan', 'Emirati', 'Egyptian', 'Jordanian', 'Lebanese', 'Syrian', 'British', 'American', 'Canadian', 'Australian', 'South African', 'Other'];
const drivingExperienceOptions = ['Less than 1 year', '1-2 years', '3-5 years', '5-8 years', '8-10 years', '10+ years'];
const accidentFreeOptions = ['Less than 6 months', '6-12 months', '1-2 years', '2-3 years', '3+ years', 'Never claimed'];
const conditionOptions = ['Brand new', 'Pre-owned'];
const coverageOptions = ['Comprehensive', 'Third Party'];
const specOptions = ['GCC', 'Non-GCC'];
const usageOptions = ['Personal', 'Commercial', 'Ride-hailing'];
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
  if (shouldRequireCondition(details.year) && !details.condition) return 'condition';
  if (!details.coverage) return 'coverage';
  if (!details.spec) return 'spec';
  return null;
}

function getQuestionCategory(
  activeQuestion: string | undefined,
  details: RequirementDetails
): SuggestionCategory | null {
  const normalizedQuestion = normalizeVehicleQuery(activeQuestion ?? '');

  if (!normalizedQuestion) return null;
  if (normalizedQuestion.includes('third party') || normalizedQuestion.includes('comprehensive')) return 'coverage';
  if (normalizedQuestion.includes('gcc')) return 'spec';
  if (normalizedQuestion.includes('brand new') || normalizedQuestion.includes('pre-owned')) return 'condition';
  if (normalizedQuestion.includes('which year')) return 'year';
  if (normalizedQuestion.includes('which make')) return 'brand';
  if (normalizedQuestion.includes('which') && normalizedQuestion.includes('model')) return 'model';
  if (normalizedQuestion.includes('registered in')) return 'city';
  if (normalizedQuestion.includes('nationality')) return 'nationality';
  if (normalizedQuestion.includes('driving experience')) return 'drivingExperience';
  if (normalizedQuestion.includes('last accident') || normalizedQuestion.includes('last accident or claim')) return 'accidentFreeMonths';
  if (normalizedQuestion.includes('date of birth')) return 'dob';
  if (normalizedQuestion.includes('full name')) return 'name';
  return getNextMissingCategory(details);
}

function isCategorySatisfied(
  category: SuggestionCategory,
  details: RequirementDetails
): boolean {
  if (category === 'condition') return Boolean(details.condition);
  if (category === 'coverage') return Boolean(details.coverage);
  if (category === 'spec') return Boolean(details.spec);
  if (category === 'city') return Boolean(details.city);
  if (category === 'nationality') return Boolean(details.nationality);
  if (category === 'drivingExperience') return Boolean(details.drivingExperience);
  if (category === 'accidentFreeMonths') return Boolean(details.accidentFreeMonths);
  if (category === 'dob') return Boolean(details.dob);
  if (category === 'name') return Boolean(details.name);
  return Boolean(details[category]);
}

function getSentenceTemplates(
  category: SuggestionCategory,
  inputText: string,
  details: RequirementDetails
): { label: string; text: string }[] {
  const prefix = getSentencePrefix(inputText);
  const remainder = getRemainderAfterPrefix(inputText);
  const fragment = normalizeVehicleQuery(getCurrentFragment(inputText));

  if (category === 'brand') {
    const brandFragment = (fragment.split(/\s+/).pop() ?? remainder.split(/\s+/)[0] ?? '').trim();
    const matchingBrands = carBrands.filter((brand) =>
      !brandFragment || brand.name.toLowerCase().startsWith(brandFragment)
    );
    return (brandFragment ? matchingBrands : carBrands).slice(0, 15).map((brand) => ({
      label: `I have ${brand.name}...`,
      text: `${prefix}${brand.name}`,
    }));
  }

  if (category === 'model' && details.brand) {
    const modelFragment = getUnmatchedModelFragment(remainder || fragment, details.brand).toLowerCase();
    const models = [...(modelsByBrand[details.brand] ?? [])]
      .filter((model) => !modelFragment || model.toLowerCase().startsWith(modelFragment))
      .reverse()
      .slice(0, 15);
    return models.map((model) => ({
      label: `...${model}`,
      text: `${prefix}${details.brand} ${model}`,
    }));
  }

  if (category === 'year' && details.brand && details.model) {
    const yearFragment = fragment.match(/(\d{0,4})$/)?.[1] ?? '';
    return [...getYearRange()]
      .reverse()
      .filter((year) => !yearFragment || String(year).startsWith(yearFragment))
      .slice(0, 10)
      .map((year) => ({
        label: `...${year} model`,
        text: `${prefix}${details.brand} ${details.model}, ${year} model`,
      }));
  }

  if (category === 'condition' && details.brand && details.model && details.year) {
    const baseText = `${prefix}${details.brand} ${details.model}, ${details.year} model`;
    return [
      { label: '...brand new', text: `${baseText}, brand new` },
      { label: '...pre-owned', text: `${baseText}, pre-owned` },
    ];
  }

  if (category === 'coverage') {
    return [
      { label: 'Third Party', text: 'My previous insurance was Third Party.' },
      { label: 'Comprehensive', text: 'My previous insurance was Comprehensive.' },
    ];
  }

  if (category === 'spec') {
    return [
      { label: 'GCC', text: 'My car is GCC spec.' },
      { label: 'Non-GCC', text: 'My car is non-GCC spec.' },
      { label: 'Imported', text: 'It is an imported car.' },
    ];
  }

  if (category === 'city') {
    return ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map((city) => ({
      label: city,
      text: `My car is registered in ${city}.`,
    }));
  }

  if (category === 'nationality') {
    return ['Indian', 'Pakistani', 'Filipino', 'Bangladeshi', 'Sri Lankan', 'Emirati', 'Egyptian', 'Jordanian', 'Lebanese', 'British', 'American', 'Canadian'].map((nat) => ({
      label: nat,
      text: `I am ${nat}.`,
    }));
  }

  if (category === 'drivingExperience') {
    return [
      { label: '< 1 year', text: 'Less than 1 year driving experience.' },
      { label: '1-2 years', text: '1-2 years driving experience.' },
      { label: '3-5 years', text: '3-5 years driving experience.' },
      { label: '5-8 years', text: '5-8 years driving experience.' },
      { label: '8-10 years', text: '8-10 years driving experience.' },
      { label: '10+ years', text: '10+ years driving experience.' },
    ];
  }

  if (category === 'accidentFreeMonths') {
    return [
      { label: 'Never claimed', text: 'I have never claimed.' },
      { label: '3+ years', text: 'No accident in 3+ years.' },
      { label: '2-3 years', text: 'No accident in 2-3 years.' },
      { label: '1-2 years', text: 'No accident in 1-2 years.' },
      { label: '6-12 months', text: 'No accident in 6-12 months.' },
      { label: '< 6 months', text: 'Less than 6 months claim-free.' },
    ];
  }

  if (category === 'expiry') {
    return [
      { label: 'Next month', text: 'My current policy expires next month.' },
      { label: 'Already expired', text: 'My current policy already expired.' },
      { label: 'This week', text: 'My renewal is due this week.' },
    ];
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
): { label: string; text: string; phase: SuggestionPhase }[] {
  const askedCategory = getQuestionCategory(activeQuestion, details);
  if (!askedCategory) return [];

  const category = isCategorySatisfied(askedCategory, details)
    ? getNextMissingCategory(details)
    : askedCategory;

  if (!category) return [];

  const nextPhase: SuggestionPhase =
    category === 'brand' || category === 'model' || category === 'year' || category === 'condition'
      ? category
      : phase;

  return getSentenceTemplates(category, inputText, details)
    .filter((template) => isSuggestionRelevant(inputText, template.text, category))
    .slice(0, 15)
    .map((t) => ({ label: t.label, text: t.text, phase: nextPhase }));
}

function extractDob(inputText: string, allowBareDate = false): string | null {
  const dobPatterns: RegExp[] = [
    /(?:born\s+(?:on\s+)?|dob[:\-\s]*|date of birth[:\-\s]*)(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[,\s]+\d{4})/i,
    /(?:born\s+(?:on\s+)?|dob[:\-\s]*|date of birth[:\-\s]*)((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?[,]?\s+\d{4})/i,
    /(?:born\s+(?:on\s+)?|dob[:\-\s]*|date of birth[:\-\s]*)(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})/i,
    /(?:born\s+(?:on\s+)?|dob[:\-\s]*|date of birth[:\-\s]*)(\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2})/i,
    /(?:born\s+(?:on\s+)?|dob[:\-\s]*|date of birth[:\-\s]*)(\d{8})\b/i,
  ];

  const bareDatePatterns: RegExp[] = [
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[,\s]+\d{4})\b/i,
    /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?[,]?\s+\d{4})\b/i,
    /\b(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\b/i,
    /\b(\d{4}[\/.\-]\d{1,2}[\/.\-]\d{1,2})\b/i,
    /\b(\d{8})\b/i,
  ];

  const match = [...dobPatterns, ...(allowBareDate ? bareDatePatterns : [])]
    .map((pattern) => inputText.match(pattern))
    .find(Boolean);

  if (!match?.[1]) return null;

  const raw = match[1].replace(/\s+/g, ' ').replace(/,\s*/g, ' ').trim();

  // Normalize to YYYY-MM-DD for EditDateField compatibility
  const monthMap: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
  };

  // "15 Mar 1990" or "15th March 1990"
  const dmy = raw.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{4})$/i);
  if (dmy) return `${dmy[3]}-${monthMap[dmy[2].toLowerCase()]}-${String(dmy[1]).padStart(2, '0')}`;

  // "Mar 15 1990" or "March 15th 1990"
  const mdy = raw.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\s+(\d{4})$/i);
  if (mdy) return `${mdy[3]}-${monthMap[mdy[1].toLowerCase()]}-${String(mdy[2]).padStart(2, '0')}`;

  // "15/03/1990" or "15-03-1990" or "15.03.1990" (DD/MM/YYYY)
  const slashDmy = raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (slashDmy) return `${slashDmy[3]}-${String(slashDmy[2]).padStart(2, '0')}-${String(slashDmy[1]).padStart(2, '0')}`;

  // "1990/03/15" or "1990-03-15" (YYYY/MM/DD)
  const isoDate = raw.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);
  if (isoDate) return `${isoDate[1]}-${String(isoDate[2]).padStart(2, '0')}-${String(isoDate[3]).padStart(2, '0')}`;

  // "15031990" (DDMMYYYY)
  const compact = raw.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (compact) return `${compact[3]}-${compact[2]}-${compact[1]}`;

  return raw;
}

function extractName(inputText: string, allowBareName = false): string | null {
  const explicitMatch = inputText.match(/(?:(?:my name is|i'?m|name[:\-]?\s*|owner name is)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/i);
  if (explicitMatch?.[1]) {
    return explicitMatch[1].trim();
  }

  if (!allowBareName) return null;

  const cleaned = inputText
    .replace(/[.,/#!$%^&*;:{}=_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  const parts = cleaned.split(' ');
  const isLikelyName =
    parts.length >= 2 &&
    parts.length <= 4 &&
    parts.every((part) => /^[A-Za-z][A-Za-z'-]*$/.test(part));

  return isLikelyName ? cleaned : null;
}

function parseDetailsFromText(
  inputText: string,
  activeQuestion?: string
): Partial<RequirementDetails> {
  const normalized = normalizeVehicleQuery(inputText);
  const parsedVehicle = parseVehicleInput(normalized);
  const lower = inputText.toLowerCase();
  const next: Partial<RequirementDetails> = {};
  const activeQuestionCategory = getQuestionCategory(activeQuestion, emptyDetails);

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

  // ── Personal details extraction ──
  const foundNationality = nationalities.find((n) => lower.includes(n.toLowerCase()));
  if (foundNationality) next.nationality = foundNationality;

  const name = extractName(inputText, activeQuestionCategory === 'name');
  if (name) next.name = name;

  const dob = extractDob(inputText, activeQuestionCategory === 'dob');
  if (dob) next.dob = dob;

  // Driving experience: "X years driving" or "driving for X years"
  const expMatch = inputText.match(/(?:driving\s+(?:for\s+)?|experience[:\-]?\s*)(\d+)\s*(?:\+\s*)?years?/i)
    ?? inputText.match(/(\d+)\s*(?:\+\s*)?years?\s+(?:of\s+)?(?:driving|experience)/i);
  if (expMatch?.[1]) {
    const years = parseInt(expMatch[1], 10);
    if (years < 1) next.drivingExperience = 'Less than 1 year';
    else if (years <= 2) next.drivingExperience = '1-2 years';
    else if (years <= 5) next.drivingExperience = '3-5 years';
    else if (years <= 8) next.drivingExperience = '5-8 years';
    else if (years <= 10) next.drivingExperience = '8-10 years';
    else next.drivingExperience = '10+ years';
  }

  // Accident-free / claims: "never claimed", "no accidents in X years", etc.
  if (/\b(never claimed|no claims?|claim[- ]?free|never had an? (?:accident|claim))\b/i.test(inputText)) {
    next.accidentFreeMonths = 'Never claimed';
  } else if (/\b(no accident|accident[- ]?free)\b/i.test(inputText)) {
    const claimPeriod = inputText.match(/(\d+)\s*(?:\+\s*)?years?\s+(?:no accident|accident[- ]?free|without|claim[- ]?free)/i)
      ?? inputText.match(/(?:no accident|accident[- ]?free|without|claim[- ]?free)\s+(?:for\s+)?(\d+)\s*(?:\+\s*)?years?/i);
    if (claimPeriod?.[1]) {
      const yrs = parseInt(claimPeriod[1], 10);
      if (yrs >= 3) next.accidentFreeMonths = '3+ years';
      else if (yrs >= 2) next.accidentFreeMonths = '2-3 years';
      else if (yrs >= 1) next.accidentFreeMonths = '1-2 years';
      else next.accidentFreeMonths = '6-12 months';
    } else {
      next.accidentFreeMonths = '3+ years';
    }
  }

  // Mobile number: +971 or 05X patterns
  const phoneMatch = inputText.match(/(\+971\s*5\d[\s\-]?\d{3}[\s\-]?\d{4}|05\d[\s\-]?\d{3}[\s\-]?\d{4})/);
  if (phoneMatch?.[1]) next.mobileNumber = phoneMatch[1].replace(/[\s\-]/g, '');

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

function getGuidancePrompts(
  details: RequirementDetails,
  inputText: string,
  activeQuestion?: string,
  shouldAskRefineChoice = false
): Array<{ key: keyof RequirementDetails; text: string }> {
  if (!hasVehicleCore(details)) return [];
  if (!activeQuestion) return [];
  if (!hasCompletedSentence(inputText) && inputText.trim().length > 0) return [];

  const prompts: Array<{ key: keyof RequirementDetails; text: string }> = [];
  if (shouldAskRefineChoice) {
    prompts.push({ key: 'coverage', text: 'Yes, ask and improve confidence!' });
    return prompts;
  }

  const questionCategory = getQuestionCategory(activeQuestion, details);

  if (!questionCategory) return prompts;

  if (questionCategory === 'condition' && !details.condition && shouldRequireCondition(details.year)) {
    prompts.push({ key: 'condition', text: 'It\'s brand new' });
    prompts.push({ key: 'condition', text: 'It\'s pre-owned' });
    return prompts;
  }

  if (questionCategory === 'coverage' && !details.coverage) {
    prompts.push({ key: 'coverage', text: 'It was comprehensive' });
    prompts.push({ key: 'coverage', text: 'It was third party' });
    return prompts;
  }

  if (questionCategory === 'spec' && !details.spec) {
    prompts.push({ key: 'spec', text: 'It\'s GCC spec' });
    prompts.push({ key: 'spec', text: 'It\'s non-GCC' });
    return prompts;
  }

  if (questionCategory === 'city' && !details.city) {
    prompts.push({ key: 'city', text: 'Registered in Dubai' });
    prompts.push({ key: 'city', text: 'Registered in Abu Dhabi' });
    prompts.push({ key: 'city', text: 'Registered in Sharjah' });
    return prompts;
  }

  if (questionCategory === 'nationality' && !details.nationality) {
    prompts.push({ key: 'nationality', text: 'I am Indian' });
    prompts.push({ key: 'nationality', text: 'I am Pakistani' });
    prompts.push({ key: 'nationality', text: 'I am Filipino' });
    prompts.push({ key: 'nationality', text: 'I am Bangladeshi' });
    prompts.push({ key: 'nationality', text: 'I am Sri Lankan' });
    prompts.push({ key: 'nationality', text: 'I am Emirati' });
    prompts.push({ key: 'nationality', text: 'I am Egyptian' });
    prompts.push({ key: 'nationality', text: 'I am Jordanian' });
    prompts.push({ key: 'nationality', text: 'I am Lebanese' });
    prompts.push({ key: 'nationality', text: 'I am British' });
    prompts.push({ key: 'nationality', text: 'I am American' });
    return prompts;
  }

  if (questionCategory === 'drivingExperience' && !details.drivingExperience) {
    prompts.push({ key: 'drivingExperience', text: '3-5 years driving' });
    prompts.push({ key: 'drivingExperience', text: '5-8 years driving' });
    prompts.push({ key: 'drivingExperience', text: '10+ years driving' });
    return prompts;
  }

  if (questionCategory === 'accidentFreeMonths' && !details.accidentFreeMonths) {
    prompts.push({ key: 'accidentFreeMonths', text: 'Never claimed' });
    prompts.push({ key: 'accidentFreeMonths', text: 'No accident in 3+ years' });
    prompts.push({ key: 'accidentFreeMonths', text: 'No accident in 2-3 years' });
    prompts.push({ key: 'accidentFreeMonths', text: 'No accident in 1-2 years' });
    prompts.push({ key: 'accidentFreeMonths', text: 'No accident in 6-12 months' });
    prompts.push({ key: 'accidentFreeMonths', text: 'Less than 6 months claim-free' });
    return prompts;
  }

  return prompts;
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
  if (details.expiry) count += 1;

  return Math.max(0, Math.min(28, count));
}

function renderAssistantMessage(text: string) {
  const [intro, emphasis, ...rest] = text.split('\n');

  if (!emphasis) {
    return <p className="text-[14px] leading-5">{text}</p>;
  }

  return (
    <div className="space-y-1">
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

function sanitizeAssistantQuestion(
  assistantText: string,
  details: RequirementDetails
): string {
  const trimmed = assistantText.trim();
  if (!trimmed) return trimmed;

  const nextMissing = getNextMissingCategory(details);
  const askedCategory = getQuestionCategory(trimmed, details);

  if (!nextMissing) return trimmed;

  const asksModel = askedCategory === 'model' || /which\s+.*model/i.test(trimmed);
  const asksYear = askedCategory === 'year' || /which\s+.*year/i.test(trimmed);
  const mentionsKnownBrand = carBrands.some((brand) =>
    new RegExp(`\\b${brand.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(trimmed)
  );

  if (nextMissing === 'brand' && (asksModel || asksYear || mentionsKnownBrand)) {
    return 'Which make is your car?';
  }

  if (nextMissing === 'model' && asksYear) {
    return 'Which model do you have?';
  }

  return trimmed;
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
  const { isLoggedIn } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const previousDetailsRef = useRef<RequirementDetails>(emptyDetails);
  const elevenLabsSessionRef = useRef<ElevenLabsRequirementSession | null>(null);
  const hasUserSentMessageRef = useRef(false);
  const welcomeReceivedRef = useRef(false);
  const welcomeTextRef = useRef('');
  const [expanded, setExpanded] = useState(false);
  const [twMsgIdx, setTwMsgIdx] = useState(0);
  const [twCharIdx, setTwCharIdx] = useState(0);
  const [twPhase, setTwPhase] = useState<'typing' | 'pausing' | 'clearing'>('typing');
  const [exampleIdx, setExampleIdx] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [suggestionsHeight, setSuggestionsHeight] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SuggestionPhase>('brand');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [details, setDetails] = useState<RequirementDetails>(emptyDetails);
  const [editMode, setEditMode] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [welcomeAssistantText, setWelcomeAssistantText] = useState('');
  const extractionTimerRef = useRef<number | null>(null);
  const didInitPageMode = useRef(false);

  // Set mobile number when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    setDetails((prev) => (prev.mobileNumber ? prev : { ...prev, mobileNumber: '+971 50 123 4567' }));
  }, [isLoggedIn]);

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
  }, [mode, initialQueryProp]);

  // Auto-focus textarea when page mode mounts
  // Safari won't open keyboard from programmatic focus without a user gesture,
  // so we use the readonly trick: set readonly, focus (moves cursor without keyboard),
  // then remove readonly which triggers keyboard on some Safari versions.
  // As a fallback, the input area is visually prominent to invite a tap.
  useEffect(() => {
    if (mode !== 'page') return;
    const timer = setTimeout(() => {
      const input = inputRef.current;
      if (!input) return;
      input.setAttribute('readonly', 'readonly');
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
      requestAnimationFrame(() => {
        input.removeAttribute('readonly');
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'page') return;
    let disposed = false;

    const initSession = async () => {
      const session = await startElevenLabsRequirementSession({
        onTurn: (turn) => {
          if (disposed) return;
          const extracted: Partial<RequirementDetails> = turn.extracted ?? {};
          const nextDetails = mergeDetails(previousDetailsRef.current, extracted);
          previousDetailsRef.current = nextDetails;
          setDetails(nextDetails);

          const assistantText = (turn.assistantMessage ?? '').trim();
          if (assistantText) {
            const safeAssistantText = sanitizeAssistantQuestion(assistantText, nextDetails);
            // First assistant message always goes to welcome card only
            if (!welcomeReceivedRef.current) {
              welcomeReceivedRef.current = true;
              welcomeTextRef.current = safeAssistantText;
              setWelcomeAssistantText(safeAssistantText);
              setIsExtracting(false);
              return;
            }
            // Skip if it's the same as the welcome message (agent repeating itself)
            if (safeAssistantText === welcomeTextRef.current) {
              setIsExtracting(false);
              return;
            }
            setMessages((prev) => [
              ...prev,
              { id: Date.now() + Math.floor(Math.random() * 1000), text: safeAssistantText, role: 'assistant' },
            ]);
          }
          setIsExtracting(false);
        },
        onError: () => {
          if (disposed) return;
          // Keep loader visible; reconnect may still deliver the pending response.
        },
      });
      if (disposed) {
        session?.close();
        return;
      }
      elevenLabsSessionRef.current = session;
    };

    initSession();

    return () => {
      disposed = true;
      elevenLabsSessionRef.current?.close();
      elevenLabsSessionRef.current = null;
    };
  }, [mode]);

  const latestAssistantQuestion = [...messages].reverse().find((message) => message.role === 'assistant')?.text;
  const welcomeLeadText = welcomeAssistantText;
  const chatMessages = messages;
  const quoteCount = getEstimatedQuoteCount(details);
  const shouldAskRefineChoice = false;
  const visibleSystemQuestion = latestAssistantQuestion;
  const normalizedQuery = normalizeVehicleQuery(query);
  const ghost = null;
  const guidancePrompts: Array<{ key: keyof RequirementDetails; text: string }> = [];
  const isQuoteReady = isQuoteUnlockReady(details);
  const answeredCount = getCompletedFieldCount(details, isLoggedIn);
  const totalQuestions = getTotalFieldCount(details);
  const confidencePct = getConfidenceScore(details, isLoggedIn);
  const canSubmit = Boolean((query.trim() || attachments.length > 0) && welcomeLeadText);
  const hasExtraction = messages.length > 0 || Object.values(details).some(Boolean);

  const filteredSuggestions: Array<{ label: string; text: string; phase: SuggestionPhase }> = [];

  // Debug: log state machine on meaningful changes
  useEffect(() => {
    console.log('[StateMachine]', {
      phase,
      isExtracting,
      shouldAskRefineChoice,
      isQuoteReady,
      messagesCount: messages.length,
      visibleQuestion: visibleSystemQuestion?.slice(0, 60),
      questionCategory: visibleSystemQuestion ? getQuestionCategory(visibleSystemQuestion, details) : null,
      nextMissing: getNextMissingCategory(details),
      guidanceCount: guidancePrompts.length,
      suggestionCount: filteredSuggestions.length,
      details: Object.fromEntries(Object.entries(details).filter(([, v]) => v)),
    });
  }, [phase, isExtracting, shouldAskRefineChoice, isQuoteReady, messages.length]);

  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typewriterFill = (text: string, callback?: () => void) => {
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    // Find common prefix to only animate the new portion
    const current = query;
    let prefixLen = 0;
    while (prefixLen < current.length && prefixLen < text.length && current[prefixLen] === text[prefixLen]) {
      prefixLen++;
    }
    let i = prefixLen;
    setQuery(text.slice(0, i));
    const step = () => {
      i++;
      setQuery(text.slice(0, i));
      if (i < text.length) {
        typewriterRef.current = setTimeout(step, 8);
      } else {
        typewriterRef.current = null;
        callback?.();
      }
    };
    if (i < text.length) {
      typewriterRef.current = setTimeout(step, 8);
    } else {
      callback?.();
    }
  };

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
  }, [expanded]);

  useEffect(() => {
    return () => {
      if (extractionTimerRef.current) {
        window.clearTimeout(extractionTimerRef.current);
      }
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, []);

  useEffect(() => {
    previousDetailsRef.current = details;
  }, [details]);

  useEffect(() => {
    if (!expanded) return;

    const viewport = window.visualViewport;

    const syncViewportHeight = () => {
      setViewportHeight(viewport?.height ?? window.innerHeight);
      // After Safari resizes for keyboard, ensure input stays visible
      requestAnimationFrame(() => {
        inputBarRef.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
      });
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
      const inputHeight = inputBarRef.current?.offsetHeight ?? 0;
      const nextHeight = Math.max(0, Math.floor(availableHeight - headerHeight - inputHeight));
      setSuggestionsHeight(nextHeight);
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    if (headerRef.current) resizeObserver.observe(headerRef.current);
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
    setIsExtracting(false);
    setAttachments([]);
    setWelcomeAssistantText('');
    hasUserSentMessageRef.current = false;
    navigate('/');
    if (extractionTimerRef.current) {
      window.clearTimeout(extractionTimerRef.current);
      extractionTimerRef.current = null;
    }
    elevenLabsSessionRef.current?.close();
    elevenLabsSessionRef.current = null;
    previousDetailsRef.current = emptyDetails;
  };

  const handleSuggestionClick = (suggestion: { text: string; label: string; phase: SuggestionPhase }) => {
    // Follow-up questions: just fill the short answer, don't rebuild the full sentence
    if (messages.length > 0) {
      const shortText = suggestion.label.replace(/^\.\.\./, '').trim();
      const current = query.trim();
      typewriterFill(current ? `${current}, ${shortText}` : shortText);
      setPhase('done');
      return;
    }

    const shouldAppend = Boolean(
      query.trim() &&
      hasCompletedSentence(query) &&
      !normalizeVehicleQuery(suggestion.text).startsWith(normalizeVehicleQuery(query))
    );
    const nextText = shouldAppend ? `${query.trim()} ${suggestion.text}` : suggestion.text;

    if (suggestion.phase === 'brand') {
      setPhase('model');
      typewriterFill(nextText + ' ');
    } else if (suggestion.phase === 'model') {
      setPhase('year');
      typewriterFill(nextText + ' ');
    } else if (suggestion.phase === 'year') {
      const parsed = parseVehicleInput(nextText);
      if (parsed?.year && shouldRequireCondition(parsed.year)) {
        setPhase('condition');
        typewriterFill(nextText + ' ');
      } else {
        typewriterFill(nextText);
        setPhase('done');
        return;
      }
    } else if (suggestion.phase === 'condition') {
      typewriterFill(nextText);
      setPhase('done');
      return;
    } else {
      typewriterFill(nextText + ' ');
      setPhase(phase);
      return;
    }

  };

  const handleSubmit = async (text?: string) => {
    const input = text || query;
    if (!input.trim() && attachments.length === 0) return;
    if (!welcomeReceivedRef.current) return;
    hasUserSentMessageRef.current = true;

    const currentAttachments = [...attachments];

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: input.trim() || `Added ${currentAttachments.length} attachment${currentAttachments.length > 1 ? 's' : ''}.`,
        role: 'user',
      },
    ]);
    setQuery('');
    setAttachments([]);
    setIsExtracting(true);
    inputRef.current?.blur();

    const sent = elevenLabsSessionRef.current?.sendUserMessage(input) ?? false;
    if (!sent) {
      setIsExtracting(false);
    }
    setPhase('done');
  };

  const handleGuidancePromptClick = (text: string) => {
    typewriterFill(text);
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
    if (parsed?.brand && parsed?.model && parsed?.year && (parsed?.isBrandNew !== undefined || !shouldRequireCondition(parsed.year))) {
      setPhase('done');
    } else if (parsed?.brand && parsed?.model && parsed?.year && shouldRequireCondition(parsed.year)) {
      setPhase('condition');
    } else if (parsed?.brand && parsed?.model) {
      setPhase('year');
    } else if (parsed?.brand) {
      setPhase('model');
    } else {
      setPhase('brand');
    }
  };

  // Typewriter effect for placeholder examples
  useEffect(() => {
    const msg = exampleMessages[twMsgIdx];
    if (twPhase === 'typing') {
      if (twCharIdx < msg.length) {
        const t = setTimeout(() => setTwCharIdx((c) => c + 1), 40);
        return () => clearTimeout(t);
      }
      // Done typing — pause
      setTwPhase('pausing');
    } else if (twPhase === 'pausing') {
      const t = setTimeout(() => setTwPhase('clearing'), 2000);
      return () => clearTimeout(t);
    } else if (twPhase === 'clearing') {
      if (twCharIdx > 0) {
        const t = setTimeout(() => setTwCharIdx((c) => c - 1), 20);
        return () => clearTimeout(t);
      }
      // Cleared — next message
      setTwMsgIdx((i) => (i + 1) % exampleMessages.length);
      setTwPhase('typing');
    }
  }, [twCharIdx, twPhase, twMsgIdx]);

  // Cycle example messages for page-mode fade animation
  useEffect(() => {
    const timer = setInterval(() => setExampleIdx((i) => (i + 1) % exampleMessages.length), 3000);
    return () => clearInterval(timer);
  }, []);

  // Page mode: render the expanded UI as a full-screen page (no overlay, no home behind)
  if (mode === 'page') {
    return (
      <div
        ref={overlayRef}
        className="flex w-full flex-col bg-white overscroll-none"
        style={{
          height: viewportHeight ? `${viewportHeight}px` : '100dvh',
        }}
      >
        {/* Header */}
        <div ref={headerRef} className="pt-[env(safe-area-inset-top)]">
          <PageHeaderBar
            title="Your requirements"
            subtitle="Tell us about your car in detail"
            onBack={closeExpanded}
            rightSlot={hasExtraction ? (
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ duration: 0.3 }}
                key={answeredCount}
                className="relative rounded-full p-[2px]"
                style={{
                  background: `conic-gradient(${getConfidenceLevel(confidencePct).color} ${confidencePct}%, #D6DADE 0%)`,
                }}
              >
                <div className={`flex items-center gap-1.5 rounded-full px-1 py-1 ${isQuoteReady ? 'bg-[#FAFBFC]' : 'bg-[#F3F5F7]'}`}>
                  <ClipboardList className={`w-3 h-3 ${isQuoteReady ? 'text-[#0F1113]' : 'text-[#5E6670]'}`} />
                  <span className={`text-[10px] whitespace-nowrap ${isQuoteReady ? 'text-[#0F1113]' : 'text-[#5E6670]'}`}>{answeredCount}/{totalQuestions}</span>
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F1113]/10"
                  >
                    <Pencil className="w-2.5 h-2.5 text-[#0F1113]" />
                  </button>
                </div>
              </motion.div>
            ) : undefined}
          />
        </div>
        <EditDetailsSheet
          open={editMode}
          onOpenChange={setEditMode}
          details={details}
          onSave={(updated) => setDetails(updated)}
        />

        {/* Conversation + details */}
        <div
          ref={suggestionsScrollRef}
          data-scroll-area
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#FAFBFC] [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain] [touch-action:pan-y]"
        >
          <div className="mx-auto w-full max-w-5xl px-5 py-3 space-y-2.5">
            {/* Welcome message — shown once ElevenLabs first message arrives */}
            {welcomeLeadText ? (
              <div className="mr-auto max-w-[85%] rounded-2xl bg-[#E5E7EB] p-1 text-[14px] leading-5 text-[#0F1113]">
                <div className="rounded-[12px] bg-[#FFFFFF] px-3.5 py-2.5 space-y-1.5">
                  <p className="text-[14px] leading-5">Welcome to Policybazaar.ae</p>
                  <p className="text-[14px] font-semibold leading-5 text-[#0F1113] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{welcomeLeadText}</p>
                </div>
                <div className="px-2.5 pt-1.5 pb-1.5 overflow-hidden">
                  <div className="min-h-[18px]">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={exampleIdx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="text-[12px] leading-[1.5] text-[#5E6670] font-medium"
                      >
                        <span className="font-medium text-[#8A919A] uppercase tracking-wide text-[10px]">TRY </span>
                        &ldquo;{exampleMessages[exampleIdx]}&rdquo;
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mr-auto max-w-[85%] flex items-center gap-2 px-3.5 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#B0B6BE] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-[#B0B6BE] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-[#B0B6BE] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl bg-[#D6DADE] px-3.5 py-2.5 text-[14px] leading-5 text-[#0F1113] whitespace-pre-wrap break-words [overflow-wrap:anywhere]'
                    : 'mr-auto max-w-[85%] rounded-2xl border border-[#D6DADE] bg-[#FFFFFF] px-3.5 py-2.5 text-[14px] leading-5 text-[#0F1113] whitespace-pre-wrap break-words [overflow-wrap:anywhere]'
                }
              >
                {message.role === 'assistant' ? renderAssistantMessage(message.text) : message.text}
              </div>
            ))}
            {isExtracting && (
              <div className="mr-auto inline-flex items-center rounded-2xl border border-[#D6DADE] bg-[#FFFFFF] px-3.5 py-2.5">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B525A] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B525A] [animation-delay:180ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4B525A] [animation-delay:360ms]" />
                </div>
              </div>
            )}
            {hasExtraction && isQuoteReady && !isExtracting && (
              <div className="-mt-1 flex flex-col items-start gap-1.5">
                <button
                  type="button"
                  onClick={goToQuotes}
                  className="inline-flex items-center gap-2 h-8 rounded-full bg-[#0F1113] px-4 text-[14px]"
                >
                  <span className="shimmer-text">
                    {`Show ${quoteCount} Quotes`}
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/70" />
                </button>
                {confidencePct < 100 && (() => {
                  const level = getConfidenceLevel(confidencePct);
                  return (
                    <div className="flex items-center gap-1.5 pl-1">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: level.color }} />
                      <span className="text-[11px] text-[#8A919A]">
                        <strong className="font-semibold text-[#5E6670]">{confidencePct}% confidence</strong> — {level.message.toLowerCase()}
                      </span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Bottom input */}
        <div ref={inputBarRef} className="bg-[#F3F5F7] border-t border-[#D6DADE] px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex-shrink-0">
          <p className="mb-1.5 text-[10px] text-[#5E6670] text-center">
            Type naturally and we will capture important details.
          </p>
          {!isExtracting && !guidancePrompts.some((p) => p.text === query.trim()) && (filteredSuggestions.length > 0 || guidancePrompts.length > 0 || shouldAskRefineChoice) && (
            <div data-chips-scroll className="mb-1.5 -mx-5 overflow-x-auto px-5 py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [animation:chipsFadeIn_0.3s_ease-out]">
              <div className="w-max space-y-2">
                <div className="flex w-max gap-2">
              {guidancePrompts.map((prompt) => (
                <button
                  key={`${prompt.key}-${prompt.text}`}
                  onClick={() => handleGuidancePromptClick(prompt.text)}
                  className="inline-flex flex-shrink-0 items-center rounded-[999px] border border-[#D6DADE] bg-[#FFFFFF] px-2.5 py-1.5 text-[13px] text-[#4B525A] transition-all hover:border-[#B0B6BE] hover:bg-[#FAFBFC] active:scale-[0.97]"
                >
                  <span className="whitespace-nowrap">{prompt.text}</span>
                </button>
              ))}
              {shouldAskRefineChoice && !isExtracting && (
                <button
                  onClick={goToQuotes}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-[999px] bg-[#F3F5F7] px-2.5 py-1.5 text-[13px] font-medium text-[#0F1113] transition-all hover:bg-[#E8EAED] active:scale-[0.97]"
                >
                  <span className="whitespace-nowrap">{`See ${quoteCount} quotes`}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#5E6670]" />
                </button>
              )}
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="inline-flex flex-shrink-0 items-center rounded-[999px] border border-[#D6DADE] bg-[#FFFFFF] px-2.5 py-1.5 text-[13px] text-[#4B525A] transition-all hover:border-[#B0B6BE] hover:bg-[#FAFBFC] active:scale-[0.97]"
                >
                  <span className="whitespace-nowrap">{messages.length > 0 ? suggestion.label.replace(/^\.\.\./, '') : suggestion.label}</span>
                </button>
              ))}
                </div>
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
          <div className="w-full rounded-[22px] border border-[#D6DADE] bg-[#F3F5F7] px-3 py-2.5 text-left shadow-[0_8px_24px_rgba(15,17,19,0.08)] transition-all focus-within:border-[#0F1113] focus-within:bg-[#FFFFFF] focus-within:shadow-[0_10px_26px_rgba(15,17,19,0.10)] [touch-action:manipulation]">
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
                {ghost && query.length > 0 && (
                  <div className="absolute inset-x-0 top-0 pointer-events-none z-0 whitespace-nowrap overflow-hidden text-ellipsis text-[14px] leading-5">
                    <span className="text-transparent">{query}</span>
                    <span className="text-[#B0B6BE]">{ghost.slice(query.length)}</span>
                  </div>
                )}
                <TextareaAutosize
                  ref={inputRef}
                  autoFocus={!!welcomeLeadText}
                  inputMode="text"
                  minRows={1}
                  maxRows={5}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!welcomeLeadText}
                  onFocus={() => {
                    // On Safari, scroll chat to bottom + input into view when keyboard opens
                    setTimeout(() => {
                      if (suggestionsScrollRef.current) {
                        suggestionsScrollRef.current.scrollTop = suggestionsScrollRef.current.scrollHeight;
                      }
                      inputBarRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
                    }, 300);
                  }}
                  placeholder={welcomeLeadText ? "Describe your car and requirement..." : "Connecting..."}
                  className="relative z-10 m-0 block w-full resize-none bg-transparent p-0 text-[14px] leading-5 text-[#0F1113] placeholder:text-[#8A919A] outline-none"
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

  // (cycling effect moved above page-mode return)

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
                  className="inline-flex w-fit items-center rounded-[999px] bg-[#FFFFFF] px-2.5 py-1.5 text-left hover:bg-[#F3F5F7] transition-all"
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
                  className="inline-flex w-fit items-center rounded-[999px] bg-[#FFFFFF] px-2.5 py-1.5 text-left hover:bg-[#F3F5F7] transition-all"
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

        {/* Input with typewriter placeholder */}
        <div className="px-5">
          <button
            onClick={() => openExpanded()}
            className="w-full rounded-[16px] bg-[#FFFFFF] border border-[#D6DADE] p-4 text-left transition-all hover:bg-[#FAFBFC] shadow-[0_2px_8px_rgba(15,17,19,0.06)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] leading-[20px] text-[#8A919A] h-[40px] overflow-hidden">
                  {renderTypewriterText(exampleMessages[twMsgIdx].slice(0, twCharIdx))}
                  <span className="inline-block w-[1.5px] h-[13px] bg-[#8A919A] align-middle ml-px animate-pulse" />
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1113] flex-shrink-0">
                <SendHorizonal className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </button>
        </div>
      </div>
  );
}
