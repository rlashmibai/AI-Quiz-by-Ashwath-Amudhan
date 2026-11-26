'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Link2, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CaptchaPairItem } from '@/data/questions';
import {
  playCorrectSound,
  playIncorrectSound,
  playPairConnectSound,
  playTapSound,
  playTileToggleSound,
} from '@/lib/quizAudio';

export interface PairsSavedState {
  connections: Record<string, string>;
  verified: boolean;
  passed: boolean;
}

interface CaptchaPairsChallengeProps {
  questionId: number;
  shuffleSeed: number;
  question: string;
  instruction: string;
  leftPairs: CaptchaPairItem[];
  rightPairs: Array<{ id: string; label: string; logoSrc: string }>;
  explanation?: string;
  isLastQuestion: boolean;
  savedState?: PairsSavedState;
  onComplete: (isCorrect: boolean, state: PairsSavedState) => void;
  onProceedNext: () => void;
}

interface LineCoords {
  leftId: string;
  rightId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

const PAIR_COLORS = ['#2563EB', '#9333EA', '#0D9488', '#EA580C'];

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

export function CaptchaPairsChallenge({
  questionId,
  shuffleSeed,
  question,
  instruction,
  leftPairs,
  rightPairs,
  explanation,
  isLastQuestion,
  savedState,
  onComplete,
  onProceedNext,
}: CaptchaPairsChallengeProps) {
  const randomizedLeft = useMemo(
    () => seededShuffle(leftPairs, shuffleSeed + questionId * 31),
    [leftPairs, shuffleSeed, questionId]
  );
  const randomizedRight = useMemo(
    () => seededShuffle(rightPairs, shuffleSeed + questionId * 79),
    [rightPairs, shuffleSeed, questionId]
  );

  const [activeLeftId, setActiveLeftId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, string>>(
    savedState?.connections ?? {}
  );
  const [verified, setVerified] = useState<boolean>(savedState?.verified ?? false);
  const [passed, setPassed] = useState<boolean>(savedState?.passed ?? false);
  const [lines, setLines] = useState<LineCoords[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const computeLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const nextLines: LineCoords[] = [];
    Object.entries(connections).forEach(([leftId, rightId]) => {
      const leftEl = leftRefs.current[leftId];
      const rightEl = rightRefs.current[rightId];
      if (!leftEl || !rightEl) return;

      const lRect = leftEl.getBoundingClientRect();
      const rRect = rightEl.getBoundingClientRect();
      const colorIdx = randomizedLeft.findIndex((item) => item.id === leftId);

      nextLines.push({
        leftId,
        rightId,
        x1: lRect.right - containerRect.left,
        y1: lRect.top + lRect.height / 2 - containerRect.top,
        x2: rRect.left - containerRect.left,
        y2: rRect.top + rRect.height / 2 - containerRect.top,
        color: PAIR_COLORS[Math.max(0, colorIdx) % PAIR_COLORS.length],
      });
    });

    setLines(nextLines);
  }, [connections, randomizedLeft]);

  useLayoutEffect(() => {
    computeLines();
  }, [computeLines]);

  useEffect(() => {
    const container = containerRef.current;
    const handleResize = () => computeLines();
    window.addEventListener('resize', handleResize);

    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => computeLines());
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [computeLines]);

  const handleLeftTap = (leftId: string) => {
    if (verified) return;
    const willSelect = activeLeftId !== leftId;
    playTileToggleSound(willSelect);
    setActiveLeftId((prev) => (prev === leftId ? null : leftId));
  };

  const handleRightTap = (rightId: string) => {
    if (verified) return;

    if (!activeLeftId) {
      const existingLeft = Object.keys(connections).find((k) => connections[k] === rightId);
      if (existingLeft) {
        playTileToggleSound(false);
        setConnections((prev) => {
          const copy = { ...prev };
          delete copy[existingLeft];
          return copy;
        });
      }
      return;
    }

    playPairConnectSound();
    setConnections((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === rightId) {
          delete next[key];
        }
      }
      next[activeLeftId] = rightId;
      return next;
    });
    setActiveLeftId(null);
  };

  const handleReset = () => {
    if (verified) return;
    playTapSound();
    setActiveLeftId(null);
    setConnections({});
  };

  const connectedCount = Object.keys(connections).length;
  const allConnected = connectedCount === randomizedLeft.length;

  const handleVerify = () => {
    if (verified || !allConnected) return;
    const allMatch = randomizedLeft.every((item) => connections[item.id] === item.matchId);

    if (allMatch) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    setVerified(true);
    setPassed(allMatch);
    onComplete(allMatch, { connections, verified: true, passed: allMatch });
  };

  const getRightLabel = (rightId: string) =>
    randomizedRight.find((r) => r.id === rightId)?.label ?? '';

  return (
    <section className="flex-1 rounded-2xl sm:rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 text-white shadow-sm overflow-hidden flex flex-col min-[820px]:landscape:grid min-[820px]:landscape:grid-cols-12 lg:grid lg:grid-cols-12">
      {/* Left Column in Landscape Tablet & Laptop */}
      <div className="min-[820px]:landscape:col-span-5 lg:col-span-5 flex flex-col justify-between gap-3.5 sm:gap-4 p-4 sm:p-5 lg:p-6 bg-white/10 border-b min-[820px]:landscape:border-b-0 min-[820px]:landscape:border-r lg:border-b-0 lg:border-r border-white/20">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider opacity-90">
            <ShieldCheck className="w-4 h-4" />
            <span>Connect-the-Pairs CAPTCHA</span>
          </div>

          <h2 className="font-display text-lg sm:text-2xl lg:text-[1.65rem] font-bold leading-snug">
            {question}
          </h2>

          <p className="text-xs sm:text-base opacity-95 font-medium leading-snug">
            {instruction}
          </p>
        </div>

        {!verified ? (
          <div className="pt-2.5 sm:pt-3 border-t border-white/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-base font-semibold tabular-nums">
                <Link2 className="w-4 h-4" />
                <span>
                  {connectedCount} / {randomizedLeft.length} pairs matched
                </span>
              </span>

              {connectedCount > 0 && (
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Reset</span>
                </motion.button>
              )}
            </div>

            <motion.button
              whileTap={allConnected ? { scale: 0.96 } : undefined}
              type="button"
              disabled={!allConnected}
              onClick={handleVerify}
              className={`w-full min-h-[46px] sm:min-h-[50px] px-6 py-2.5 text-sm sm:text-lg font-bold tracking-wide rounded-xl transition-colors ${
                !allConnected
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
            className={`rounded-2xl border p-3 sm:p-4 space-y-2.5 sm:space-y-3 ${
              passed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {passed ? (
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <p className="text-sm sm:text-lg font-bold leading-snug">
                  {passed
                    ? 'Correct Answer! All pairs matched!'
                    : 'ChatGPT → OpenAI · Gemini → Google · Claude → Anthropic · Llama → Meta'}
                </p>
                {explanation && (
                  <p className="text-xs sm:text-base leading-snug opacity-95">
                    {explanation}
                  </p>
                )}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onProceedNext}
              className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px] px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-xl transition-colors cursor-pointer"
            >
              <span>{isLastQuestion ? 'View Score' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Right Column in Landscape Tablet & Laptop: 2-Column Matching Canvas */}
      <div className="min-[820px]:landscape:col-span-7 lg:col-span-7 p-3 sm:p-5 lg:p-6 bg-white text-[#0f2942] flex flex-col justify-center">
        <div
          ref={containerRef}
          className="relative grid grid-cols-2 gap-5 sm:gap-10 md:gap-14 flex-1 min-h-0"
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            aria-hidden="true"
          >
            {lines.map((line) => {
              const leftItem = randomizedLeft.find((l) => l.id === line.leftId);
              const isMatchCorrect = leftItem?.matchId === line.rightId;
              const strokeColor = verified
                ? isMatchCorrect
                  ? '#16A34A'
                  : '#DC2626'
                : line.color;

              const dx = Math.abs(line.x2 - line.x1) * 0.52;
              const pathD = `M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1}, ${
                line.x2 - dx
              } ${line.y2}, ${line.x2} ${line.y2}`;

              return (
                <g key={`${line.leftId}-${line.rightId}`}>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx={line.x1} cy={line.y1} r="4.5" fill={strokeColor} />
                  <circle cx={line.x2} cy={line.y2} r="4.5" fill={strokeColor} />
                </g>
              );
            })}
          </svg>

          {/* Left Column */}
          <div className="flex flex-col gap-2 min-h-0 relative z-20">
            <div className="shrink-0 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              AI Tools
            </div>
            {randomizedLeft.map((item, idx) => {
              const isSelected = activeLeftId === item.id;
              const connectedRightId = connections[item.id];
              const isMatchCorrect = verified && connectedRightId === item.matchId;
              const isMatchWrong = verified && connectedRightId !== item.matchId;
              const pairColor = PAIR_COLORS[idx % PAIR_COLORS.length];

              let cardClass = 'border-slate-200 bg-white hover:border-blue-400';
              if (verified) {
                cardClass = isMatchCorrect
                  ? 'border-emerald-600 bg-emerald-50'
                  : isMatchWrong
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 bg-white';
              } else if (isSelected) {
                cardClass = 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/30';
              } else if (connectedRightId) {
                cardClass = 'border-indigo-300 bg-indigo-50/40';
              }

              return (
                <motion.button
                  key={item.id}
                  ref={(el) => {
                    leftRefs.current[item.id] = el;
                  }}
                  whileTap={!verified ? { scale: 0.95 } : undefined}
                  animate={{ scale: isSelected ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                  type="button"
                  disabled={verified}
                  onClick={() => handleLeftTap(item.id)}
                  className={`flex-1 min-h-[48px] sm:min-h-[56px] w-full flex items-center gap-2 sm:gap-3 px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl border-2 text-left transition-colors ${cardClass} ${
                    !verified ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <img
                    src={item.logoSrc}
                    alt={item.label}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate">
                      {item.label}
                    </div>
                    {connectedRightId && !verified && (
                      <div
                        className="text-[11px] sm:text-xs font-semibold truncate leading-tight"
                        style={{ color: pairColor }}
                      >
                        → {getRightLabel(connectedRightId)}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-2 min-h-0 relative z-20">
            <div className="shrink-0 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 px-1 text-right">
              Companies
            </div>
            {randomizedRight.map((company) => {
              const pairedLeftId = Object.keys(connections).find(
                (leftId) => connections[leftId] === company.id
              );
              const leftItem = pairedLeftId
                ? randomizedLeft.find((l) => l.id === pairedLeftId)
                : null;
              const isMatchCorrect = verified && leftItem?.matchId === company.id;
              const isMatchWrong = verified && leftItem && leftItem.matchId !== company.id;

              let cardClass = 'border-slate-200 bg-white hover:border-teal-500';
              if (verified) {
                cardClass = isMatchCorrect
                  ? 'border-emerald-600 bg-emerald-50'
                  : isMatchWrong
                  ? 'border-red-600 bg-red-50'
                  : 'border-slate-200 bg-white';
              } else if (activeLeftId) {
                cardClass =
                  'border-dashed border-blue-400 bg-blue-50/30 hover:border-solid hover:border-blue-600';
              } else if (pairedLeftId) {
                cardClass = 'border-indigo-300 bg-indigo-50/40';
              }

              return (
                <motion.button
                  key={company.id}
                  ref={(el) => {
                    rightRefs.current[company.id] = el;
                  }}
                  whileTap={!verified ? { scale: 0.95 } : undefined}
                  transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                  type="button"
                  disabled={verified}
                  onClick={() => handleRightTap(company.id)}
                  className={`flex-1 min-h-[48px] sm:min-h-[56px] w-full flex items-center gap-2 sm:gap-3 px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl border-2 text-left transition-colors ${cardClass} ${
                    !verified ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <img
                    src={company.logoSrc}
                    alt={company.label}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate">
                      {company.label}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
