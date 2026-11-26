'use client';

import { useState } from 'react';
import { Download, Maximize2, Minimize2, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { motion } from 'motion/react';
import { playTapSound } from '@/lib/quizAudio';

interface PWAInstallButtonProps {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
  compact?: boolean;
}

export function PWAInstallButton({
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
  compact = false,
}: PWAInstallButtonProps) {
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <motion.button
        whileTap={{ scale: 0.94 }}
        type="button"
        onClick={() => {
          playTapSound();
          void onInstall();
        }}
        className={
          compact
            ? 'inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-[#0d9488] bg-[#0d9488] text-white hover:bg-[#0b7e74] transition-colors cursor-pointer'
            : 'w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[52px] sm:min-h-[64px] px-6 sm:px-8 py-3.5 text-base sm:text-xl font-semibold rounded-2xl border-2 border-[#0d9488] bg-teal-50 text-[#0f2942] hover:bg-teal-100 transition-colors cursor-pointer'
        }
      >
        <Download className={compact ? 'w-4 h-4' : 'w-5 h-5 text-[#0d9488]'} />
        <span>{compact ? 'Install' : 'Install Tablet App'}</span>
      </motion.button>
    );
  }

  if (isIOS) {
    return (
      <>
        <motion.button
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => {
            playTapSound();
            setShowIOSGuide(true);
          }}
          className={
            compact
              ? 'inline-flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 transition-colors cursor-pointer'
              : 'w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[52px] sm:min-h-[64px] px-6 sm:px-8 py-3.5 text-base sm:text-xl font-semibold rounded-2xl border-2 border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 transition-colors cursor-pointer'
          }
        >
          <Smartphone className={compact ? 'w-4 h-4' : 'w-5 h-5 text-[#0d9488]'} />
          <span>{compact ? 'Add App' : 'Install on iPad / iPhone'}</span>
        </motion.button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-left space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h3
                  id="ios-install-title"
                  className="font-display text-xl font-bold text-[#0f2942]"
                >
                  Install AI Quiz on iPad / iPhone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close install instructions"
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ol className="space-y-3 text-base text-slate-700">
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-teal-50 text-[#0d9488] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <Share className="inline w-4 h-4 mx-0.5 text-[#0f2942]" />{' '}
                    <strong>Share</strong> button in Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-teal-50 text-[#0d9488] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-teal-50 text-[#0d9488] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Launch from your home screen for full-screen offline mode!
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[48px] rounded-xl bg-[#0f2942] hover:bg-[#163a5c] text-white font-semibold cursor-pointer transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

interface FullscreenButtonProps {
  canFullscreen: boolean;
  isFullscreen: boolean;
  onToggle: () => void;
  showLabel?: boolean;
}

export function FullscreenButton({
  canFullscreen,
  isFullscreen,
  onToggle,
  showLabel = false,
}: FullscreenButtonProps) {
  if (!canFullscreen) return null;

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      type="button"
      onClick={() => {
        playTapSound();
        onToggle();
      }}
      aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      title={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      className={
        showLabel
          ? 'inline-flex items-center justify-center gap-2 min-h-[42px] px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 transition-colors cursor-pointer'
          : 'inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 transition-colors cursor-pointer'
      }
    >
      {isFullscreen ? (
        <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
      {showLabel && <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>}
    </motion.button>
  );
}

export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;

  return (
    <div
      role="status"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold"
    >
      <WifiOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      <span>Offline Mode — Ready to Play</span>
    </div>
  );
}
