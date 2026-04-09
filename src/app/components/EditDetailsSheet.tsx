import { useState, useEffect, useRef } from 'react';
import { Car, UserRound, ChevronDown } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import {
  shouldRequireCondition,
  getVisibleCarFields,
  getVisiblePersonalFields,
  countFilledFields,
  type QuoteFlowDetails,
} from '../lib/quoteFlow';
import {
  carBrands,
  getYearRange,
  modelsByBrand,
} from './vehicle-details/vehicleData';

const cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Umm Al Quwain', 'Fujairah'];
const nationalities = ['Indian', 'Pakistani', 'Filipino', 'Bangladeshi', 'Sri Lankan', 'Emirati', 'Egyptian', 'Jordanian', 'Lebanese', 'Syrian', 'British', 'American', 'Canadian', 'Australian', 'South African', 'Other'];
const drivingExperienceOptions = ['Less than 1 year', '1-2 years', '3-5 years', '5-8 years', '8-10 years', '10+ years'];
const accidentFreeOptions = ['Less than 6 months', '6-12 months', '1-2 years', '2-3 years', '3+ years', 'Never claimed'];
const conditionOptions = ['Brand new', 'Pre-owned'];
const coverageOptions = ['Comprehensive', 'Third Party'];
const specOptions = ['GCC', 'Non-GCC'];

/* ── Field components ──────────────────────────────────────── */

function EditSelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Select',
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`relative block rounded-xl border bg-[#FAFBFC] px-4 py-2.5 transition-colors ${
      value ? 'border-[#D6DADE]' : 'border-[#E8EAED]'
    } ${disabled ? 'opacity-40' : ''}`}>
      <span className="block text-[11px] text-[#5E6670] leading-none mb-1">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-transparent text-[14px] text-[#0F1113] outline-none appearance-none cursor-pointer disabled:cursor-not-allowed pr-6"
          style={{ color: value ? '#0F1113' : '#B0B6BE' }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-[#B0B6BE] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </label>
  );
}

function EditTextField({
  label,
  value,
  onChange,
  placeholder = '—',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
}) {
  return (
    <label className={`relative block rounded-xl border bg-[#FAFBFC] px-4 py-2.5 transition-colors ${
      value ? 'border-[#D6DADE]' : 'border-[#E8EAED]'
    }`}>
      <span className="block text-[11px] text-[#5E6670] leading-none mb-1">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full bg-transparent text-[14px] text-[#0F1113] outline-none placeholder:text-[#B0B6BE]"
      />
    </label>
  );
}

function EditDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Format date for display (YYYY-MM-DD → readable)
  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const isValidDate = value && !isNaN(new Date(value + 'T00:00:00').getTime());

  return (
    <label className={`relative block rounded-xl border bg-[#FAFBFC] px-4 py-2.5 transition-colors ${
      value ? 'border-[#D6DADE]' : 'border-[#E8EAED]'
    }`}>
      <span className="block text-[11px] text-[#5E6670] leading-none mb-1">{label}</span>
      <div className="relative">
        <span className={`block text-[14px] ${isValidDate ? 'text-[#0F1113]' : 'text-[#B0B6BE]'}`}>
          {isValidDate ? displayValue : 'Select date'}
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </label>
  );
}

/* ── Main component ────────────────────────────────────────── */

export function EditDetailsSheet({
  open,
  onOpenChange,
  details,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: QuoteFlowDetails;
  onSave: (updated: QuoteFlowDetails) => void;
}) {
  const [editTab, setEditTab] = useState<'car' | 'personal'>('car');
  const [draft, setDraft] = useState<QuoteFlowDetails>(details);
  const prevOpenRef = useRef(open);

  // Sync draft when sheet opens (false → true transition)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft(details);
    }
    prevOpenRef.current = open;
  }, [open, details]);

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v);
  };

  const handleSave = () => {
    onSave(draft);
    onOpenChange(false);
  };

  // Derive visible fields from the single state machine
  const visibleCarFields = getVisibleCarFields(draft);
  const visiblePersonalFields = getVisiblePersonalFields(draft);
  const carFilled = countFilledFields(draft, visibleCarFields);
  const personalFilled = countFilledFields(draft, visiblePersonalFields);
  const carTotal = visibleCarFields.length;
  const personalTotal = visiblePersonalFields.length;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="!rounded-t-[20px] bg-[#FFFFFF] px-0 pb-0 h-[80vh] max-h-[80vh] flex flex-col !gap-0 [&>button:last-of-type]:hidden">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[5px] w-10 rounded-full bg-[#D6DADE]" />
        </div>

        <SheetHeader className="px-5 pt-1 pb-0 !gap-0">
          <SheetTitle className="text-[18px] text-[#0F1113]">Edit Details</SheetTitle>
          <SheetDescription className="text-[12px] text-[#8A919A]">Review and correct any details we captured</SheetDescription>
        </SheetHeader>

        {/* Tabs */}
        <div className="px-5 py-3">
          <div className="flex rounded-xl bg-[#F3F5F7] p-1">
            <button
              type="button"
              onClick={() => setEditTab('car')}
              className={`flex flex-1 items-center justify-center gap-1.5 h-9 rounded-[10px] text-[13px] font-medium transition-all ${
                editTab === 'car'
                  ? 'bg-[#0F1113] text-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]'
                  : 'text-[#0F1113]'
              }`}
            >
              <Car className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Car Details</span>
              <span className={`px-1.5 h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold whitespace-nowrap ${
                editTab === 'car'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#0F1113] text-white'
              }`}>
                {carFilled}/{carTotal}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEditTab('personal')}
              className={`flex flex-1 items-center justify-center gap-1.5 h-9 rounded-[10px] text-[13px] font-medium transition-all ${
                editTab === 'personal'
                  ? 'bg-[#0F1113] text-white shadow-[0_1px_3px_rgba(0,0,0,0.15)]'
                  : 'text-[#0F1113]'
              }`}
            >
              <UserRound className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Personal</span>
              <span className={`px-1.5 h-[18px] flex items-center justify-center rounded-full text-[10px] font-semibold whitespace-nowrap ${
                editTab === 'personal'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#0F1113] text-white'
              }`}>
                {personalFilled}/{personalTotal}
              </span>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2 [-webkit-overflow-scrolling:touch]">
          {editTab === 'car' ? (
            <div className="space-y-2">
              <EditSelectField label="Your car brand" value={draft.brand} options={carBrands.map((b) => b.name)} onChange={(v) => setDraft((prev) => ({ ...prev, brand: v, model: prev.brand !== v ? '' : prev.model }))} />
              <EditSelectField label="Car model" value={draft.model} options={draft.brand ? (modelsByBrand[draft.brand] ?? []) : []} onChange={(v) => setDraft((prev) => ({ ...prev, model: v }))} disabled={!draft.brand} placeholder={draft.brand ? 'Select model' : 'Select brand first'} />
              <EditSelectField label="Year of manufacture" value={draft.year} options={getYearRange().reverse().map(String)} onChange={(v) => setDraft((prev) => ({ ...prev, year: v }))} />
              {draft.year && shouldRequireCondition(draft.year) && (
                <EditSelectField label="Car condition" value={draft.condition} options={conditionOptions} onChange={(v) => setDraft((prev) => ({ ...prev, condition: v }))} />
              )}
              <EditSelectField label="Previous insurance type" value={draft.coverage} options={coverageOptions} onChange={(v) => setDraft((prev) => ({ ...prev, coverage: v }))} />
              <EditSelectField label="Car specification" value={draft.spec} options={specOptions} onChange={(v) => setDraft((prev) => ({ ...prev, spec: v }))} />
              <EditSelectField label="Registration city" value={draft.city} options={cities} onChange={(v) => setDraft((prev) => ({ ...prev, city: v }))} />
              <EditDateField label="Previous policy expiry" value={draft.expiry} onChange={(v) => setDraft((prev) => ({ ...prev, expiry: v }))} />
            </div>
          ) : (
            <div className="space-y-2">
              <EditTextField label="Owner's full name" value={draft.name} onChange={(v) => setDraft((prev) => ({ ...prev, name: v }))} placeholder="As per Emirates ID" />
              <EditDateField label="Date of birth" value={draft.dob} onChange={(v) => setDraft((prev) => ({ ...prev, dob: v }))} />
              <EditSelectField label="Nationality" value={draft.nationality} options={nationalities} onChange={(v) => setDraft((prev) => ({ ...prev, nationality: v }))} />
              <EditSelectField label="Driving experience" value={draft.drivingExperience} options={drivingExperienceOptions} onChange={(v) => setDraft((prev) => ({ ...prev, drivingExperience: v }))} />
              <EditSelectField label="Claim-free period" value={draft.accidentFreeMonths} options={accidentFreeOptions} onChange={(v) => setDraft((prev) => ({ ...prev, accidentFreeMonths: v }))} />
              {draft.accidentFreeMonths === 'Never claimed' && (
                <EditTextField label="No-claim proof" value={draft.noClaimProof} onChange={(v) => setDraft((prev) => ({ ...prev, noClaimProof: v }))} placeholder="e.g. Letter from insurer" />
              )}
              <EditTextField label="Mobile number" value={draft.mobileNumber} onChange={(v) => setDraft((prev) => ({ ...prev, mobileNumber: v }))} placeholder="+971 5X XXX XXXX" inputMode="tel" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-t border-[#E8EAED] bg-[#FFFFFF] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 rounded-[14px] border border-[#D6DADE] text-[14px] font-medium text-[#0F1113] active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-12 rounded-[14px] bg-[#0F1113] text-[14px] font-medium text-white active:scale-[0.98] transition-all"
          >
            Save Changes
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
