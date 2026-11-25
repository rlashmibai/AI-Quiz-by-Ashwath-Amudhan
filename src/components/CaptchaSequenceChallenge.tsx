'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Cpu, RotateCcw, XCircle } from 'lucide-react';
import { CaptchaSequenceStep } from '@/data/questions';

export interface SequenceSavedState {
  selectedOrder: string[];
  verified: boolean;
  passed: boolean;
}

interface CaptchaSequenceChallengeProps {
  questionId: number;
  shuffleSeed: number;
  question: string;
  instruction: string;
  steps: CaptchaSequenceStep[];
  explanation?: string;
  isLastQuestion: boolean;
  savedState?: SequenceSavedState;
  onComplete: (isCorrect: boolean, state: SequenceSavedState) => void;
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

const PASTEL_STYLES = [
  'bg-violet-50 border-violet-200 hover:border-violet-400',
  'bg-sky-50 border-sky-200 hover:border-sky-400',
  'bg-teal-50 border-teal-200 hover:border-teal-400',
  'bg-amber-50 border-amber-200 hover:border-amber-400',
];

export function CaptchaSequenceChallenge({
  questionId,
  shuffleSeed,
  question,
  instruction,
  steps,
  explanation,
  isLastQuestion,
  savedState,
  onComplete,
  onProceedNext,
}: CaptchaSequenceChallengeProps) {
  const randomizedSteps = useMemo(
    () => seededShuffle(steps, shuffleSeed + questionId * 53),
    [steps, shuffleSeed, questionId]
  );
  const orderedCorrect = useMemo(
    () => [...steps].sort((a, b) => a.orderIndex - b.orderIndex),
    [steps]
  );

  const [selectedOrder, setSelectedOrder] = useState<string[]>(savedState?.selectedOrder ?? []);
  const [verified, setVerified] = useState<boolean>(savedState?.verified ?? false);
  const [passed, setPassed] = useState<boolean>(savedState?.passed ?? false);

  const handleToggleStep = (stepId: string) => {
    if (verified) return;
    setSelectedOrder((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      }
      if (prev.length >= steps.length) return prev;
      return [...prev, stepId];
    });
  };

  const handleSlotClick = (slotIndex: number) => {
    if (verified) return;
    const idAtSlot = selectedOrder[slotIndex];
    if (!idAtSlot) return;
    setSelectedOrder((prev) => prev.filter((id) => id !== idAtSlot));
  };

  const handleReset = () => {
    if (verified) return;
    setSelectedOrder([]);
  };

  const allSelected = selectedOrder.length === steps.length;

  const handleVerify = () => {
    if (verified || !allSelected) return;
    const isExactMatch = orderedCorrect.every(
      (step, idx) => selectedOrder[idx] === step.id
    );
    setVerified(true);
    setPassed(isExactMatch);
    onComplete(isExactMatch, { selectedOrder, verified: true, passed: isExactMatch });
  };

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-indigo-400/40 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700 text-white shadow-sm overflow-hidden">
      {/* Compact Header */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 [@media(max-height:660px)]:py-2 bg-white/10 border-b border-white/15">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-200">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Pipeline Assembly CAPTCHA</span>
          </div>
          <span className="text-xs text-indigo-100 font-medium">{instruction}</span>
        </div>
        <h2
          className="mt-0.5 font-display text-base sm:text-xl [@media(max-height:660px)]:text-base font-bold leading-snug"
          style={{ textWrap: 'balance' }}
        >
          {question}
        </h2>
      </div>

      {/* 2x2 Cards + Compact Sequence Slots */}
      <div className="p-3 sm:p-4 [@media(max-height:660px)]:p-2.5 space-y-2.5 [@media(max-height:660px)]:space-y-2 bg-white/95 text-[#0f2942]">
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 [@media(max-height:660px)]:gap-1.5">
          {randomizedSteps.map((step, idx) => {
            const seqPosition = selectedOrder.indexOf(step.id);
            const isSelected = seqPosition !== -1;

            let cardStyle = PASTEL_STYLES[idx % PASTEL_STYLES.length];
            if (verified) {
              const isCorrectSlot = orderedCorrect[seqPosition]?.id === step.id;
              cardStyle = isCorrectSlot
                ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/30'
                : 'bg-red-50 border-red-600 ring-2 ring-red-500/30';
            } else if (isSelected) {
              cardStyle =
                'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30 scale-[0.98]';
            }

            return (
              <button
                key={step.id}
                type="button"
                disabled={verified}
                onClick={() => handleToggleStep(step.id)}
                className={`relative rounded-xl border-2 p-2 [@media(max-height:660px)]:p-1.5 text-center transition-all duration-150 flex flex-col items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${cardStyle} ${
                  !verified ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm z-10 tabular-nums">
                    {seqPosition + 1}
                  </span>
                )}

                <div className="w-full h-20 sm:h-24 [@media(max-height:660px)]:h-12 rounded-lg overflow-hidden bg-white border border-white shadow-xs">
                  <img
                    src={step.imageSrc}
                    alt={step.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="text-xs sm:text-sm font-bold text-[#0f2942] leading-tight">
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Arrow-Connected Sequence Slots */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 [@media(max-height:660px)]:p-1.5">
          <div className="grid grid-cols-7 items-center gap-1 sm:gap-1.5">
            {orderedCorrect.map((_, slotIdx) => {
              const chosenId = selectedOrder[slotIdx];
              const chosenStep = steps.find((s) => s.id === chosenId);
              const isSlotCorrect =
                verified && chosenStep && orderedCorrect[slotIdx].id === chosenStep.id;
              const isSlotWrong =
                verified && (!chosenStep || orderedCorrect[slotIdx].id !== chosenStep.id);

              let slotStyle = 'border-dashed border-slate-300 bg-white text-slate-400';
              if (verified) {
                slotStyle = isSlotCorrect
                  ? 'border-solid border-emerald-600 bg-emerald-50 text-emerald-950'
                  : isSlotWrong
                  ? 'border-solid border-red-600 bg-red-50 text-red-950'
                  : slotStyle;
              } else if (chosenStep) {
                slotStyle =
                  'border-solid border-blue-500 bg-blue-50 text-[#0f2942] hover:bg-blue-100/70';
              }

              return (
                <div key={`slot-${slotIdx}`} className="contents">
                  <button
                    type="button"
                    disabled={verified || !chosenStep}
                    onClick={() => handleSlotClick(slotIdx)}
                    className={`min-h-[44px] [@media(max-height:660px)]:min-h-[38px] px-1.5 py-1 rounded-lg border-2 text-center transition-all flex flex-col items-center justify-center ${slotStyle} ${
                      !verified && chosenStep ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                      Step {slotIdx + 1}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1">
                      {chosenStep ? chosenStep.label : '—'}
                    </span>
                  </button>

                  {slotIdx < orderedCorrect.length - 1 && (
                    <div className="flex items-center justify-center text-indigo-500">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bar OR Instant Feedback */}
        {!verified ? (
          <div className="pt-0.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-600 tabular-nums">
                {selectedOrder.length} / {steps.length} steps selected
              </span>
              {selectedOrder.length > 0 && (
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
              disabled={!allSelected}
              onClick={handleVerify}
              className={`min-h-[44px] sm:min-h-[48px] px-7 py-2 text-sm sm:text-base font-bold tracking-wide rounded-xl transition-all ${
                !allSelected
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer active:scale-[0.97]'
              }`}
            >
              VERIFY
            </button>
          </div>
        ) : (
          <div
            aria-live="polite"
            className={`quiz-fade-in rounded-xl border p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
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
                    ? 'Correct Answer! AI pipeline assembled!'
                    : 'Correct sequence: 1. Collect data → 2. Prepare data → 3. Train the model → 4. Evaluate the model'}
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
