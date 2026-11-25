'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CaptchaGridTile } from '@/data/questions';
import {
  playCorrectSound,
  playIncorrectSound,
  playTapSound,
  playTileToggleSound,
} from '@/lib/quizAudio';

export interface GridSavedState {
  selectedIds: string[];
  verified: boolean;
  passed: boolean;
}

interface CaptchaGridChallengeProps {
  questionId: number;
  shuffleSeed: number;
  question: string;
  instruction: string;
  theme: 'purple-blue' | 'dark-neon' | 'blue-captcha';
  tiles: CaptchaGridTile[];
  explanation?: string;
  isLastQuestion: boolean;
  savedState?: GridSavedState;
  onComplete: (isCorrect: boolean, state: GridSavedState) => void;
  onProceedNext: () => void;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const COLORFUL_WHITE_TILE_ACCENTS = [
  'border-cyan-400 bg-white hover:border-cyan-500 hover:bg-cyan-50/40',
  'border-fuchsia-400 bg-white hover:border-fuchsia-500 hover:bg-fuchsia-50/40',
  'border-emerald-400 bg-white hover:border-emerald-500 hover:bg-emerald-50/40',
  'border-amber-400 bg-white hover:border-amber-500 hover:bg-amber-50/40',
  'border-sky-400 bg-white hover:border-sky-500 hover:bg-sky-50/40',
  'border-violet-400 bg-white hover:border-violet-500 hover:bg-violet-50/40',
  'border-rose-400 bg-white hover:border-rose-500 hover:bg-rose-50/40',
  'border-teal-400 bg-white hover:border-teal-500 hover:bg-teal-50/40',
  'border-indigo-400 bg-white hover:border-indigo-500 hover:bg-indigo-50/40',
];

export function CaptchaGridChallenge({
  questionId,
  shuffleSeed,
  question,
  instruction,
  theme,
  tiles,
  explanation,
  isLastQuestion,
  savedState,
  onComplete,
  onProceedNext,
}: CaptchaGridChallengeProps) {
  const randomizedTiles = useMemo(
    () => seededShuffle(tiles, shuffleSeed + questionId * 97),
    [tiles, shuffleSeed, questionId]
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(savedState?.selectedIds ?? []);
  const [verified, setVerified] = useState<boolean>(savedState?.verified ?? false);
  const [passed, setPassed] = useState<boolean>(savedState?.passed ?? false);

  const toggleTile = (id: string) => {
    if (verified) return;
    const willSelect = !selectedIds.includes(id);
    playTileToggleSound(willSelect);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    if (verified) return;
    playTapSound();
    setSelectedIds([]);
  };

  const handleVerify = () => {
    if (verified || selectedIds.length === 0) return;

    const correctIds = randomizedTiles.filter((t) => t.isCorrect).map((t) => t.id);
    const allCorrectSelected = correctIds.every((id) => selectedIds.includes(id));
    const noWrongSelected = selectedIds.every((id) =>
      randomizedTiles.find((t) => t.id === id)?.isCorrect
    );
    const isFullPass = allCorrectSelected && noWrongSelected;

    if (isFullPass) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    setVerified(true);
    setPassed(isFullPass);
    onComplete(isFullPass, { selectedIds, verified: true, passed: isFullPass });
  };

  const isTextTerms = theme === 'dark-neon';
  const isPurpleBlue = theme === 'purple-blue';
  const isLogoGrid = isPurpleBlue;

  const wrapperClass = isPurpleBlue
    ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white border-indigo-400/40'
    : 'bg-white text-[#0f2942] border-slate-200';

  const leftPanelBg = isTextTerms
    ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white'
    : isPurpleBlue
    ? 'bg-white/10 border-b landscape:border-b-0 landscape:border-r border-white/20 text-white'
    : 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white';

  const patternStyle = isTextTerms || isPurpleBlue
    ? {
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }
    : undefined;

  return (
    <section
      className={`rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden flex flex-col landscape:grid landscape:grid-cols-12 ${wrapperClass}`}
    >
      {/* Left Column in Landscape */}
      <div
        className={`landscape:col-span-5 flex flex-col justify-between gap-4 p-4 sm:p-5 ${leftPanelBg}`}
        style={patternStyle}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-90">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Verification CAPTCHA</span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-bold leading-snug">
            {question}
          </h2>

          <p className="text-sm sm:text-base opacity-95 font-medium leading-snug">
            {instruction}
          </p>
        </div>

        {!verified ? (
          <div className="pt-3 border-t border-white/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base font-semibold tabular-nums">
                {selectedIds.length} {selectedIds.length === 1 ? 'tile' : 'tiles'} selected
              </span>
              {selectedIds.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-semibold px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </motion.button>
              )}
            </div>

            <motion.button
              whileTap={selectedIds.length > 0 ? { scale: 0.96 } : undefined}
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleVerify}
              className={`w-full min-h-[50px] px-6 py-2.5 text-base sm:text-lg font-bold tracking-wide rounded-xl transition-colors ${
                selectedIds.length === 0
                  ? 'bg-white/20 text-white/50 cursor-not-allowed'
                  : 'bg-white text-[#0f2942] hover:bg-slate-100 shadow-sm cursor-pointer'
              }`}
            >
              VERIFY
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 360, damping: 24 }}
            aria-live="polite"
            className={`rounded-2xl border p-3.5 sm:p-4 space-y-3 ${
              passed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {passed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <p className="text-base sm:text-lg font-bold leading-snug">
                  {passed
                    ? 'Correct Answer!'
                    : 'Not quite! Correct answers are green.'}
                </p>
                {explanation && (
                  <p className="text-sm sm:text-base leading-snug opacity-95">
                    {explanation}
                  </p>
                )}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onProceedNext}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-2 text-base font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-xl transition-colors cursor-pointer"
            >
              <span>{isLastQuestion ? 'View Score' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Right Column in Landscape: Clean White-Fill 3x3 Grid */}
      <div className="landscape:col-span-7 p-3.5 sm:p-4 flex flex-col justify-center bg-white text-[#0f2942]">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {randomizedTiles.map((tile, idx) => {
            const isSelected = selectedIds.includes(tile.id);

            let stateStyle = '';
            if (verified) {
              if (tile.isCorrect) {
                stateStyle =
                  'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30';
              } else if (isSelected && !tile.isCorrect) {
                stateStyle =
                  'border-red-600 bg-red-50 ring-2 ring-red-500/30';
              } else {
                stateStyle = 'border-slate-200 bg-slate-50 opacity-60';
              }
            } else if (isSelected) {
              stateStyle =
                'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/30';
            } else {
              stateStyle = isTextTerms
                ? COLORFUL_WHITE_TILE_ACCENTS[idx % COLORFUL_WHITE_TILE_ACCENTS.length]
                : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm';
            }

            return (
              <motion.button
                key={tile.id}
                whileTap={!verified ? { scale: 0.93 } : undefined}
                animate={{ scale: isSelected && !verified ? 0.97 : 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                type="button"
                disabled={verified}
                onClick={() => toggleTile(tile.id)}
                className={`relative rounded-xl border-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${stateStyle} ${
                  isTextTerms
                    ? 'min-h-[84px] sm:min-h-[96px] flex items-center justify-center p-2.5 text-center'
                    : isLogoGrid
                    ? 'min-h-[96px] sm:min-h-[108px] p-2.5 flex flex-col items-center justify-center gap-1.5 text-center'
                    : 'p-1.5 sm:p-2 flex flex-col items-center text-center gap-1.5'
                } ${!verified ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {isSelected && !verified && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs z-10"
                    aria-hidden="true"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.span>
                )}
                {verified && tile.isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs z-10"
                    aria-hidden="true"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </motion.span>
                )}
                {verified && isSelected && !tile.isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs z-10"
                    aria-hidden="true"
                  >
                    <XCircle className="w-4 h-4" />
                  </motion.span>
                )}

                {tile.imageSrc && isLogoGrid && (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
                    <img
                      src={tile.imageSrc}
                      alt={tile.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {tile.imageSrc && !isLogoGrid && (
                  <div className="w-full h-20 sm:h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={tile.imageSrc}
                      alt={tile.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <span
                  className={
                    isTextTerms
                      ? 'text-sm sm:text-base lg:text-lg font-bold leading-tight text-[#0f2942] px-1'
                      : isLogoGrid
                      ? 'text-xs sm:text-sm font-bold text-slate-800 leading-tight line-clamp-1'
                      : 'text-xs sm:text-sm font-semibold text-slate-800 leading-tight line-clamp-2'
                  }
                >
                  {tile.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
