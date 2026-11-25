'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { CaptchaGridTile } from '@/data/questions';

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

const NEON_TILE_ACCENTS = [
  'border-cyan-400/50 bg-slate-900/90 hover:border-cyan-300',
  'border-fuchsia-400/50 bg-slate-900/90 hover:border-fuchsia-300',
  'border-emerald-400/50 bg-slate-900/90 hover:border-emerald-300',
  'border-amber-400/50 bg-slate-900/90 hover:border-amber-300',
  'border-sky-400/50 bg-slate-900/90 hover:border-sky-300',
  'border-violet-400/50 bg-slate-900/90 hover:border-violet-300',
  'border-rose-400/50 bg-slate-900/90 hover:border-rose-300',
  'border-teal-400/50 bg-slate-900/90 hover:border-teal-300',
  'border-indigo-400/50 bg-slate-900/90 hover:border-indigo-300',
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
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    if (verified) return;
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

    setVerified(true);
    setPassed(isFullPass);
    onComplete(isFullPass, { selectedIds, verified: true, passed: isFullPass });
  };

  const isDarkNeon = theme === 'dark-neon';
  const isPurpleBlue = theme === 'purple-blue';
  const isLogoGrid = isPurpleBlue;

  const wrapperClass = isDarkNeon
    ? 'bg-slate-950 text-white border-cyan-500/30'
    : isPurpleBlue
    ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white border-indigo-400/40'
    : 'bg-white text-[#0f2942] border-slate-200';

  return (
    <section className={`rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden ${wrapperClass}`}>
      {/* Compact CAPTCHA Header */}
      <div
        className={`px-4 py-2.5 sm:px-5 sm:py-3 [@media(max-height:660px)]:py-2 ${
          isDarkNeon
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-cyan-500/25'
            : isPurpleBlue
            ? 'bg-white/10 border-b border-white/15'
            : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white'
        }`}
        style={
          isDarkNeon
            ? {
                backgroundImage:
                  'radial-gradient(rgba(34,211,238,0.16) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }
            : isPurpleBlue
            ? {
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }
            : undefined
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-90">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Verification CAPTCHA</span>
          </div>
          <span className="text-xs opacity-90 font-medium">{instruction}</span>
        </div>
        <h2
          className="mt-0.5 font-display text-base sm:text-xl [@media(max-height:660px)]:text-base font-bold leading-snug"
          style={{ textWrap: 'balance' }}
        >
          {question}
        </h2>
      </div>

      {/* 3x3 Grid sized for IRA Duo 8-inch tablet (portrait & landscape, zero scroll) */}
      <div className={`p-3 sm:p-4 [@media(max-height:660px)]:p-2.5 ${isPurpleBlue ? 'bg-white/95 text-[#0f2942]' : ''}`}>
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 [@media(max-height:660px)]:gap-1.5">
          {randomizedTiles.map((tile, idx) => {
            const isSelected = selectedIds.includes(tile.id);

            let stateStyle = '';
            if (verified) {
              if (tile.isCorrect) {
                stateStyle = isDarkNeon
                  ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-400/50'
                  : 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30';
              } else if (isSelected && !tile.isCorrect) {
                stateStyle = isDarkNeon
                  ? 'border-red-500 bg-red-950/80 ring-2 ring-red-500/50'
                  : 'border-red-600 bg-red-50 ring-2 ring-red-500/30';
              } else {
                stateStyle = isDarkNeon
                  ? 'border-slate-800 bg-slate-900/50 opacity-55'
                  : 'border-slate-200 bg-slate-50 opacity-60';
              }
            } else if (isSelected) {
              stateStyle = isDarkNeon
                ? 'border-blue-400 bg-blue-950/70 ring-2 ring-blue-400/60 scale-[0.98]'
                : 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 scale-[0.98]';
            } else {
              stateStyle = isDarkNeon
                ? NEON_TILE_ACCENTS[idx % NEON_TILE_ACCENTS.length]
                : 'border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm';
            }

            return (
              <button
                key={tile.id}
                type="button"
                disabled={verified}
                onClick={() => toggleTile(tile.id)}
                className={`relative rounded-xl border-2 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${stateStyle} ${
                  isDarkNeon
                    ? 'h-[64px] sm:h-[76px] [@media(max-height:660px)]:h-[52px] flex items-center justify-center p-2 text-center'
                    : isLogoGrid
                    ? 'p-2 [@media(max-height:660px)]:p-1.5 flex flex-col items-center justify-center gap-1 h-[84px] sm:h-[94px] [@media(max-height:660px)]:h-[66px]'
                    : 'p-1.5 [@media(max-height:660px)]:p-1 flex flex-col items-center text-center gap-1'
                } ${!verified ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'}`}
              >
                {isSelected && !verified && (
                  <span
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs z-10"
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                {verified && tile.isCorrect && (
                  <span
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs z-10"
                    aria-hidden="true"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                {verified && isSelected && !tile.isCorrect && (
                  <span
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs z-10"
                    aria-hidden="true"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </span>
                )}

                {tile.imageSrc && isLogoGrid && (
                  <div className="w-9 h-9 sm:w-11 sm:h-11 [@media(max-height:660px)]:w-7 [@media(max-height:660px)]:h-7 flex items-center justify-center shrink-0">
                    <img
                      src={tile.imageSrc}
                      alt={tile.label}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {tile.imageSrc && !isLogoGrid && (
                  <div className="w-full h-14 sm:h-[72px] [@media(max-height:660px)]:h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={tile.imageSrc}
                      alt={tile.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <span
                  className={
                    isDarkNeon
                      ? 'text-xs sm:text-sm font-bold leading-tight text-white px-1'
                      : isLogoGrid
                      ? 'text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight line-clamp-1'
                      : 'text-[10px] sm:text-xs font-semibold text-slate-800 leading-tight line-clamp-2 [@media(max-height:660px)]:line-clamp-1'
                  }
                >
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Bar OR Instant Feedback Banner (swapped in-place to avoid vertical growth/scrolling) */}
        {!verified ? (
          <div
            className={`mt-2.5 pt-2.5 [@media(max-height:660px)]:mt-2 [@media(max-height:660px)]:pt-2 border-t flex items-center justify-between gap-3 ${
              isDarkNeon ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`text-xs sm:text-sm font-semibold tabular-nums ${
                  isDarkNeon ? 'text-cyan-300' : 'text-slate-600'
                }`}
              >
                {selectedIds.length} {selectedIds.length === 1 ? 'tile' : 'tiles'} selected
              </span>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className={`inline-flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                    isDarkNeon
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={selectedIds.length === 0}
              onClick={handleVerify}
              className={`min-h-[44px] sm:min-h-[48px] px-7 py-2 text-sm sm:text-base font-bold tracking-wide rounded-xl transition-all ${
                selectedIds.length === 0
                  ? isDarkNeon
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer active:scale-[0.97]'
              }`}
            >
              VERIFY
            </button>
          </div>
        ) : (
          <div
            aria-live="polite"
            className={`quiz-fade-in mt-2.5 [@media(max-height:660px)]:mt-2 rounded-xl border p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              passed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2 min-w-0 flex-1">
              {passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs sm:text-sm font-bold leading-snug">
                  {passed
                    ? 'Correct Answer!'
                    : 'Not quite! Correct answers are highlighted in green.'}
                </p>
                {explanation && (
                  <p className="text-xs leading-snug opacity-90">{explanation}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedNext}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] active:scale-[0.97] rounded-xl transition-all cursor-pointer shrink-0"
            >
              <span>{isLastQuestion ? 'View Score' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
