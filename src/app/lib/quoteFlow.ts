export type QuoteFlowDetails = {
  brand: string;
  model: string;
  year: string;
  condition: string;
  coverage: string;
  spec: string;
  city: string;
  expiry: string;
  usage: string;
  budget: string;
  name: string;
  dob: string;
  nationality: string;
  drivingExperience: string;
  accidentFreeMonths: string;
  noClaimProof: string;
  mobileNumber: string;
  mulkiyaUploaded: boolean;
  dlUploaded: boolean;
};

export const emptyQuoteFlowDetails: QuoteFlowDetails = {
  brand: '',
  model: '',
  year: '',
  condition: '',
  coverage: '',
  spec: '',
  city: '',
  expiry: '',
  usage: '',
  budget: '',
  name: '',
  dob: '',
  nationality: '',
  drivingExperience: '',
  accidentFreeMonths: '',
  noClaimProof: '',
  mobileNumber: '',
  mulkiyaUploaded: false,
  dlUploaded: false,
};

export type QuoteFlowAction =
  | 'spec'
  | 'coverage'
  | 'mulkiyaUpload'
  | 'dlUpload'
  | 'accidentFreeMonths'
  | 'noClaimProof'
  | 'done';

type FlowField = {
  key: keyof QuoteFlowDetails;
  weight: number;
  isComplete: (details: QuoteFlowDetails, isLoggedIn?: boolean) => boolean;
};

export function mergeQuoteFlowDetails(
  prev: QuoteFlowDetails,
  next: Partial<QuoteFlowDetails>
): QuoteFlowDetails {
  return {
    ...prev,
    ...Object.fromEntries(
      Object.entries(next).filter(([, value]) => value !== undefined && value !== null)
    ),
  } as QuoteFlowDetails;
}

export function shouldRequireCondition(yearValue: string | number): boolean {
  const year = Number(yearValue);
  if (!year) return false;
  const currentYear = new Date().getFullYear();
  return year === currentYear || year === currentYear - 1;
}

export function isQuoteUnlockReady(details: QuoteFlowDetails): boolean {
  if (!details.brand || !details.model || !details.year) return false;
  if (shouldRequireCondition(details.year) && !details.condition) return false;
  return true;
}

const weightedFields: FlowField[] = [
  { key: 'brand', weight: 12, isComplete: (details) => Boolean(details.brand) },
  { key: 'model', weight: 12, isComplete: (details) => Boolean(details.model) },
  { key: 'year', weight: 12, isComplete: (details) => Boolean(details.year) },
  { key: 'coverage', weight: 10, isComplete: (details) => Boolean(details.coverage) },
  { key: 'spec', weight: 8, isComplete: (details) => Boolean(details.spec) },
  { key: 'city', weight: 6, isComplete: (details) => Boolean(details.city) },
  { key: 'expiry', weight: 6, isComplete: (details) => Boolean(details.expiry) },
  { key: 'nationality', weight: 4, isComplete: (details) => Boolean(details.nationality) },
  { key: 'dob', weight: 5, isComplete: (details) => Boolean(details.dob) },
  {
    key: 'drivingExperience',
    weight: 5,
    isComplete: (details) => Boolean(details.drivingExperience),
  },
  {
    key: 'accidentFreeMonths',
    weight: 6,
    isComplete: (details) => Boolean(details.accidentFreeMonths),
  },
  {
    key: 'noClaimProof',
    weight: 3,
    isComplete: (details) =>
      details.accidentFreeMonths !== 'Never claimed' || Boolean(details.noClaimProof),
  },
  {
    key: 'mobileNumber',
    weight: 3,
    isComplete: (details, isLoggedIn) => Boolean(details.mobileNumber || isLoggedIn),
  },
];

export function getConfidenceScore(
  details: QuoteFlowDetails,
  isLoggedIn = false
): number {
  const earned = weightedFields.reduce(
    (sum, field) => sum + (field.isComplete(details, isLoggedIn) ? field.weight : 0),
    0
  );
  const totalWeight = weightedFields.reduce((sum, field) => sum + field.weight, 0);
  if (!totalWeight) return 0;
  return Math.max(0, Math.min(100, Math.round((earned / totalWeight) * 100)));
}

export function getCompletedFieldCount(
  details: QuoteFlowDetails,
  isLoggedIn = false
): number {
  return weightedFields.filter((field) => field.isComplete(details, isLoggedIn)).length;
}

export function getTotalFieldCount(): number {
  return weightedFields.length;
}

export function getPendingQuoteActions(
  details: QuoteFlowDetails,
  isLoggedIn = false
): QuoteFlowAction[] {
  const pending: QuoteFlowAction[] = [];

  if (!details.spec) pending.push('spec');
  if (!details.coverage) pending.push('coverage');
  if (!details.mulkiyaUploaded) pending.push('mulkiyaUpload');
  if (!details.dlUploaded) pending.push('dlUpload');
  if (!details.accidentFreeMonths) pending.push('accidentFreeMonths');
  if (details.accidentFreeMonths === 'Never claimed' && !details.noClaimProof) {
    pending.push('noClaimProof');
  }

  return pending;
}

export function getNextQuotesAction(
  details: QuoteFlowDetails,
  isLoggedIn = false
): QuoteFlowAction {
  return getPendingQuoteActions(details, isLoggedIn)[0] ?? 'done';
}

export function applyMockMulkiyaExtraction(
  details: QuoteFlowDetails
): Partial<QuoteFlowDetails> {
  const currentYear = new Date().getFullYear();
  return {
    mulkiyaUploaded: true,
    brand: details.brand || 'Toyota',
    model: details.model || 'Camry',
    year: details.year || String(currentYear - 1),
    city: details.city || 'Dubai',
    expiry: details.expiry || 'Active until next month',
    nationality: details.nationality || 'Indian',
  };
}

export function applyMockDlExtraction(
  details: QuoteFlowDetails
): Partial<QuoteFlowDetails> {
  return {
    dlUploaded: true,
    dob: details.dob || '12 Mar 1994',
    drivingExperience: details.drivingExperience || '8 years',
  };
}

export function buildVehicleSubtitle(details: QuoteFlowDetails): string {
  const summary = [details.brand, details.model, details.year].filter(Boolean).join(' ');
  return [summary, details.city].filter(Boolean).join(' · ') || 'Complete your details for better matching';
}
