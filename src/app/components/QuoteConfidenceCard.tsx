import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Check, X, Upload, Calendar, ShieldCheck } from 'lucide-react';

interface QuoteConfidenceCardProps {
  quotesCount: number;
  plansCount: number;
  answeredCount: number;
  totalDataPoints: number;
  allSurveyDone: boolean;
  // Survey state
  gccSelection: 'yes' | 'no' | null;
  setGccSelection: (v: 'yes' | 'no' | null) => void;
  showDLUpload: boolean;
  setShowDLUpload: (v: boolean) => void;
  dlUploaded: boolean;
  dlSkipped: boolean;
  setDlSkipped: (v: boolean) => void;
  setShowDLSheet: (v: boolean) => void;
  claimMonths: string | null;
  setClaimMonths: (v: string | null) => void;
  hasNoClaimProof: 'yes' | 'no' | null;
  setHasNoClaimProof: (v: 'yes' | 'no' | null) => void;
  surveyStep: number;
  setSurveyStep: (v: number) => void;
}

export function QuoteConfidenceCard({
  quotesCount,
  plansCount,
  answeredCount,
  totalDataPoints,
  allSurveyDone,
  gccSelection,
  setGccSelection,
  showDLUpload,
  setShowDLUpload,
  dlUploaded,
  dlSkipped,
  setDlSkipped,
  setShowDLSheet,
  claimMonths,
  setClaimMonths,
  hasNoClaimProof,
  setHasNoClaimProof,
  surveyStep,
  setSurveyStep,
}: QuoteConfidenceCardProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (allSurveyDone) {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [allSurveyDone]);

  if (dismissed) return null;

  const baselineScore = totalDataPoints - 4; // 8 from Mulkiya
  const dataScore = baselineScore + (allSurveyDone ? 4 : answeredCount);
  const confidencePct = Math.round((dataScore / totalDataPoints) * 100);
  const remaining = allSurveyDone ? 0 : (4 - answeredCount);


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="relative rounded-[20px] p-[2px] mb-3 overflow-hidden"
    >
      {/* Animated border */}
      {!allSurveyDone && (
        <div
          className="absolute inset-0 rounded-[20px]"
          style={{
            background: 'conic-gradient(from var(--border-angle, 0deg), transparent 60%, #D4D4D4 78%, #666666 82%, #D4D4D4 86%, transparent 95%)',
            animation: 'shooting-star-spin 3s linear infinite',
          }}
        />
      )}

      <div
        className={`relative rounded-[18px] p-4`}
        style={{
          background: allSurveyDone
            ? 'linear-gradient(135deg, #F0F0F0 0%, #E0E0E0 100%)'
            : 'linear-gradient(135deg, #E8E8E8 0%, #CFCFCF 100%)',
        }}
      >
        {/* Header: Icon + Text + Confidence Ring */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-[#2D2D2D] flex items-center justify-center flex-shrink-0">
            {allSurveyDone ? (
              <Check className="w-4.5 h-4.5 text-[#D4D4D4]" />
            ) : (
              <AlertTriangle className="w-4.5 h-4.5 text-[#D4D4D4]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#2D2D2D]">
              {allSurveyDone ? 'Best price unlocked' : 'Low confidence premiums'}
            </p>
            <p className="text-xs text-[#2D2D2D]/70 leading-tight mt-0.5">
              {allSurveyDone
                ? 'Your quotes are now fully personalized'
                : remaining === 1
                  ? 'Last question to unlock better rates'
                  : `Answer ${remaining} quick questions to unlock better rates`}
            </p>
          </div>

          {/* Confidence Ring */}
          <div className="flex-shrink-0">
            <div className="relative" style={{ width: 48, height: 48 }}>
              <svg width={48} height={48} className="-rotate-90">
                <circle cx={24} cy={24} r={20} fill="white" stroke="#D4D4D4" strokeWidth={3} />
                <motion.circle
                  cx={24} cy={24} r={20}
                  fill="none"
                  stroke="#2D2D2D"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 20}
                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 20 - (confidencePct / 100) * 2 * Math.PI * 20 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={confidencePct}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-[12px] font-bold text-[#2D2D2D]"
                >
                  {confidencePct}%
                </motion.span>
              </div>
            </div>
          </div>
        </div>

        {/* Survey Questions — always visible */}
        {!allSurveyDone && (
          <div className="mt-3">
            <AnimatePresence mode="wait">
              {/* Q1: GCC Spec with flip to DL Upload */}
              {surveyStep === 0 && (
                <motion.div
                  key="q1-gcc"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="relative bg-white rounded-[10px]" style={{ perspective: '800px' }}>
                    <motion.div
                      animate={{ rotateX: showDLUpload ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="relative"
                    >
                      {/* Front: GCC Question */}
                      <div
                        className={`p-4 ${showDLUpload ? 'absolute inset-0' : 'relative'}`}
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <p className="text-sm text-[#2D2D2D] mb-3">Is your car GCC spec or Non-GCC?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setGccSelection('yes');
                              setTimeout(() => setShowDLUpload(true), 400);
                            }}
                            className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                              gccSelection === 'yes' ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-[#EFEFEF] text-[#2D2D2D]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            GCC Spec
                          </button>
                          <button
                            onClick={() => {
                              setGccSelection('no');
                              setTimeout(() => setShowDLUpload(true), 400);
                            }}
                            className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                              gccSelection === 'no' ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-[#F7F7F7] text-[#2D2D2D]'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            Non-GCC
                          </button>
                        </div>
                      </div>

                      {/* Back: DL Upload */}
                      <div
                        className={`p-4 flex flex-col items-center justify-center ${showDLUpload ? 'relative' : 'absolute inset-0'}`}
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
                      >
                        <div className="w-12 h-12 rounded-[8px] bg-[#EFEFEF] flex items-center justify-center mb-3">
                          <Upload className="w-5 h-5 text-[#2D2D2D]" />
                        </div>
                        <p className="text-sm text-[#2D2D2D] mb-1">Upload your Driving License</p>
                        <p className="text-[11px] text-[#2D2D2D]/40 mb-4">We'll auto-fill your details instantly</p>
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => setShowDLSheet(true)}
                            className="flex-1 h-10 rounded-xl bg-[#2D2D2D] text-[#D4D4D4] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Upload DL
                          </button>
                          <button
                            onClick={() => {
                              setDlSkipped(true);
                              setSurveyStep(1);
                            }}
                            className="flex-1 h-10 rounded-xl bg-[#F7F7F7] text-[#2D2D2D]/60 text-sm transition-all active:scale-[0.98] flex items-center justify-center"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Q2: Claim months */}
              {surveyStep === 1 && (
                <motion.div
                  key="q2-claim-months"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[10px] p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#2D2D2D]/40" />
                    <p className="text-sm text-[#2D2D2D]">How long since your last claim?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Never claimed', '12+ months', '6–12 months', 'Less than 6 months'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setClaimMonths(opt);
                          if (opt === 'Never claimed') {
                            setTimeout(() => setSurveyStep(2), 300);
                          } else {
                            setHasNoClaimProof(null);
                            setTimeout(() => {
                              if (dlSkipped) setSurveyStep(3);
                              // else survey is done (skip no-claim proof step)
                            }, 300);
                          }
                        }}
                        className={`h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center ${
                          claimMonths === opt ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-[#F7F7F7] text-[#2D2D2D]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Q3: No claim proof */}
              {surveyStep === 2 && (
                <motion.div
                  key="q3-no-claim-proof"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[10px] p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#2D2D2D]/40" />
                    <p className="text-sm text-[#2D2D2D]">Do you have a No Claim Certificate?</p>
                  </div>
                  <p className="text-[11px] text-[#2D2D2D]/40 mb-3 ml-6">This can reduce your premium by up to 25%</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setHasNoClaimProof('yes');
                        if (dlSkipped) setTimeout(() => setSurveyStep(3), 300);
                      }}
                      className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        hasNoClaimProof === 'yes' ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-[#EFEFEF] text-[#2D2D2D]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Yes, I have it
                    </button>
                    <button
                      onClick={() => {
                        setHasNoClaimProof('no');
                        if (dlSkipped) setTimeout(() => setSurveyStep(3), 300);
                      }}
                      className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        hasNoClaimProof === 'no' ? 'bg-[#2D2D2D] text-[#D4D4D4]' : 'bg-[#F7F7F7] text-[#2D2D2D]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      No
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Q4: DL retry (if skipped) */}
              {surveyStep === 3 && (
                <motion.div
                  key="q4-dl-retry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[10px] p-4 flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-[8px] bg-[#F5F5F5] flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-[#666666]" />
                  </div>
                  <p className="text-sm text-[#2D2D2D] mb-1">Last step — Upload your Driving License</p>
                  <p className="text-[11px] text-[#2D2D2D]/40 mb-4">Get more accurate quotes with your DL details</p>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setShowDLSheet(true)}
                      className="flex-1 h-10 rounded-xl bg-[#2D2D2D] text-[#D4D4D4] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload DL
                    </button>
                    <button
                      onClick={() => {
                        setDlSkipped(false);
                      }}
                      className="flex-1 h-10 rounded-xl bg-[#F7F7F7] text-[#2D2D2D]/60 text-sm transition-all active:scale-[0.98] flex items-center justify-center"
                    >
                      Upload Later
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
