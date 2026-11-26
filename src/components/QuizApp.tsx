'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { QUIZ_QUESTIONS, QuizQuestion } from '@/data/questions';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import {
  getQuizMuted,
  playCorrectSound,
  playIncorrectSound,
  playTapSound,
  setQuizMuted,
} from '@/lib/quizAudio';
import { CaptchaGridChallenge, GridSavedState } from './CaptchaGridChallenge';
import { CaptchaPairsChallenge, PairsSavedState } from './CaptchaPairsChallenge';
import { CaptchaSequenceChallenge, SequenceSavedState } from './CaptchaSequenceChallenge';
import { FullscreenButton, OfflineIndicator, PWAInstallButton } from './PWAControls';
import { QuizResultsScreen } from './QuizResultsScreen';

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
  const [muted, setMuted] = useState(false);

  const {
    isInstallable,
    isInstalled,
    isIOS,
    isOnline,
    isFullscreen,
    canFullscreen,
    install,
    toggleFullscreen,
  } = usePWAInstall();

  const advancingRef = useRef(false);
  const scoredQuestionIdsRef = useRef<Set<number>>(new Set());

  const handleToggleMute = () => {
    const next = !getQuizMuted();
    setQuizMuted(next);
    setMuted(next);
    if (!next) {
      playTapSound();
    }
  };

  const goToNext = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    playTapSound();

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
    playTapSound();
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
    playTapSound();
    advancingRef.current = false;
    scoredQuestionIdsRef.current = new Set();
    setShuffleSeed(Math.floor(Math.random() * 100000) + 1);
    setAnswersById({});
    setCurrentIndex(0);
    setCorrectCount(0);
    setPhase('quiz');
  };

  const handleRestartQuiz = () => {
    playTapSound();
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

  const handleSelectOption = (question: QuizQuestion, optionIndex: number) => {
    if (answersById[question.id] || advancingRef.current) return;

    const isCorrect = optionIndex === question.correctIndex;
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    setAnswersById((prev) => ({
      ...prev,
      [question.id]: { kind: 'mcq', selectedOptionIndex: optionIndex },
    }));
    recordScoreOnce(question.id, isCorrect);
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

  // 1. Welcome Screen
  if (phase === 'welcome') {
    return (
      <main className="min-h-dvh w-full flex flex-col p-2.5 sm:p-4 md:p-6 overflow-y-auto">
        <motion.section
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          aria-labelledby="quiz-welcome-title"
          className="relative w-full flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm px-5 py-8 sm:px-10 sm:py-12 md:px-14 md:py-14 flex flex-col items-center justify-center text-center"
        >
          {/* Top-right exhibition controls: Offline badge + Fullscreen */}
          <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex items-center gap-2">
            <OfflineIndicator isOnline={isOnline} />
            <FullscreenButton
              canFullscreen={canFullscreen}
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
            />
          </div>

          <p className="text-lg sm:text-2xl font-medium text-slate-600">
            Welcome to the
          </p>

          <h1
            id="quiz-welcome-title"
            className="mt-2 font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f2942] leading-[1.12]"
          >
            Artificial Intelligence Quiz
          </h1>

          <p className="mt-2.5 sm:mt-3 text-xl sm:text-3xl font-semibold text-[#0d9488]">
            by Tricky Toddlers
          </p>

          <p className="mt-5 sm:mt-6 text-base sm:text-xl text-slate-600">
            Let&apos;s learn AI together!
          </p>

          <div className="mt-7 sm:mt-8 w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 450, damping: 24 }}
              type="button"
              onClick={handleStartQuiz}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 min-h-[56px] sm:min-h-[64px] px-8 sm:px-12 py-3.5 sm:py-4 text-lg sm:text-2xl font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-2xl shadow-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0d9488]"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.button>

            <PWAInstallButton
              isInstallable={isInstallable}
              isInstalled={isInstalled}
              isIOS={isIOS}
              onInstall={install}
            />
          </div>
        </motion.section>
      </main>
    );
  }

  // 4. Achievement Results Screen
  if (phase === 'results') {
    const finalScore =
      totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return (
      <QuizResultsScreen
        finalScore={finalScore}
        onRestartQuiz={handleRestartQuiz}
      />
    );
  }

  // 2. Quiz Screen & 3. Instant Answer Feedback
  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const savedEntry = answersById[currentQuestion.id];
  const hasAnswered = Boolean(savedEntry);

  const progressPercent = Math.round(
    ((currentIndex + (hasAnswered ? 1 : 0)) / totalQuestions) * 100
  );

  return (
    <main className="min-h-dvh w-full flex flex-col p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        className="w-full flex-1 flex flex-col gap-2.5 sm:gap-3"
      >
        {/* Responsive Header: Mobile wraps progress bar to row 2; Tablet/Laptop displays single inline row */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-3 gap-y-2 px-1">
          <div className="order-1 flex items-center gap-2">
            <span className="text-sm sm:text-lg font-bold text-[#0f2942] tabular-nums whitespace-nowrap">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <OfflineIndicator isOnline={isOnline} />
          </div>

          <div
            className="order-3 w-full sm:order-2 sm:w-auto sm:flex-1 h-2.5 sm:h-3 bg-slate-200 rounded-full overflow-hidden"
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

          <div className="order-2 sm:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton
              isInstallable={isInstallable}
              isInstalled={isInstalled}
              isIOS={isIOS}
              onInstall={install}
              compact
            />

            <FullscreenButton
              canFullscreen={canFullscreen}
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
            />

            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              onClick={handleToggleMute}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </motion.button>

            <motion.button
              whileTap={currentIndex > 0 ? { scale: 0.94 } : undefined}
              type="button"
              disabled={currentIndex === 0}
              onClick={goToPrevious}
              aria-label="Previous question"
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] sm:min-h-[44px] min-w-[70px] sm:min-w-[88px] px-2.5 sm:px-4 py-2 text-sm sm:text-base font-semibold rounded-xl border transition-colors ${
                currentIndex === 0
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'border-slate-300 bg-white text-[#0f2942] hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={goToNext}
              aria-label={isLastQuestion ? 'Finish quiz' : 'Next question'}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] sm:min-h-[44px] min-w-[70px] sm:min-w-[88px] px-2.5 sm:px-4 py-2 text-sm sm:text-base font-semibold rounded-xl border border-[#0f2942] bg-[#0f2942] text-white hover:bg-[#163a5c] transition-colors cursor-pointer"
            >
              <span>{isLastQuestion ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Question / Challenge Card */}
        <div className="flex-1 flex flex-col">
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
      </motion.div>
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
    <section className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm p-4 sm:p-6 md:p-8 flex flex-col justify-between gap-4 sm:gap-5">
      <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-[2.15rem] font-bold text-[#0f2942] leading-snug">
        {question.question}
      </h2>

      {question.questionImage && (
        <div className="w-full rounded-xl border border-slate-200/80 bg-white p-2.5 flex items-center justify-center">
          <img
            src={question.questionImage.src}
            alt={question.questionImage.alt}
            className="w-full max-h-40 sm:max-h-48 object-contain rounded-lg"
          />
        </div>
      )}

      {/* Large-text responsive option buttons filling available space */}
      <div
        className={
          hasOptionImages
            ? 'flex-1 grid grid-cols-1 sm:grid-cols-3 auto-rows-fr gap-3 sm:gap-4'
            : 'flex-1 grid grid-cols-1 sm:grid-cols-2 auto-rows-fr gap-3 sm:gap-4'
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
            <motion.button
              key={`${question.id}-opt-${idx}`}
              whileTap={!hasAnswered ? { scale: 0.96 } : undefined}
              animate={{ scale: hasAnswered && isSelected ? 1.01 : 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 24 }}
              type="button"
              disabled={hasAnswered}
              onClick={() => onSelectOption(idx)}
              className={`w-full min-h-[64px] sm:min-h-[80px] md:min-h-[88px] rounded-xl sm:rounded-2xl border-2 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488] ${cardStyle} ${
                hasOptionImages
                  ? 'p-3 sm:p-3.5 flex flex-col items-center text-center justify-center gap-2'
                  : 'px-4 py-3 sm:px-6 sm:py-5 flex items-center justify-between gap-3'
              } ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}`}
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

              <span className="text-base sm:text-xl lg:text-2xl font-semibold leading-snug">
                {option.text}
              </span>

              {hasAnswered && isCorrectOption && !hasOptionImages && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-700 shrink-0" aria-hidden="true" />
                </motion.span>
              )}
              {hasAnswered && isSelected && !isCorrectOption && !hasOptionImages && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-700 shrink-0" aria-hidden="true" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          aria-live="polite"
          className={`rounded-2xl border p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
            isCorrectSelection
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
            {isCorrectSelection ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-700 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1 min-w-0">
              <p className="text-base sm:text-xl font-bold leading-snug">
                {isCorrectSelection
                  ? 'Correct Answer!'
                  : `Incorrect! The correct answer is ${correctOption?.text ?? ''}.`}
              </p>

              {question.explanation && (
                <p className="text-sm sm:text-base lg:text-lg leading-snug opacity-95">
                  {question.explanation}
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onProceedNext}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[52px] px-6 py-2.5 text-base sm:text-lg font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-xl transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
          >
            <span>{isLastQuestion ? 'View Score' : 'Next Question'}</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}
