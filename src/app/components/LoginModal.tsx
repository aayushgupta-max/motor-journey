import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock } from 'lucide-react';

export function LoginModal({ onClose, onUnlock, quotesCount }: { onClose: () => void; onUnlock: () => void; quotesCount?: number }) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 z-10"
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center mb-2 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {quotesCount && step === 'phone' && (
              <div className="w-11 h-11 rounded-xl bg-[#F7F7F7] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-[#2D2D2D]" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-[#2D2D2D] leading-tight">
                {step === 'phone'
                  ? quotesCount
                    ? `Sign in to unlock all ${quotesCount} quotes`
                    : 'Sign in'
                  : 'Enter OTP'}
              </h3>
              {quotesCount && step === 'phone' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Compare plans and buy your policy instantly
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F7F7F7] flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {step === 'phone' ? (
          <>
            <p className="text-xs text-gray-500 mb-2">
              Enter your UAE mobile number to continue
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-12 px-3 rounded-xl bg-[#F7F7F7] flex items-center gap-1.5 text-sm text-[#2D2D2D]">
                🇦🇪 +971
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="50 123 4567"
                className="flex-1 h-12 px-4 rounded-xl bg-[#F7F7F7] text-sm text-[#2D2D2D] placeholder-gray-300 outline-none focus:ring-2 focus:ring-[#D4D4D4]"
              />
            </div>
            <button
              onClick={() => setStep('otp')}
              disabled={phone.length < 7}
              className={`w-full h-12 rounded-xl flex items-center justify-center text-sm transition-all ${
                phone.length >= 7
                  ? 'bg-[#2D2D2D] text-[#D4D4D4] active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              Send OTP
            </button>
            {quotesCount && (
              <button
                onClick={() => onUnlock()}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-600 transition-colors mt-3"
              >
                Submit without OTP
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              We sent a 4-digit code to +971 {phone}
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="• • • •"
              maxLength={4}
              className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl bg-[#F7F7F7] text-[#2D2D2D] placeholder-gray-200 outline-none focus:ring-2 focus:ring-[#D4D4D4] mb-4"
            />
            <button
              onClick={() => onUnlock()}
              disabled={otp.length < 4}
              className={`w-full h-12 rounded-xl flex items-center justify-center text-sm transition-all ${
                otp.length >= 4
                  ? 'bg-[#2D2D2D] text-[#D4D4D4] active:scale-[0.98]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              Verify & Unlock Quotes
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-gray-500 mt-3 hover:text-gray-600"
            >
              Change number
            </button>
          </>
        )}

        <p className="text-[10px] text-gray-300 text-center mt-4">
          By signing in, you agree to our Terms of Service & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
