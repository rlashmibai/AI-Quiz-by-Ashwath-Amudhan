'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Cpu, RotateCcw, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { CaptchaSequenceStep } from '@/data/questions';
import {
  playCorrectSound,
  playIncorrectSound,
  playTapSound,
  playTileToggleSound,
} from '@/lib/quizAudio';

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
    const isAlreadySelected = selectedOrder.includes(stepId);
    if (!isAlreadySelected && selectedOrder.length >= steps.length) return;
    playTileToggleSound(!isAlreadySelected);
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
    playTileToggleSound(false);
    setSelectedOrder((prev) => prev.filter((id) => id !== idAtSlot));
  };

  const handleReset = () => {
    if (verified) return;
    playTapSound();
    setSelectedOrder([]);
  };

  const allSelected = selectedOrder.length === steps.length;

  const handleVerify = () => {
    if (verified || !allSelected) return;
    const isExactMatch = orderedCorrect.every(
      (step, idx) => selectedOrder[idx] === step.id
    );

    if (isExactMatch) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    setVerified(true);
    setPassed(isExactMatch);
    onComplete(isExactMatch, { selectedOrder, verified: true, passed: isExactMatch });
  };

  return (
    <section className="rounded-2xl sm:rounded-3xl border border-indigo-400/40 bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-700 text-white shadow-sm overflow-hidden flex flex-col landscape:grid landscape:grid-cols-12">
      {/* Left Column in Landscape */}
      <div className="landscape:col-span-5 flex flex-col justify-between gap-3 p-4 sm:p-5 bg-white/10 border-b landscape:border-b-0 landscape:border-r border-white/20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-200">
            <Cpu className="w-4 h-4" />
            <span>AI Pipeline Assembly CAPTCHA</span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl lg:text-[1.65rem] font-bold leading-snug">
            {question}
          </h2>

          <p className="text-sm sm:text-base text-indigo-100 font-medium leading-snug">
            {instruction}
          </p>
        </div>

        {/* Arrow-Connected Sequence Slots */}
        <div className="rounded-xl bg-white/95 text-[#0f2942] p-2.5 grid grid-cols-2 gap-2">
          {orderedCorrect.map((_, slotIdx) => {
            const chosenId = selectedOrder[slotIdx];
            const chosenStep = steps.find((s) => s.id === chosenId);
            const isSlotCorrect =
              verified && chosenStep && orderedCorrect[slotIdx].id === chosenStep.id;
            const isSlotWrong =
              verified && (!chosenStep || orderedCorrect[slotIdx].id !== chosenStep.id);

            let slotStyle = 'border-dashed border-slate-300 bg-slate-50 text-slate-400';
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
              <motion.button
                key={`slot-${slotIdx}`}
                whileTap={!verified && chosenStep ? { scale: 0.94 } : undefined}
                animate={chosenStep ? { scale: [0.96, 1] } : undefined}
                transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                type="button"
                disabled={verified || !chosenStep}
                onClick={() => handleSlotClick(slotIdx)}
                className={`min-h-[46px] px-2.5 py-1.5 rounded-lg border-2 text-left transition-colors flex items-center justify-between gap-1.5 ${slotStyle} ${
                  !verified && chosenStep ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Step {slotIdx + 1}
                  </div>
                  <div className="text-xs sm:text-sm font-bold leading-tight truncate">
                    {chosenStep ? chosenStep.label : '—'}
                  </div>
                </div>
                {slotIdx < orderedCorrect.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Action Bar OR Big Explanation */}
        {!verified ? (
          <div className="pt-2 border-t border-white/20 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base font-semibold tabular-nums">
                {selectedOrder.length} / {steps.length} steps selected
              </span>
              {selectedOrder.length > 0 && (
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
              whileTap={allSelected ? { scale: 0.96 } : undefined}
              type="button"
              disabled={!allSelected}
              onClick={handleVerify}
              className={`w-full min-h-[48px] px-6 py-2.5 text-base sm:text-lg font-bold tracking-wide rounded-xl transition-colors ${
                !allSelected
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
            className={`rounded-2xl border p-3.5 space-y-2.5 ${
              passed
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 min-w-0">
                <p className="text-sm sm:text-base font-bold leading-snug">
                  {passed
                    ? 'Correct Answer! AI pipeline assembled!'
                    : 'Order: 1. Collect → 2. Prepare → 3. Train → 4. Evaluate'}
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
              className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2 text-base font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-xl transition-colors cursor-pointer"
            >
              <span>{isLastQuestion ? 'View Score' : 'Next Question'}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Right Column in Landscape: 2x2 Illustrated Cards */}
      <div className="landscape:col-span-7 p-3.5 sm:p-4 bg-white/95 text-[#0f2942] flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3">
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
                'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30';
            }

            return (
              <motion.button
                key={step.id}
                whileTap={!verified ? { scale: 0.94 } : undefined}
                animate={{ scale: isSelected && !verified ? 0.98 : 1 }}
                transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                type="button"
                disabled={verified}
                onClick={() => handleToggleStep(step.id)}
                className={`relative rounded-xl border-2 p-2.5 text-center transition-colors duration-150 flex flex-col items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${cardStyle} ${
                  !verified ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-sm z-10 tabular-nums"
                  >
                    {seqPosition + 1}
                  </motion.span>
                )}

                <div className="w-full h-28 sm:h-32 rounded-lg overflow-hidden bg-white border border-white shadow-xs">
                  <img
                    src={step.imageSrc}
                    alt={step.label}
                    className="w-full h-full object-cover"
                  />
                </div>

                <span className="text-sm sm:text-base font-bold text-[#0f2942] leading-tight">
                  {step.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
