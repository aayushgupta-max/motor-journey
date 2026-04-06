import { useState } from 'react';
import { Shield } from 'lucide-react';
import { LoginModal } from './LoginModal';

export function Header() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="bg-[#2D2D2D] sticky top-0 z-50">
        <div className="container mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://media.licdn.com/dms/image/v2/D4D0BAQEnyiEqDMO8Ag/company-logo_200_200/company-logo_200_200/0/1683192614764/policybazaaruae_logo?e=2147483647&v=beta&t=1-X2jTTLNBBtC8eztlbqopNdv6rt1TTK23jTp0Y8FbY"
                alt="Policybazaar"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-lg tracking-tight text-white">Policybazaar.ae</span>
            </div>

            <div className="flex items-center gap-5">
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block">
                Support
              </a>
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm bg-[#D4D4D4] text-[#2D2D2D] px-4 py-1.5 rounded-full hover:bg-[#E8E8E8] transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </header>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onUnlock={() => setShowLogin(false)}
        />
      )}
    </>
  );
}
