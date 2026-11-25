'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '@/data/questions';

type QuizPhase = 'welcome' | 'quiz' | 'results';

const BASE_AUTO_ADVANCE_MS = 3000;
const EXPLANATION_AUTO_ADVANCE_MS = 4500;

export function QuizApp() {
  const questions: QuizQuestion[] = QUIZ_QUESTIONS;
  const totalQuestions = questions.length;

  const [phase, setPhase] = useState<QuizPhase>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancingRef = useRef(false);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
    };
  }, [clearAutoAdvanceTimer]);

  const advanceToNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    clearAutoAdvanceTimer();

    setSelectedOptionIndex(null);
    setCurrentIndex((prev) => {
      if (prev + 1 < totalQuestions) {
        return prev + 1;
      }
      setPhase('results');
      return prev;
    });

    // Release transition guard after state batch commits
    setTimeout(() => {
      advancingRef.current = false;
    }, 50);
  }, [clearAutoAdvanceTimer, totalQuestions]);

  const handleStartQuiz = () => {
    clearAutoAdvanceTimer();
    advancingRef.current = false;
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setCorrectCount(0);
    setPhase('quiz');
  };

  const handleRestartQuiz = () => {
    clearAutoAdvanceTimer();
    advancingRef.current = false;
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setCorrectCount(0);
    setPhase('welcome');
  };

  const handleSelectOption = (optionIndex: number) => {
    // Prevent changing answers or double-clicking
    if (selectedOptionIndex !== null || advancingRef.current) return;

    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setSelectedOptionIndex(optionIndex);

    if (optionIndex === currentQuestion.correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }

    const delayMs = currentQuestion.explanation
      ? EXPLANATION_AUTO_ADVANCE_MS
      : BASE_AUTO_ADVANCE_MS;

    clearAutoAdvanceTimer();
    timerRef.current = setTimeout(() => {
      advanceToNext();
    }, delayMs);
  };

  // 1. Welcome Screen
  if (phase === 'welcome') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-12">
        <section
          aria-labelledby="quiz-welcome-title"
          className="quiz-fade-in w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-sm px-7 py-12 sm:px-12 sm:py-16 text-center"
        >
          <p className="text-base sm:text-lg font-medium text-slate-600">
            Welcome to the
          </p>

          <h1
            id="quiz-welcome-title"
            className="mt-2 font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#0f2942] leading-[1.15]"
            style={{ textWrap: 'balance' }}
          >
            Artificial Intelligence Quiz
          </h1>

          <p className="mt-3 text-lg sm:text-xl font-semibold text-[#0d9488]">
            by Tricky Toddlers
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-600">
            Let&apos;s learn AI together!
          </p>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleStartQuiz}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base sm:text-lg font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] active:scale-[0.99] rounded-2xl shadow-sm transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d9488]"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // 4. Final Results Screen
  if (phase === 'results') {
    const finalScore =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-12">
        <section
          aria-labelledby="quiz-completed-title"
          className="quiz-fade-in w-full max-w-xl bg-white rounded-3xl border border-slate-200/80 shadow-sm px-7 py-12 sm:px-12 sm:py-14 text-center"
        >
          <h1
            id="quiz-completed-title"
            className="font-display text-3xl sm:text-4xl font-bold text-[#0f2942]"
          >
            Quiz Completed!
          </h1>

          <p className="mt-8 text-base font-semibold text-slate-500">
            Your Score
          </p>

          <div className="mt-2 font-display text-5xl sm:text-6xl font-extrabold text-[#0d9488] tabular-nums">
            {finalScore} / 100
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100 space-y-2">
            <p className="text-lg font-semibold text-[#0f2942]">
              Thank you for participating!
            </p>
            <p className="text-base text-slate-600">
              Keep exploring. Keep learning.
            </p>
            <p className="pt-2 text-base font-bold text-[#0d9488]">
              Tricky Toddlers
            </p>
          </div>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#0f2942] bg-slate-100 hover:bg-slate-200 active:scale-[0.99] rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart Quiz</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // 2. Quiz Screen & 3. Instant Answer Feedback
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const hasAnswered = selectedOptionIndex !== null;
  const isCorrectSelection =
    hasAnswered && selectedOptionIndex === currentQuestion.correctIndex;
  const correctOption = currentQuestion.options[currentQuestion.correctIndex];
  const hasOptionImages = currentQuestion.options.some((opt) => Boolean(opt.image));
  const progressPercent = Math.round(
    ((currentIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div
        key={currentQuestion.id}
        className="quiz-fade-in w-full max-w-2xl space-y-5"
      >
        {/* Question Number & Simple Progress Bar */}
        <div className="space-y-2.5 px-1">
          <div className="flex items-center justify-between text-sm font-semibold text-[#0f2942] tabular-nums">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <div
            className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentIndex + (hasAnswered ? 1 : 0)}
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
          >
            <div
              className="h-full bg-[#0d9488] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Single Question Card */}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-9 space-y-6">
          <h2
            className="font-display text-xl sm:text-2xl font-bold text-[#0f2942] leading-snug"
            style={{ textWrap: 'balance' }}
          >
            {currentQuestion.question}
          </h2>

          {/* Optional Question Image (responsive, never unnecessarily cropped) */}
          {currentQuestion.questionImage && (
            <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 flex items-center justify-center">
              <img
                src={currentQuestion.questionImage.src}
                alt={currentQuestion.questionImage.alt}
                className="w-full max-h-64 sm:max-h-72 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Answer Options */}
          <div
            className={
              hasOptionImages
                ? 'grid grid-cols-1 sm:grid-cols-3 gap-4'
                : currentQuestion.type === 'true-false'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
                : 'grid grid-cols-1 gap-3.5'
            }
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              let cardStyle =
                'border-slate-200 bg-white text-[#0f2942] hover:border-[#0d9488] hover:bg-teal-50/30 shadow-xs';

              if (hasAnswered) {
                if (isCorrectOption) {
                  cardStyle =
                    'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-none';
                } else if (isSelected && !isCorrectOption) {
                  cardStyle =
                    'border-red-600 bg-red-50 text-red-950 shadow-none';
                } else {
                  cardStyle =
                    'border-slate-200 bg-slate-50/70 text-slate-400 shadow-none opacity-75';
                }
              }

              return (
                <button
                  key={`${currentQuestion.id}-opt-${idx}`}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full rounded-2xl border-2 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] ${cardStyle} ${
                    hasOptionImages
                      ? 'p-4 flex flex-col items-center text-center gap-3'
                      : 'px-5 py-4 min-h-[60px] flex items-center justify-between gap-4'
                  } ${!hasAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
                >
                  {option.image && (
                    <div className="w-full aspect-[4/3] rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={option.image.src}
                        alt={option.image.alt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <span className="text-base sm:text-lg font-medium leading-snug">
                    {option.text}
                  </span>

                  {hasAnswered && isCorrectOption && !hasOptionImages && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
                  )}
                  {hasAnswered && isSelected && !isCorrectOption && !hasOptionImages && (
                    <XCircle className="w-5 h-5 text-red-700 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 3. Instant Answer Feedback */}
          {hasAnswered && (
            <div
              aria-live="polite"
              className={`quiz-fade-in rounded-2xl border p-4 sm:p-5 space-y-3 ${
                isCorrectSelection
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-red-50 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrectSelection ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-700 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1.5 flex-1">
                  <p className="text-base sm:text-lg font-bold">
                    {isCorrectSelection
                      ? 'Correct Answer!'
                      : `Incorrect! The correct answer is ${correctOption?.text ?? ''}.`}
                  </p>

                  {currentQuestion.explanation && (
                    <p className="text-sm sm:text-base leading-relaxed opacity-90">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={advanceToNext}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
                >
                  <span>
                    {currentIndex + 1 < totalQuestions ? 'Next Question' : 'View Score'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
