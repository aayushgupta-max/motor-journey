import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  Check,
  X,
  Upload,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Shield,
  FileText,
} from 'lucide-react';
import {
  getCompletedFieldCount,
  getConfidenceScore,
  getPendingQuoteActions,
  getTotalFieldCount,
  type QuoteFlowAction,
  type QuoteFlowDetails,
} from '../lib/quoteFlow';

function parseClaimInput(text: string): string | null {
  const t = text.toLowerCase().trim();
  if (/never|no claim|none|clean|0/.test(t)) return 'Never claimed';
  if (/year|12|long|while/.test(t)) return '12+ months';
  if (/6|half|few month/.test(t)) return '6-12 months';
  if (/recent|last month|just|less/.test(t)) return 'Less than 6 months';
  return null;
}

function parseNoClaimProofInput(text: string): 'Yes' | 'No' | null {
  const t = text.toLowerCase().trim();
  if (/yes|have|got/.test(t)) return 'Yes';
  if (/no|don|nope/.test(t)) return 'No';
  return null;
}

function SmartInput({
  placeholder,
  onSubmit,
}: {
  placeholder: string;
  onSubmit: (text: string) => boolean;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const success = onSubmit(text);
    if (success) {
      setText('');
      setError(false);
      return;
    }
    setError(true);
    setTimeout(() => setError(false), 1500);
  };

  return (
    <div className="mt-2">
      <div className={`flex h-9 items-center gap-2 rounded-lg bg-[#FAFBFC] px-3 transition-colors ${error ? 'ring-1 ring-red-300' : 'ring-1 ring-[#D6DADE]'}`}>
        <MessageSquare className="h-3 w-3 flex-shrink-0 text-[#8A919A]" />
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-[#0F1113] outline-none placeholder:text-[#B0B6BE]"
        />
        {text ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[#D6DADE] px-2 py-0.5 text-[10px] font-medium text-[#0F1113]"
          >
            Send
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="ml-1 mt-1 text-[10px] text-red-400">Did not catch that. Try one of the options.</p>
      ) : null}
    </div>
  );
}

function QuestionCard({
  title,
  icon,
  children,
  helper,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="rounded-[10px] bg-[#FFFFFF] p-4">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-semibold text-[#0F1113]">{title}</p>
        </div>
        <p className="mt-1 pl-6 text-[11px] leading-4 text-[#5E6670]">{helper}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function renderQuestion(
  action: QuoteFlowAction,
  details: QuoteFlowDetails,
  setDetails: React.Dispatch<React.SetStateAction<QuoteFlowDetails>>,
  onOpenMulkiya: () => void,
  onOpenDl: () => void,
  onSkip?: () => void,
  canSkip = false
) {
  if (action === 'mulkiyaUpload') {
    return (
      <QuestionCard
        title="Upload your Mulkiya"
        icon={<FileText className="h-4 w-4 text-[#5E6670]" />}
        helper="We can pull make, model, year, nationality and previous policy expiry from it."
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={onOpenMulkiya}
              className={`${canSkip && onSkip ? 'flex-1' : 'w-full'} h-10 rounded-[8px] bg-[#0F1113] text-sm text-[#FFFFFF] transition-all active:scale-[0.98]`}
            >
              Upload Now
            </button>
            {canSkip && onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 h-10 rounded-[8px] bg-[#FAFBFC] text-sm text-[#5E6670] transition-all active:scale-[0.98]"
              >
                Skip for now
              </button>
            ) : null}
          </div>
        </div>
      </QuestionCard>
    );
  }

  if (action === 'coverage') {
    return (
      <QuestionCard
        title="What was your previous insurance repair type?"
        icon={<Shield className="h-4 w-4 text-[#5E6670]" />}
        helper="This helps us match the right quote type faster."
      >
        <div className="flex gap-2">
          {['Third Party', 'Comprehensive'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDetails((prev) => ({ ...prev, coverage: option }))}
              className={`flex-1 rounded-[8px] px-3 py-2.5 text-sm transition-all active:scale-[0.98] ${
                details.coverage === option ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#F3F5F7] text-[#0F1113]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </QuestionCard>
    );
  }

  if (action === 'spec') {
    return (
      <QuestionCard
        title="Is your car GCC spec or Non-GCC?"
        icon={<Check className="h-4 w-4 text-[#5E6670]" />}
        helper="GCC status affects insurer eligibility and matching."
      >
        <div className="flex gap-2">
          {['GCC', 'Non-GCC'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDetails((prev) => ({ ...prev, spec: option }))}
              className={`flex-1 rounded-[8px] px-3 py-2.5 text-sm transition-all active:scale-[0.98] ${
                details.spec === option ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#F3F5F7] text-[#0F1113]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </QuestionCard>
    );
  }

  if (action === 'dlUpload') {
    return (
      <QuestionCard
        title="Upload your Driving License"
        icon={<Upload className="h-4 w-4 text-[#5E6670]" />}
        helper="We can pull date of birth and driving experience from it."
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={onOpenDl}
              className={`${canSkip && onSkip ? 'flex-1' : 'w-full'} h-10 rounded-[8px] bg-[#0F1113] text-sm text-[#FFFFFF] transition-all active:scale-[0.98]`}
            >
              Upload Now
            </button>
            {canSkip && onSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="flex-1 h-10 rounded-[8px] bg-[#FAFBFC] text-sm text-[#5E6670] transition-all active:scale-[0.98]"
              >
                Skip for now
              </button>
            ) : null}
          </div>
        </div>
      </QuestionCard>
    );
  }

  if (action === 'accidentFreeMonths') {
    return (
      <QuestionCard
        title="How long since your last accident?"
        icon={<Calendar className="h-4 w-4 text-[#5E6670]" />}
        helper="Accident-free history can improve your pricing."
      >
        <div className="grid grid-cols-2 gap-2">
          {['Never claimed', '12+ months', '6-12 months', 'Less than 6 months'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDetails((prev) => ({ ...prev, accidentFreeMonths: option }))}
              className={`rounded-[8px] px-3 py-2.5 text-sm transition-all active:scale-[0.98] ${
                details.accidentFreeMonths === option ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FAFBFC] text-[#0F1113]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <SmartInput
          placeholder="or type: never, 2 years..."
          onSubmit={(text) => {
            const result = parseClaimInput(text);
            if (!result) return false;
            setDetails((prev) => ({ ...prev, accidentFreeMonths: result }));
            return true;
          }}
        />
      </QuestionCard>
    );
  }

  if (action === 'noClaimProof') {
    return (
      <QuestionCard
        title="Do you have a No-claim proof?"
        icon={<ShieldCheck className="h-4 w-4 text-[#5E6670]" />}
        helper="If yes, some insurers may offer better premiums."
      >
        <div className="flex gap-2">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDetails((prev) => ({ ...prev, noClaimProof: option }))}
              className={`flex-1 rounded-[8px] px-3 py-2.5 text-sm transition-all active:scale-[0.98] ${
                details.noClaimProof === option ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FAFBFC] text-[#0F1113]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <SmartInput
          placeholder="or type: yes, no..."
          onSubmit={(text) => {
            const result = parseNoClaimProofInput(text);
            if (!result) return false;
            setDetails((prev) => ({ ...prev, noClaimProof: result }));
            return true;
          }}
        />
      </QuestionCard>
    );
  }

  return null;
}

export function QuoteConfidenceCard({
  details,
  setDetails,
  isLoggedIn,
  onOpenMulkiya,
  onOpenDl,
}: {
  details: QuoteFlowDetails;
  setDetails: React.Dispatch<React.SetStateAction<QuoteFlowDetails>>;
  isLoggedIn: boolean;
  onOpenMulkiya: () => void;
  onOpenDl: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [skippedUploads, setSkippedUploads] = useState<Array<'mulkiyaUpload' | 'dlUpload'>>([]);
  const pendingActions = getPendingQuoteActions(details, isLoggedIn);
  const nonDeferredActions = pendingActions.filter(
    (action) => !(skippedUploads.includes(action as 'mulkiyaUpload' | 'dlUpload'))
  );
  const nextAction = (nonDeferredActions[0] ?? pendingActions[0] ?? 'done') as QuoteFlowAction;
  const allSurveyDone = nextAction === 'done';
  const confidencePct = getConfidenceScore(details, isLoggedIn);
  const answeredCount = getCompletedFieldCount(details, isLoggedIn);
  const totalFieldCount = getTotalFieldCount();
  const remaining = Math.max(0, totalFieldCount - answeredCount);

  useEffect(() => {
    if (!allSurveyDone) {
      setDismissed(false);
      return;
    }
    const timer = setTimeout(() => setDismissed(true), 3000);
    return () => clearTimeout(timer);
  }, [allSurveyDone]);

  useEffect(() => {
    setSkippedUploads((prev) =>
      prev.filter((action) => {
        if (action === 'mulkiyaUpload') return !details.mulkiyaUploaded;
        if (action === 'dlUpload') return !details.dlUploaded;
        return false;
      })
    );
  }, [details.mulkiyaUploaded, details.dlUploaded]);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="relative mb-3 overflow-hidden rounded-[20px] p-[2px]"
    >
      {!allSurveyDone ? (
        <div
          className="absolute inset-0 rounded-[20px]"
          style={{
            background:
              'conic-gradient(from var(--border-angle, 0deg), transparent 60%, #D6DADE 78%, #4B525A 82%, #D6DADE 86%, transparent 95%)',
            animation: 'shooting-star-spin 3s linear infinite',
          }}
        />
      ) : null}

      <div
        className="relative rounded-[18px] p-4"
        style={{
          background: allSurveyDone
            ? 'linear-gradient(135deg, #FAFBFC 0%, #D6DADE 100%)'
            : 'linear-gradient(135deg, #F3F5F7 0%, #B0B6BE 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="relative" style={{ width: 48, height: 48 }}>
              <svg width={48} height={48} className="-rotate-90">
                <circle
                  cx={24}
                  cy={24}
                  r={20}
                  fill={allSurveyDone ? '#0F1113' : 'white'}
                  stroke={allSurveyDone ? '#0F1113' : '#D6DADE'}
                  strokeWidth={3}
                />
                <motion.circle
                  cx={24}
                  cy={24}
                  r={20}
                  fill="none"
                  stroke="#0F1113"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 - (confidencePct / 100) * 2 * Math.PI * 20 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {allSurveyDone ? (
                  <Check className="h-5 w-5 text-[#FFFFFF]" />
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 fill-[#4B525A] text-[#4B525A]" />
                    <motion.span
                      key={confidencePct}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-0.5 text-[10px] font-bold leading-none text-[#0F1113]"
                    >
                      {confidencePct}%
                    </motion.span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#0F1113]">
              {allSurveyDone ? 'Best price unlocked' : 'Low Quote Confidence Score'}
            </p>
            <p className="mt-0.5 text-xs leading-tight text-[#4B525A]">
              {allSurveyDone
                ? 'Mulkiya, DL and key pricing answers are now captured.'
                : remaining === 1
                  ? 'Last step to tighten quote confidence.'
                  : `${remaining} more data points to improve matching and pricing.`}
            </p>
          </div>
        </div>

        {!allSurveyDone ? (
          <div className="mt-3">
            {renderQuestion(
              nextAction,
              details,
              setDetails,
              onOpenMulkiya,
              onOpenDl,
              nextAction === 'mulkiyaUpload' || nextAction === 'dlUpload'
                ? () =>
                    setSkippedUploads((prev) =>
                      prev.includes(nextAction as 'mulkiyaUpload' | 'dlUpload')
                        ? prev
                        : [...prev, nextAction as 'mulkiyaUpload' | 'dlUpload']
                    )
                : undefined,
              (nextAction === 'mulkiyaUpload' || nextAction === 'dlUpload') &&
                pendingActions.length > 1
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
