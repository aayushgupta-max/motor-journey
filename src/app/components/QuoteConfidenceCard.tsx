import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Check, X, Upload, Calendar, ShieldCheck, MessageSquare } from 'lucide-react';

// Simple free-text parser for survey answers
function parseGccInput(text: string): 'yes' | 'no' | null {
  const t = text.toLowerCase().trim();
  if (/gcc|gulf|spec|local|yes/.test(t)) return 'yes';
  if (/non|import|no|japan|usa|american|european/.test(t)) return 'no';
  return null;
}

function parseClaimInput(text: string): string | null {
  const t = text.toLowerCase().trim();
  if (/never|no claim|none|clean|0/.test(t)) return 'Never claimed';
  if (/year|12|long|while/.test(t)) return '12+ months';
  if (/6|half|few month/.test(t)) return '6–12 months';
  if (/recent|last month|just|less/.test(t)) return 'Less than 6 months';
  return null;
}

function parseNoClaimProofInput(text: string): 'yes' | 'no' | null {
  const t = text.toLowerCase().trim();
  if (/yes|have|got/.test(t)) return 'yes';
  if (/no|don|nope/.test(t)) return 'no';
  return null;
}

interface QuoteConfidenceCardProps {
  quotesCount: number;
  plansCount: number;
  answeredCount: number;
  totalDataPoints: number;
  allSurveyDone: boolean;
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

// Collapsed answer pill
function ConfirmedAnswer({ label, value, onEdit }: { label: string; value: string; onEdit?: () => void }) {
  return (
    <div className="flex items-center justify-between bg-[#FFFFFF]/70 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <Check className="w-3 h-3 text-[#0F1113]" />
        <span className="text-xs text-[#4B525A]">{label}</span>
        <span className="text-xs font-medium text-[#0F1113]">{value}</span>
      </div>
    </div>
  );
}

// Inline text input for free-text answers
function SmartInput({ placeholder, onSubmit }: { placeholder: string; onSubmit: (text: string) => boolean }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const success = onSubmit(text);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="mt-2">
      <div className={`flex items-center gap-2 bg-[#FAFBFC] rounded-lg px-3 h-9 transition-colors ${error ? 'ring-1 ring-red-300' : 'ring-1 ring-[#D6DADE]'}`}>
        <MessageSquare className="w-3 h-3 text-[#8A919A] flex-shrink-0" />
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-[#0F1113] placeholder:text-[#B0B6BE] outline-none"
        />
        {text && (
          <button onClick={handleSubmit} className="text-[10px] font-medium text-[#0F1113] bg-[#D6DADE] px-2 py-0.5 rounded-full flex-shrink-0">
            Send
          </button>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-red-400 mt-1 ml-1">Didn't catch that — try tapping an option above</p>
      )}
    </div>
  );
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

  const baselineScore = totalDataPoints - 4;
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
            background: 'conic-gradient(from var(--border-angle, 0deg), transparent 60%, #D6DADE 78%, #4B525A 82%, #D6DADE 86%, transparent 95%)',
            animation: 'shooting-star-spin 3s linear infinite',
          }}
        />
      )}

      <div
        className={`relative rounded-[18px] p-4`}
        style={{
          background: allSurveyDone
            ? 'linear-gradient(135deg, #FAFBFC 0%, #D6DADE 100%)'
            : 'linear-gradient(135deg, #F3F5F7 0%, #B0B6BE 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="relative" style={{ width: 48, height: 48 }}>
              <svg width={48} height={48} className="-rotate-90">
                <circle cx={24} cy={24} r={20} fill="white" stroke="#D6DADE" strokeWidth={3} />
                <motion.circle
                  cx={24} cy={24} r={20}
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
                  <Check className="w-5 h-5 text-[#0F1113]" />
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-[#4B525A] fill-[#4B525A]" />
                    <motion.span
                      key={confidencePct}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[10px] font-bold text-[#0F1113] leading-none mt-0.5"
                    >
                      {confidencePct}%
                    </motion.span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#0F1113]">
              {allSurveyDone ? 'Best price unlocked' : 'Low Quote Confidence Score'}
            </p>
            <p className="text-xs text-[#4B525A] leading-tight mt-0.5">
              {allSurveyDone
                ? 'Your quotes are now fully personalized'
                : remaining === 1
                  ? 'Last question to unlock better rates'
                  : `Answer ${remaining} quick questions to unlock better rates`}
            </p>
          </div>
        </div>

        {/* Confirmed answers stack */}
        {!allSurveyDone && (gccSelection !== null || dlUploaded || claimMonths !== null) && (
          <div className="mt-3 space-y-1">
            {gccSelection !== null && (
              <ConfirmedAnswer
                label="Spec"
                value={gccSelection === 'yes' ? 'GCC Spec' : 'Non-GCC'}
              />
            )}
            {dlUploaded && (
              <ConfirmedAnswer label="License" value="Uploaded" />
            )}
            {claimMonths !== null && (
              <ConfirmedAnswer label="Claims" value={claimMonths} />
            )}
            {hasNoClaimProof !== null && (
              <ConfirmedAnswer
                label="Certificate"
                value={hasNoClaimProof === 'yes' ? 'Yes' : 'No'}
              />
            )}
          </div>
        )}

        {/* Survey Questions */}
        {!allSurveyDone && (
          <div className="mt-3">
            <AnimatePresence mode="wait">
              {/* Q1: GCC Spec */}
              {surveyStep === 0 && (
                <motion.div
                  key="q1-gcc"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#FFFFFF] rounded-[10px] p-4"
                >
                  <p className="text-sm text-[#0F1113] mb-3">Is your car GCC spec or Non-GCC?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setGccSelection('yes');
                        setTimeout(() => setSurveyStep(1), 300);
                      }}
                      className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        gccSelection === 'yes' ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#F3F5F7] text-[#0F1113]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      GCC Spec
                    </button>
                    <button
                      onClick={() => {
                        setGccSelection('no');
                        setTimeout(() => setSurveyStep(1), 300);
                      }}
                      className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        gccSelection === 'no' ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FAFBFC] text-[#0F1113]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      Non-GCC
                    </button>
                  </div>
                  <SmartInput
                    placeholder="or type: gcc, imported..."
                    onSubmit={(text) => {
                      const result = parseGccInput(text);
                      if (result) {
                        setGccSelection(result);
                        setTimeout(() => setSurveyStep(1), 300);
                        return true;
                      }
                      return false;
                    }}
                  />
                </motion.div>
              )}

              {/* Q2: DL Upload */}
              {surveyStep === 1 && (
                <motion.div
                  key="q2-dl-upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#FFFFFF] rounded-[10px] p-4 flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-[8px] bg-[#F3F5F7] flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-[#5E6670]" />
                  </div>
                  <p className="text-sm text-[#0F1113] mb-1">Upload your Driving License</p>
                  <p className="text-[11px] text-[#5E6670] mb-4">We'll auto-fill your details instantly</p>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setShowDLSheet(true)}
                      className="flex-1 h-10 rounded-[8px] bg-[#0F1113] text-[#FFFFFF] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload DL
                    </button>
                    <button
                      onClick={() => {
                        setDlSkipped(true);
                        setSurveyStep(2);
                      }}
                      className="flex-1 h-10 rounded-[8px] bg-[#FAFBFC] text-[#5E6670] text-sm transition-all active:scale-[0.98] flex items-center justify-center"
                    >
                      Skip for now
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Q3: Claim months */}
              {surveyStep === 2 && (
                <motion.div
                  key="q3-claim-months"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#FFFFFF] rounded-[10px] p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-[#5E6670]" />
                    <p className="text-sm text-[#0F1113]">How long since your last claim?</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Never claimed', '12+ months', '6–12 months', 'Less than 6 months'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setClaimMonths(opt);
                          if (opt === 'Never claimed') {
                            setTimeout(() => setSurveyStep(3), 300);
                          } else {
                            setHasNoClaimProof(null);
                            if (dlSkipped) {
                              setTimeout(() => setSurveyStep(4), 300);
                            }
                          }
                        }}
                        className={`h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center ${
                          claimMonths === opt ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FAFBFC] text-[#0F1113]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <SmartInput
                    placeholder="or type: never, 2 years ago..."
                    onSubmit={(text) => {
                      const result = parseClaimInput(text);
                      if (result) {
                        setClaimMonths(result);
                        if (result === 'Never claimed') {
                          setTimeout(() => setSurveyStep(3), 300);
                        } else {
                          setHasNoClaimProof(null);
                          if (dlSkipped) {
                            setTimeout(() => setSurveyStep(4), 300);
                          }
                        }
                        return true;
                      }
                      return false;
                    }}
                  />
                </motion.div>
              )}

              {/* Q4: No claim proof */}
              {surveyStep === 3 && (
                <motion.div
                  key="q4-no-claim-proof"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#FFFFFF] rounded-[10px] p-4"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#5E6670]" />
                    <p className="text-sm text-[#0F1113]">Do you have a No Claim Certificate?</p>
                  </div>
                  <p className="text-[11px] text-[#5E6670] mb-3 ml-6">This can reduce your premium by up to 25%</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setHasNoClaimProof('yes');
                        if (dlSkipped) setTimeout(() => setSurveyStep(4), 300);
                      }}
                      className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        hasNoClaimProof === 'yes' ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#F3F5F7] text-[#0F1113]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Yes, I have it
                    </button>
                    <button
                      onClick={() => {
                        setHasNoClaimProof('no');
                        if (dlSkipped) setTimeout(() => setSurveyStep(4), 300);
                      }}
                      className={`flex-1 h-10 rounded-[8px] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 ${
                        hasNoClaimProof === 'no' ? 'bg-[#0F1113] text-[#FFFFFF]' : 'bg-[#FAFBFC] text-[#0F1113]'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      No
                    </button>
                  </div>
                  <SmartInput
                    placeholder="or type: yes, no..."
                    onSubmit={(text) => {
                      const result = parseNoClaimProofInput(text);
                      if (result) {
                        setHasNoClaimProof(result);
                        if (dlSkipped) setTimeout(() => setSurveyStep(4), 300);
                        return true;
                      }
                      return false;
                    }}
                  />
                </motion.div>
              )}

              {/* Q5: DL Upload retry */}
              {surveyStep === 4 && (
                <motion.div
                  key="q5-dl-retry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#FFFFFF] rounded-[10px] p-4 flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-[8px] bg-[#F3F5F7] flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-[#5E6670]" />
                  </div>
                  <p className="text-sm text-[#0F1113] mb-1">Last step — Upload your Driving License</p>
                  <p className="text-[11px] text-[#5E6670] mb-4">Get more accurate quotes with your DL details</p>
                  <button
                    onClick={() => setShowDLSheet(true)}
                    className="w-full h-10 rounded-[8px] bg-[#0F1113] text-[#FFFFFF] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload DL
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
