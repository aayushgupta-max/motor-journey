import { useState, useEffect, useRef } from 'react';
import { Car, UserRound, ChevronDown, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ── Custom Select Field ──────────────────────────────────── */

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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Scroll to selected item when opening & scroll field to top of scroll container
  useEffect(() => {
    if (!isOpen) return;
    // Scroll selected option into view inside dropdown
    if (listRef.current && value) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    }
    // Scroll the field itself to the top of the sheet's scroll area
    requestAnimationFrame(() => {
      containerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }, [isOpen, value]);

  return (
    <div ref={containerRef} className="relative scroll-mt-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative w-full text-left rounded-xl border bg-[#FAFBFC] px-4 py-2.5 transition-colors ${
          value ? 'border-[#D6DADE]' : 'border-[#E8EAED]'
        } ${disabled ? 'opacity-40' : ''} ${isOpen ? 'border-[#0F1113] ring-1 ring-[#0F1113]' : ''}`}
      >
        <span className="block text-[11px] text-[#5E6670] leading-none mb-1">{label}</span>
        <div className="flex items-center justify-between">
          <span className={`text-[14px] ${value ? 'text-[#0F1113]' : 'text-[#B0B6BE]'}`}>
            {value || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-[#B0B6BE] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="mt-1 max-h-[200px] overflow-y-auto rounded-xl border border-[#D6DADE] bg-[#FFFFFF] shadow-[0_8px_30px_rgba(0,0,0,0.08)] [-webkit-overflow-scrolling:touch]"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              data-selected={value === opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[14px] transition-colors ${
                value === opt
                  ? 'bg-[#F3F5F7] text-[#0F1113] font-medium'
                  : 'text-[#3A3F45] hover:bg-[#FAFBFC]'
              } ${opt !== options[options.length - 1] ? 'border-b border-[#F3F5F7]' : ''}`}
            >
              <span>{opt}</span>
              {value === opt && <Check className="h-4 w-4 text-[#0F1113]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Text Field ───────────────────────────────────────────── */

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

/* ── Custom Date Picker Field ─────────────────────────────── */

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing value
  const parsed = value ? new Date(value + 'T00:00:00') : null;
  const isValidDate = parsed && !isNaN(parsed.getTime());

  const today = new Date();
  const [viewMonth, setViewMonth] = useState(isValidDate ? parsed.getMonth() : today.getMonth());
  const [viewYear, setViewYear] = useState(isValidDate ? parsed.getFullYear() : today.getFullYear());

  const selectedDay = isValidDate ? parsed.getDate() : null;
  const selectedMonth = isValidDate ? parsed.getMonth() : null;
  const selectedYear = isValidDate ? parsed.getFullYear() : null;

  // Reset view when opening & scroll field to top
  useEffect(() => {
    if (isOpen) {
      if (isValidDate) {
        setViewMonth(parsed.getMonth());
        setViewYear(parsed.getFullYear());
      } else {
        setViewMonth(today.getMonth());
        setViewYear(today.getFullYear());
      }
      // Scroll the field to the top of the sheet's scroll area
      requestAnimationFrame(() => {
        containerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      });
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const displayValue = isValidDate
    ? parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDate = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
  };

  const isSelected = (day: number) =>
    selectedDay === day && selectedMonth === viewMonth && selectedYear === viewYear;

  const isToday = (day: number) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div ref={containerRef} className="relative scroll-mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full text-left rounded-xl border bg-[#FAFBFC] px-4 py-2.5 transition-colors ${
          value ? 'border-[#D6DADE]' : 'border-[#E8EAED]'
        } ${isOpen ? 'border-[#0F1113] ring-1 ring-[#0F1113]' : ''}`}
      >
        <span className="block text-[11px] text-[#5E6670] leading-none mb-1">{label}</span>
        <div className="flex items-center justify-between">
          <span className={`text-[14px] ${isValidDate ? 'text-[#0F1113]' : 'text-[#B0B6BE]'}`}>
            {isValidDate ? displayValue : 'Select date'}
          </span>
          <ChevronDown className={`h-4 w-4 text-[#B0B6BE] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="mt-1 rounded-xl border border-[#D6DADE] bg-[#FFFFFF] shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-3">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F3F5F7]">
              <ChevronLeft className="h-4 w-4 text-[#5E6670]" />
            </button>
            <span className="text-[13px] font-semibold text-[#0F1113]">
              {MONTHS_FULL[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F3F5F7]">
              <ChevronRight className="h-4 w-4 text-[#5E6670]" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center text-[10px] font-medium text-[#8A919A] py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`h-8 w-full rounded-lg text-[13px] transition-colors ${
                    isSelected(day)
                      ? 'bg-[#0F1113] text-white font-medium'
                      : isToday(day)
                        ? 'bg-[#F3F5F7] text-[#0F1113] font-medium'
                        : 'text-[#3A3F45] hover:bg-[#F3F5F7]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear / Today shortcuts */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F3F5F7]">
            {value ? (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[12px] text-[#8A919A] hover:text-[#5E6670]"
              >
                Clear
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => selectDate(today.getDate())}
              className="text-[12px] font-medium text-[#0F1113] hover:text-[#3A3F45]"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
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

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="!rounded-t-[20px] bg-[#FFFFFF] px-0 pb-0 h-[80vh] max-h-[80vh] flex flex-col !gap-0 [&>button:last-of-type]:hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-[#D6DADE]" />
        </div>

        <SheetHeader className="px-5 py-0">
          <SheetTitle className="text-[18px] text-[#0F1113]">Edit Details</SheetTitle>
          <SheetDescription className="text-[12px] text-[#8A919A] mt-1">
            Review and correct any details we captured
          </SheetDescription>
        </SheetHeader>

        {/* Tab switcher — Apple segmented control */}
        <div className="flex flex-col gap-1.5 mb-2">
          <div className="mx-5 mt-2 flex rounded-xl bg-[#F3F5F7] p-1">
            <button
              type="button"
              onClick={() => setEditTab('car')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[13px] font-medium transition-all ${
                editTab === 'car'
                  ? 'bg-[#0F1113] text-[#FFFFFF] shadow-sm'
                  : 'text-[#3A3F45]'
              }`}
            >
              <Car className="h-3.5 w-3.5" />
              Car Details
              <span className={`inline-flex h-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold whitespace-nowrap ${
                editTab === 'car'
                  ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]'
                  : 'bg-[#0F1113] text-[#FFFFFF]'
              }`}>
                {carFilled}/{visibleCarFields.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEditTab('personal')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] py-2 text-[13px] font-medium transition-all ${
                editTab === 'personal'
                  ? 'bg-[#0F1113] text-[#FFFFFF] shadow-sm'
                  : 'text-[#3A3F45]'
              }`}
            >
              <UserRound className="h-3.5 w-3.5" />
              Personal
              <span className={`inline-flex h-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold whitespace-nowrap ${
                editTab === 'personal'
                  ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]'
                  : 'bg-[#0F1113] text-[#FFFFFF]'
              }`}>
                {personalFilled}/{visiblePersonalFields.length}
              </span>
            </button>
          </div>
        </div>

        {/* Fields */}
        <div data-scroll-area className="flex-1 overflow-y-auto overscroll-contain px-5 pb-2 [-webkit-overflow-scrolling:touch]">
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
                <EditSelectField label="No-claim proof" value={draft.noClaimProof} options={['Yes', 'No']} onChange={(v) => setDraft((prev) => ({ ...prev, noClaimProof: v }))} placeholder="Do you have proof?" />
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
