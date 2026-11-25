'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion } from '@/data/questions';
import { CaptchaGridChallenge, GridSavedState } from './CaptchaGridChallenge';
import { CaptchaPairsChallenge, PairsSavedState } from './CaptchaPairsChallenge';
import { CaptchaSequenceChallenge, SequenceSavedState } from './CaptchaSequenceChallenge';

type QuizPhase = 'welcome' | 'quiz' | 'results';

type SavedAnswerEntry =
  | { kind: 'mcq'; selectedOptionIndex: number }
  | { kind: 'grid'; state: GridSavedState }
  | { kind: 'pairs'; state: PairsSavedState }
  | { kind: 'sequence'; state: SequenceSavedState };

export function QuizApp() {
  const questions: QuizQuestion[] = QUIZ_QUESTIONS;
  const totalQuestions = questions.length;

  const [phase, setPhase] = useState<QuizPhase>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleSeed, setShuffleSeed] = useState(101);
  const [answersById, setAnswersById] = useState<Record<number, SavedAnswerEntry>>({});
  const [correctCount, setCorrectCount] = useState(0);

  const advancingRef = useRef(false);
  const scoredQuestionIdsRef = useRef<Set<number>>(new Set());

  const goToNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;

    setCurrentIndex((prev) => {
      if (prev + 1 < totalQuestions) {
        return prev + 1;
      }
      setPhase('results');
      return prev;
    });

    setTimeout(() => {
      advancingRef.current = false;
    }, 50);
  }, [totalQuestions]);

  const goToPrevious = useCallback(() => {
    if (advancingRef.current) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  // ArrowLeft / ArrowRight keyboard navigation during quiz
  useEffect(() => {
    if (phase !== 'quiz') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, goToNext, goToPrevious]);

  const handleStartQuiz = () => {
    advancingRef.current = false;
    scoredQuestionIdsRef.current = new Set();
    setShuffleSeed(Math.floor(Math.random() * 100000) + 1);
    setAnswersById({});
    setCurrentIndex(0);
    setCorrectCount(0);
    setPhase('quiz');
  };

  const handleRestartQuiz = () => {
    advancingRef.current = false;
    scoredQuestionIdsRef.current = new Set();
    setAnswersById({});
    setCurrentIndex(0);
    setCorrectCount(0);
    setPhase('welcome');
  };

  const recordScoreOnce = (questionId: number, isCorrect: boolean) => {
    if (scoredQuestionIdsRef.current.has(questionId)) return;
    scoredQuestionIdsRef.current.add(questionId);
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  // Manual advancement only: selecting an option shows feedback and waits for Next button
  const handleSelectOption = (question: QuizQuestion, optionIndex: number) => {
    if (answersById[question.id] || advancingRef.current) return;

    setAnswersById((prev) => ({
      ...prev,
      [question.id]: { kind: 'mcq', selectedOptionIndex: optionIndex },
    }));
    recordScoreOnce(question.id, optionIndex === question.correctIndex);
  };

  const handleCaptchaComplete = (
    questionId: number,
    isCorrect: boolean,
    entry: SavedAnswerEntry
  ) => {
    if (answersById[questionId] || advancingRef.current) return;

    setAnswersById((prev) => ({
      ...prev,
      [questionId]: entry,
    }));
    recordScoreOnce(questionId, isCorrect);
  };

  // 1. Welcome Screen (IRA Duo 8-inch Tablet Portrait & Landscape)
  if (phase === 'welcome') {
    return (
      <main className="h-dvh flex items-center justify-center px-5 py-4 overflow-hidden">
        <section
          aria-labelledby="quiz-welcome-title"
          className="quiz-fade-in w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm px-8 py-10 sm:px-12 sm:py-12 [@media(max-height:600px)]:py-6 text-center"
        >
          <p className="text-lg sm:text-xl font-medium text-slate-600">
            Welcome to the
          </p>

          <h1
            id="quiz-welcome-title"
            className="mt-2 font-display text-3xl sm:text-5xl [@media(max-height:600px)]:text-3xl font-bold tracking-tight text-[#0f2942] leading-[1.15]"
            style={{ textWrap: 'balance' }}
          >
            Artificial Intelligence Quiz
          </h1>

          <p className="mt-2.5 text-xl sm:text-2xl font-semibold text-[#0d9488]">
            by Tricky Toddlers
          </p>

          <p className="mt-5 [@media(max-height:600px)]:mt-3 text-base sm:text-lg text-slate-600">
            Let&apos;s learn AI together!
          </p>

          <div className="mt-8 [@media(max-height:600px)]:mt-5">
            <button
              type="button"
              onClick={handleStartQuiz}
              className="inline-flex items-center justify-center gap-3 min-h-[60px] [@media(max-height:600px)]:min-h-[52px] px-10 py-3.5 text-lg sm:text-xl font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] active:scale-[0.97] rounded-2xl shadow-sm transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d9488]"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // 4. Final Results Screen (IRA Duo 8-inch Tablet Portrait & Landscape)
  if (phase === 'results') {
    const finalScore =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return (
      <main className="h-dvh flex items-center justify-center px-5 py-4 overflow-hidden">
        <section
          aria-labelledby="quiz-completed-title"
          className="quiz-fade-in w-full max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-sm px-8 py-10 sm:px-12 sm:py-12 [@media(max-height:600px)]:py-6 text-center"
        >
          <h1
            id="quiz-completed-title"
            className="font-display text-3xl sm:text-4xl [@media(max-height:600px)]:text-2xl font-bold text-[#0f2942]"
          >
            Quiz Completed!
          </h1>

          <p className="mt-6 [@media(max-height:600px)]:mt-3 text-base sm:text-lg font-semibold text-slate-500">
            Your Score
          </p>

          <div className="mt-1.5 font-display text-5xl sm:text-6xl [@media(max-height:600px)]:text-5xl font-extrabold text-[#0d9488] tabular-nums">
            {finalScore} / 100
          </div>

          <div className="mt-8 [@media(max-height:600px)]:mt-4 pt-6 [@media(max-height:600px)]:pt-4 border-t border-slate-100 space-y-1.5">
            <p className="text-lg sm:text-xl font-semibold text-[#0f2942]">
              Thank you for participating!
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              Keep exploring. Keep learning.
            </p>
            <p className="pt-1 text-base sm:text-lg font-bold text-[#0d9488]">
              Tricky Toddlers
            </p>
          </div>

          <div className="mt-8 [@media(max-height:600px)]:mt-5">
            <button
              type="button"
              onClick={handleRestartQuiz}
              className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3 text-base font-semibold text-[#0f2942] bg-slate-100 hover:bg-slate-200 active:scale-[0.97] rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Restart Quiz</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  // 2. Quiz Screen & 3. Instant Answer Feedback (IRA Duo 8-inch Tablet, Zero Scroll)
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const savedEntry = answersById[currentQuestion.id];
  const hasAnswered = Boolean(savedEntry);

  const progressPercent = Math.round(
    ((currentIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100
  );

  return (
    <main className="h-dvh flex items-center justify-center px-3.5 py-2 sm:px-5 sm:py-3 overflow-hidden">
      <div
        key={currentQuestion.id}
        className="quiz-fade-in w-full max-w-3xl space-y-2 sm:space-y-2.5"
      >
        {/* Single-Row Compact Tablet Header: Counter + Progress Bar + Back Button */}
        <div className="flex items-center justify-between gap-3 px-0.5">
          <span className="text-sm sm:text-base font-semibold text-[#0f2942] tabular-nums whitespace-nowrap">
            Question {currentIndex + 1} of {totalQuestions}
          </span>

          <div
            className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden"
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

          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={goToPrevious}
            aria-label="Previous question"
            className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[84px] px-3.5 py-2 text-sm font-semibold rounded-xl border transition-all shrink-0 ${
              currentIndex === 0
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 active:scale-[0.97] cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Question / Challenge Card */}
        {currentQuestion.type === 'captcha-grid' && currentQuestion.gridTiles ? (
          <CaptchaGridChallenge
            questionId={currentQuestion.id}
            shuffleSeed={shuffleSeed}
            question={currentQuestion.question}
            instruction={currentQuestion.instruction ?? 'Select all applicable tiles.'}
            theme={currentQuestion.gridTheme ?? 'blue-captcha'}
            tiles={currentQuestion.gridTiles}
            explanation={currentQuestion.explanation}
            isLastQuestion={isLastQuestion}
            savedState={savedEntry?.kind === 'grid' ? savedEntry.state : undefined}
            onComplete={(ok, state) =>
              handleCaptchaComplete(currentQuestion.id, ok, { kind: 'grid', state })
            }
            onProceedNext={goToNext}
          />
        ) : currentQuestion.type === 'captcha-pairs' &&
          currentQuestion.leftPairs &&
          currentQuestion.rightPairs ? (
          <CaptchaPairsChallenge
            questionId={currentQuestion.id}
            shuffleSeed={shuffleSeed}
            question={currentQuestion.question}
            instruction={
              currentQuestion.instruction ??
              'Tap an item on the left, then tap its match on the right.'
            }
            leftPairs={currentQuestion.leftPairs}
            rightPairs={currentQuestion.rightPairs}
            explanation={currentQuestion.explanation}
            isLastQuestion={isLastQuestion}
            savedState={savedEntry?.kind === 'pairs' ? savedEntry.state : undefined}
            onComplete={(ok, state) =>
              handleCaptchaComplete(currentQuestion.id, ok, { kind: 'pairs', state })
            }
            onProceedNext={goToNext}
          />
        ) : currentQuestion.type === 'captcha-sequence' &&
          currentQuestion.sequenceSteps ? (
          <CaptchaSequenceChallenge
            questionId={currentQuestion.id}
            shuffleSeed={shuffleSeed}
            question={currentQuestion.question}
            instruction={
              currentQuestion.instruction ?? 'Arrange the steps in order.'
            }
            steps={currentQuestion.sequenceSteps}
            explanation={currentQuestion.explanation}
            isLastQuestion={isLastQuestion}
            savedState={savedEntry?.kind === 'sequence' ? savedEntry.state : undefined}
            onComplete={(ok, state) =>
              handleCaptchaComplete(currentQuestion.id, ok, { kind: 'sequence', state })
            }
            onProceedNext={goToNext}
          />
        ) : (
          <StandardQuestionCard
            question={currentQuestion}
            selectedOptionIndex={
              savedEntry?.kind === 'mcq' ? savedEntry.selectedOptionIndex : null
            }
            isLastQuestion={isLastQuestion}
            onSelectOption={(idx) => handleSelectOption(currentQuestion, idx)}
            onProceedNext={goToNext}
          />
        )}
      </div>
    </main>
  );
}

interface StandardQuestionCardProps {
  question: QuizQuestion;
  selectedOptionIndex: number | null;
  isLastQuestion: boolean;
  onSelectOption: (optionIndex: number) => void;
  onProceedNext: () => void;
}

function StandardQuestionCard({
  question,
  selectedOptionIndex,
  isLastQuestion,
  onSelectOption,
  onProceedNext,
}: StandardQuestionCardProps) {
  const hasAnswered = selectedOptionIndex !== null;
  const isCorrectSelection =
    hasAnswered && selectedOptionIndex === question.correctIndex;
  const correctOption = question.options[question.correctIndex];
  const hasOptionImages = question.options.some((opt) => Boolean(opt.image));

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 [@media(max-height:660px)]:p-4 space-y-4 [@media(max-height:660px)]:space-y-3">
      <h2
        className="font-display text-xl sm:text-2xl [@media(max-height:660px)]:text-lg font-bold text-[#0f2942] leading-snug"
        style={{ textWrap: 'balance' }}
      >
        {question.question}
      </h2>

      {question.questionImage && (
        <div className="w-full rounded-xl border border-slate-200/80 bg-white p-2 flex items-center justify-center">
          <img
            src={question.questionImage.src}
            alt={question.questionImage.alt}
            className="w-full max-h-44 sm:max-h-48 [@media(max-height:660px)]:max-h-32 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Large 8-inch tablet touchscreen option cards */}
      <div
        className={
          hasOptionImages
            ? 'grid grid-cols-1 sm:grid-cols-3 gap-3'
            : 'grid grid-cols-1 sm:grid-cols-2 gap-3 [@media(max-height:660px)]:gap-2.5'
        }
      >
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          const isCorrectOption = idx === question.correctIndex;

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
              key={`${question.id}-opt-${idx}`}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelectOption(idx)}
              className={`w-full rounded-2xl border-2 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] ${cardStyle} ${
                hasOptionImages
                  ? 'p-3 flex flex-col items-center text-center gap-2'
                  : 'px-4 py-3.5 min-h-[68px] [@media(max-height:660px)]:min-h-[54px] [@media(max-height:660px)]:py-2.5 flex items-center justify-between gap-3'
              } ${!hasAnswered ? 'cursor-pointer active:scale-[0.97]' : 'cursor-default'}`}
            >
              {option.image && (
                <div className="w-full h-24 rounded-xl bg-white border border-slate-100 p-1.5 flex items-center justify-center overflow-hidden">
                  <img
                    src={option.image.src}
                    alt={option.image.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <span className="text-base sm:text-lg [@media(max-height:660px)]:text-base font-semibold leading-snug">
                {option.text}
              </span>

              {hasAnswered && isCorrectOption && !hasOptionImages && (
                <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" aria-hidden="true" />
              )}
              {hasAnswered && isSelected && !isCorrectOption && !hasOptionImages && (
                <XCircle className="w-6 h-6 text-red-700 shrink-0" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          aria-live="polite"
          className={`quiz-fade-in rounded-2xl border p-3.5 [@media(max-height:660px)]:p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
            isCorrectSelection
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {isCorrectSelection ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            )}

            <div className="space-y-0.5 min-w-0">
              <p className="text-sm sm:text-base font-bold leading-snug">
                {isCorrectSelection
                  ? 'Correct Answer!'
                  : `Incorrect! The correct answer is ${correctOption?.text ?? ''}.`}
              </p>

              {question.explanation && (
                <p className="text-xs sm:text-sm leading-snug opacity-90">
                  {question.explanation}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedNext}
            className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2 text-sm sm:text-base font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] active:scale-[0.97] rounded-xl transition-all cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
          >
            <span>{isLastQuestion ? 'View Score' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}
