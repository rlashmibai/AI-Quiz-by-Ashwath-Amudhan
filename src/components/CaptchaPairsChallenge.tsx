'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Link2, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { CaptchaPairItem } from '@/data/questions';

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
    const handleResize = () => computeLines();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [computeLines]);

  const handleLeftTap = (leftId: string) => {
    if (verified) return;
    setActiveLeftId((prev) => (prev === leftId ? null : leftId));
  };

  const handleRightTap = (rightId: string) => {
    if (verified) return;

    if (!activeLeftId) {
      const existingLeft = Object.keys(connections).find((k) => connections[k] === rightId);
      if (existingLeft) {
        setConnections((prev) => {
          const copy = { ...prev };
          delete copy[existingLeft];
          return copy;
        });
      }
      return;
    }

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
    setActiveLeftId(null);
    setConnections({});
  };

  const connectedCount = Object.keys(connections).length;
  const allConnected = connectedCount === randomizedLeft.length;

  const handleVerify = () => {
    if (verified || !allConnected) return;
    const allMatch = randomizedLeft.every((item) => connections[item.id] === item.matchId);
    setVerified(true);
    setPassed(allMatch);
    onComplete(allMatch, { connections, verified: true, passed: allMatch });
  };

  const getRightLabel = (rightId: string) =>
    randomizedRight.find((r) => r.id === rightId)?.label ?? '';

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 text-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 [@media(max-height:660px)]:py-2 bg-white/10 border-b border-white/15">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider opacity-90">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Connect-the-Pairs CAPTCHA</span>
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

      <div className="p-3 sm:p-4 [@media(max-height:660px)]:p-2.5 bg-white text-[#0f2942]">
        <div ref={containerRef} className="relative grid grid-cols-2 gap-8 sm:gap-14 py-0.5">
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
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  <circle cx={line.x1} cy={line.y1} r="4.5" fill={strokeColor} />
                  <circle cx={line.x2} cy={line.y2} r="4.5" fill={strokeColor} />
                </g>
              );
            })}
          </svg>

          {/* Left Column */}
          <div className="space-y-2 [@media(max-height:660px)]:space-y-1.5 relative z-20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
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
                <button
                  key={item.id}
                  ref={(el) => {
                    leftRefs.current[item.id] = el;
                  }}
                  type="button"
                  disabled={verified}
                  onClick={() => handleLeftTap(item.id)}
                  className={`w-full min-h-[50px] [@media(max-height:660px)]:min-h-[44px] flex items-center gap-2.5 p-2 sm:p-2.5 [@media(max-height:660px)]:py-1.5 rounded-xl border-2 text-left transition-all ${cardClass} ${
                    !verified ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'
                  }`}
                >
                  <img
                    src={item.logoSrc}
                    alt={item.label}
                    className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.label}
                    </div>
                    {connectedRightId && !verified && (
                      <div className="text-[11px] font-medium truncate leading-tight" style={{ color: pairColor }}>
                        → {getRightLabel(connectedRightId)}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-2 [@media(max-height:660px)]:space-y-1.5 relative z-20">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1 text-right">
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
                <button
                  key={company.id}
                  ref={(el) => {
                    rightRefs.current[company.id] = el;
                  }}
                  type="button"
                  disabled={verified}
                  onClick={() => handleRightTap(company.id)}
                  className={`w-full min-h-[50px] [@media(max-height:660px)]:min-h-[44px] flex items-center gap-2.5 p-2 sm:p-2.5 [@media(max-height:660px)]:py-1.5 rounded-xl border-2 text-left transition-all ${cardClass} ${
                    !verified ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'
                  }`}
                >
                  <img
                    src={company.logoSrc}
                    alt={company.label}
                    className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {company.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar OR Instant Feedback */}
        {!verified ? (
          <div className="mt-2.5 pt-2.5 [@media(max-height:660px)]:mt-2 [@media(max-height:660px)]:pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 tabular-nums">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>
                  {connectedCount} / {randomizedLeft.length} pairs matched
                </span>
              </span>

              {connectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <button
              type="button"
              disabled={!allConnected}
              onClick={handleVerify}
              className={`min-h-[44px] sm:min-h-[48px] px-7 py-2 text-sm sm:text-base font-bold tracking-wide rounded-xl transition-all ${
                !allConnected
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
                    ? 'Correct Answer! All four pairs matched!'
                    : 'Correct pairs: ChatGPT → OpenAI · Gemini → Google · Claude → Anthropic · Llama → Meta'}
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
