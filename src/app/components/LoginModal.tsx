import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

export function LoginModal({ onClose, onUnlock, quotesCount }: { onClose: () => void; onUnlock: () => void; quotesCount?: number }) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');

  const formatUAEPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatUAEPhone(e.target.value));
  };

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneValid = phoneDigits.length === 9 && phoneDigits.startsWith('5');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-[#0F1113]/45" onClick={onClose} />
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 z-10 border border-[#D6DADE]"
      >
        {/* Handle (mobile) */}
        <div className="flex justify-center mb-2 sm:hidden">
          <div className="w-10 h-1 bg-[#D6DADE] rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-3 px-0 py-0">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[16px] font-bold text-[#3A3F45] leading-tight">
              {step === 'phone'
                ? quotesCount
                  ? `Sign in to unlock all ${quotesCount} quotes`
                  : 'Sign in'
                : 'Enter OTP'}
            </h3>
            {quotesCount && step === 'phone' && (
              <p className="text-[12px] font-normal text-[#8A919A]">
                Compare plans and buy your policy instantly
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F3F5F7] flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-[#5E6670]" />
          </button>
        </div>

        {step === 'phone' ? (
          <>
            <p className="text-[12px] text-[#8A919A] mb-2">
              Enter your UAE mobile number to continue
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-12 px-3 rounded-xl bg-[#F3F5F7] flex items-center gap-1.5 text-sm text-[#0F1113]">
                🇦🇪 +971
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="50 123 4567"
                maxLength={12}
                className="flex-1 h-12 px-4 rounded-xl bg-[#F3F5F7] text-sm text-[#0F1113] placeholder:text-[#B0B6BE] outline-none focus:ring-2 focus:ring-[#B0B6BE]"
              />
            </div>
            <button
              onClick={() => setStep('otp')}
              disabled={!phoneValid}
              className={`w-full h-12 rounded-xl flex items-center justify-center text-sm transition-all ${
                phoneValid
                  ? 'bg-[#0F1113] text-[#FFFFFF] active:scale-[0.98]'
                  : 'bg-[#F3F5F7] text-[#B0B6BE] cursor-not-allowed'
              }`}
            >
              Send OTP
            </button>
            {quotesCount && (
              <button
                onClick={() => {
                  if (phoneValid) onUnlock();
                }}
                disabled={!phoneValid}
                className={`w-full h-12 flex items-center justify-center text-sm transition-all mt-1 ${
                  phoneValid
                    ? 'text-[#0F1113] active:scale-[0.98]'
                    : 'text-[#B0B6BE] cursor-not-allowed'
                }`}
              >
                Continue without OTP
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-[12px] text-[#8A919A] mb-4">
              We sent a 4-digit code to +971 {phone}
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="• • • •"
              maxLength={4}
              className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl bg-[#F3F5F7] text-[#0F1113] placeholder:text-[#D6DADE] outline-none focus:ring-2 focus:ring-[#B0B6BE] mb-4"
            />
            <button
              onClick={() => onUnlock()}
              disabled={otp.length < 4}
              className={`w-full h-12 rounded-xl flex items-center justify-center text-sm transition-all ${
                otp.length >= 4
                  ? 'bg-[#0F1113] text-[#FFFFFF] active:scale-[0.98]'
                  : 'bg-[#F3F5F7] text-[#B0B6BE] cursor-not-allowed'
              }`}
            >
              Verify & Unlock Quotes
            </button>
            <button
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-[#5E6670] mt-3 hover:text-[#3A3F45]"
            >
              Change number
            </button>
          </>
        )}

        <p className="text-[10px] text-[#5E6670] text-center mt-4">
          By signing in, you agree to our <a href="#" className="underline text-[#0F1113]">Terms of Service</a> & <a href="#" className="underline text-[#0F1113]">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}
