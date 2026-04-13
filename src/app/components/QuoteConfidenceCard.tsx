import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  X,
} from 'lucide-react';
import {
  getCompletedFieldCount,
  getConfidenceLevel,
  getConfidenceScore,
  getPendingQuoteActions,
  getTotalFieldCount,
  type QuoteFlowAction,
  type QuoteFlowDetails,
} from '../lib/quoteFlow';

function QuestionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[10px] bg-[#FFFFFF] px-3 py-3">
      <p className="text-[14px] font-medium text-[#3A3F45] mb-2.5">{title}</p>
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
  const btnClass = (selected: boolean) =>
    `flex-1 rounded-[8px] px-3 py-2 text-[13px] transition-all active:scale-[0.98] ${
      selected ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#F3F5F7] text-[#0F1113]'
    }`;

  const uploadBtn = (onClick: () => void, skipFn?: () => void, canSkipFlag = false) => (
    <div className="flex w-full gap-2">
      <button type="button" onClick={onClick} className={`${canSkipFlag && skipFn ? 'flex-1' : 'w-full'} h-9 rounded-[8px] bg-[#0F1113] text-[13px] text-[#FFFFFF] transition-all active:scale-[0.98]`}>
        Upload Now
      </button>
      {canSkipFlag && skipFn ? (
        <button type="button" onClick={skipFn} className="flex-1 h-9 rounded-[8px] bg-[#F3F5F7] text-[13px] text-[#5E6670] transition-all active:scale-[0.98]">
          Skip
        </button>
      ) : null}
    </div>
  );

  if (action === 'mulkiyaUpload') {
    return (
      <QuestionCard title="Upload your Mulkiya to auto-fill vehicle make, model, year and expiry">
        {uploadBtn(onOpenMulkiya, onSkip, canSkip)}
      </QuestionCard>
    );
  }

  if (action === 'coverage') {
    return (
      <QuestionCard title="What was your previous insurance repair type? This helps match the right quotes.">
        <div className="flex gap-2">
          {['Third Party', 'Comprehensive'].map((option) => (
            <button key={option} type="button" onClick={() => setDetails((prev) => ({ ...prev, coverage: option }))} className={btnClass(details.coverage === option)}>
              {option}
            </button>
          ))}
        </div>
      </QuestionCard>
    );
  }

  if (action === 'spec') {
    return (
      <QuestionCard title="Is your car GCC or Non-GCC spec? This affects insurer eligibility.">
        <div className="flex gap-2">
          {['GCC', 'Non-GCC'].map((option) => (
            <button key={option} type="button" onClick={() => setDetails((prev) => ({ ...prev, spec: option }))} className={btnClass(details.spec === option)}>
              {option}
            </button>
          ))}
        </div>
      </QuestionCard>
    );
  }

  if (action === 'dlUpload') {
    return (
      <QuestionCard title="Upload your Driving License to auto-fill date of birth and experience">
        {uploadBtn(onOpenDl, onSkip, canSkip)}
      </QuestionCard>
    );
  }

  if (action === 'accidentFreeMonths') {
    return (
      <QuestionCard title="How long since your last insurance claim? A clean record can lower your premium.">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Never claimed', value: 'Never claimed' },
            { label: '12+ months', value: '12+ months' },
            { label: '6–12 months', value: '6-12 months' },
            { label: 'Under 6 months', value: 'Less than 6 months' },
          ].map((option) => (
            <button key={option.value} type="button" onClick={() => setDetails((prev) => ({ ...prev, accidentFreeMonths: option.value }))} className={btnClass(details.accidentFreeMonths === option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      </QuestionCard>
    );
  }

  if (action === 'noClaimProof') {
    return (
      <QuestionCard title="Do you have a no-claim certificate? Some insurers offer discounts for it.">
        <div className="flex gap-2">
          {['Yes', 'No'].map((option) => (
            <button key={option} type="button" onClick={() => setDetails((prev) => ({ ...prev, noClaimProof: option }))} className={btnClass(details.noClaimProof === option)}>
              {option}
            </button>
          ))}
        </div>
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
  const deferredActions = pendingActions.filter(
    (action) => skippedUploads.includes(action as 'mulkiyaUpload' | 'dlUpload')
  );
  // Show non-deferred first, then deferred (pushed to last)
  const nextAction = (nonDeferredActions[0] ?? deferredActions[0] ?? 'done') as QuoteFlowAction;
  const pendingUploads = pendingActions.filter(
    (a) => a === 'mulkiyaUpload' || a === 'dlUpload'
  );
  const pendingNonUploads = pendingActions.filter(
    (a) => a !== 'mulkiyaUpload' && a !== 'dlUpload'
  );
  const isUploadAction = nextAction === 'mulkiyaUpload' || nextAction === 'dlUpload';
  // Show skip if: there are other questions to go to, OR both uploads are pending (toggle)
  const canSkipUpload = isUploadAction && (pendingNonUploads.length > 0 || pendingUploads.length > 1);
  const allSurveyDone = nextAction === 'done';
  const confidencePct = getConfidenceScore(details, isLoggedIn);
  const answeredCount = getCompletedFieldCount(details, isLoggedIn);
  const totalFieldCount = getTotalFieldCount(details);
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
                  stroke={allSurveyDone ? '#0F1113' : getConfidenceLevel(confidencePct).color}
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
                  <motion.span
                    key={confidencePct}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-[13px] font-bold leading-none text-[#0F1113]"
                  >
                    {confidencePct}%
                  </motion.span>
                )}
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-[#0F1113]">
              {allSurveyDone ? 'Best price unlocked' : `${getConfidenceLevel(confidencePct).label} Quote Confidence`}
            </p>
            <p className="mt-0.5 text-[12px] leading-tight text-[#4B525A]">
              {allSurveyDone
                ? 'Mulkiya, DL and key pricing answers are now captured.'
                : remaining === 1
                  ? 'Last step to tighten quote confidence.'
                  : getConfidenceLevel(confidencePct).message + '.'}
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
              canSkipUpload
                ? () => {
                    if (pendingNonUploads.length > 0) {
                      // Push to last — defer this upload, go to next question
                      setSkippedUploads((prev) =>
                        prev.includes(nextAction as 'mulkiyaUpload' | 'dlUpload')
                          ? prev
                          : [...prev, nextAction as 'mulkiyaUpload' | 'dlUpload']
                      );
                    } else {
                      // Only uploads left — toggle to the other one
                      setSkippedUploads([nextAction as 'mulkiyaUpload' | 'dlUpload']);
                    }
                  }
                : undefined,
              canSkipUpload
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
