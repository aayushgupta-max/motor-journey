import { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginModal } from './LoginModal';
import { useAuth } from './AuthContext';

export function Header() {
  const { isLoggedIn, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAvatarMenu(false);
      }
    }
    if (showAvatarMenu) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showAvatarMenu]);

  const handleUnlock = () => {
    login();
    setShowLogin(false);
  };

  const handleLogout = () => {
    logout();
    setShowAvatarMenu(false);
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="bg-[#0F1113] sticky top-0 z-50 border-b border-[#1D1E20]">
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
              {isLoggedIn ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                    className="w-9 h-9 rounded-full bg-[#F3F5F7] flex items-center justify-center hover:bg-[#D6DADE] transition-colors cursor-pointer"
                  >
                    <User className="w-4.5 h-4.5 text-[#0F1113]" />
                  </button>
                  <AnimatePresence>
                    {showAvatarMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-20 bg-[#FFFFFF] rounded-xl border border-[#D6DADE] py-1 min-w-[160px] overflow-hidden shadow-lg shadow-black/10"
                      >
                        <button
                          onClick={() => {
                            setShowAvatarMenu(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-[#4B525A] hover:bg-[#F3F5F7] flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm bg-[#F3F5F7] text-[#0F1113] h-9 px-4 rounded-full hover:bg-[#D6DADE] transition-colors cursor-pointer flex items-center"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onUnlock={handleUnlock}
        />
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F1113]/45"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#FFFFFF] rounded-2xl p-6 mx-4 max-w-xs w-full text-center z-10 shadow-xl border border-[#D6DADE]"
            >
              <div className="w-12 h-12 rounded-full bg-[#F3F5F7] flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-5 h-5 text-[#0F1113]" />
              </div>
              <h3 className="text-sm font-medium text-[#0F1113] mb-1">Sign out?</h3>
              <p className="text-xs text-[#5E6670] mb-4">
                Are you sure you want to sign out? You'll need to sign in again to access your quotes.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-10 rounded-xl bg-[#F3F5F7] text-[#0F1113] text-sm transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-10 rounded-xl bg-[#0F1113] text-[#FFFFFF] text-sm transition-all active:scale-[0.98]"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
