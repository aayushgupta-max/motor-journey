import { useState } from 'react';
import { Shield } from 'lucide-react';
import { LoginModal } from './LoginModal';

export function Header() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="bg-[#163300] sticky top-0 z-50">
        <div className="container mx-auto px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#9FE870] rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#163300]" />
              </div>
              <span className="text-lg tracking-tight text-white">Policybazaar.ae</span>
            </div>

            <div className="flex items-center gap-5">
              <a href="#" className="text-sm text-white/70 hover:text-white transition-colors hidden sm:block">
                Support
              </a>
              <button
                onClick={() => setShowLogin(true)}
                className="text-sm bg-[#9FE870] text-[#163300] px-4 py-1.5 rounded-full hover:bg-[#b8f09a] transition-colors cursor-pointer"
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
