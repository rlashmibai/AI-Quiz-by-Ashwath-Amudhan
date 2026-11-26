'use client';

import { useEffect, useMemo } from 'react';
import {
  BrainCircuit,
  Compass,
  Lightbulb,
  Medal,
  Rocket,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { motion } from 'motion/react';
import { playCelebrationSound } from '@/lib/quizAudio';

interface AchievementTier {
  id: 'explorer' | 'beginner' | 'learner' | 'enthusiast' | 'expert' | 'champion';
  title: string;
  imageSrc: string;
  imageAlt: string;
  message: string;
  gradientClass: string;
  badgeBgClass: string;
  scoreColorClass: string;
  ringClass: string;
  showConfetti: boolean;
}

function getAchievementTier(score: number): AchievementTier {
  if (score <= 20) {
    return {
      id: 'explorer',
      title: 'AI Explorer',
      imageSrc: '/images/achievements/explorer.jpg',
      imageAlt: '3D adventure compass illustration for AI Explorer',
      message:
        "Every great discovery starts with curiosity! Keep exploring the exciting world of AI, and you're off to a wonderful start!",
      gradientClass: 'from-teal-500 via-emerald-500 to-cyan-500',
      badgeBgClass: 'bg-teal-600 text-white',
      scoreColorClass: 'text-teal-700',
      ringClass: 'ring-teal-200 border-teal-200',
      showConfetti: false,
    };
  }
  if (score <= 40) {
    return {
      id: 'beginner',
      title: 'AI Beginner',
      imageSrc: '/images/achievements/beginner.jpg',
      imageAlt: '3D glowing light bulb illustration for AI Beginner',
      message:
        "Bright ideas are sparking! You're lighting up your AI journey and discovering how smart technology works!",
      gradientClass: 'from-amber-400 via-orange-400 to-yellow-500',
      badgeBgClass: 'bg-amber-500 text-white',
      scoreColorClass: 'text-amber-600',
      ringClass: 'ring-amber-200 border-amber-200',
      showConfetti: false,
    };
  }
  if (score <= 60) {
    return {
      id: 'learner',
      title: 'AI Learner',
      imageSrc: '/images/achievements/learner.jpg',
      imageAlt: '3D glowing digital brain illustration for AI Learner',
      message:
        'Awesome progress! Your digital thinking skills are growing stronger with every AI concept you unlock!',
      gradientClass: 'from-violet-600 via-purple-600 to-cyan-500',
      badgeBgClass: 'bg-violet-600 text-white',
      scoreColorClass: 'text-violet-700',
      ringClass: 'ring-violet-200 border-violet-200',
      showConfetti: false,
    };
  }
  if (score <= 80) {
    return {
      id: 'enthusiast',
      title: 'AI Enthusiast',
      imageSrc: '/images/achievements/enthusiast.jpg',
      imageAlt: '3D colourful rocket illustration for AI Enthusiast',
      message:
        'Ready for liftoff! You have an impressive grasp of Artificial Intelligence and how it powers everyday life!',
      gradientClass: 'from-blue-600 via-indigo-600 to-sky-500',
      badgeBgClass: 'bg-blue-600 text-white',
      scoreColorClass: 'text-blue-700',
      ringClass: 'ring-blue-200 border-blue-200',
      showConfetti: false,
    };
  }
  if (score <= 90) {
    return {
      id: 'expert',
      title: 'AI Expert',
      imageSrc: '/images/achievements/expert.jpg',
      imageAlt: '3D gleaming achievement medal illustration for AI Expert',
      message:
        'Outstanding achievement! Your sharp AI knowledge and problem-solving skills truly shine!',
      gradientClass: 'from-indigo-700 via-blue-700 to-purple-600',
      badgeBgClass: 'bg-indigo-700 text-white',
      scoreColorClass: 'text-indigo-700',
      ringClass: 'ring-indigo-300 border-indigo-300',
      showConfetti: true,
    };
  }
  return {
    id: 'champion',
    title: 'AI Champion',
    imageSrc: '/images/achievements/champion.jpg',
    imageAlt: '3D golden championship trophy illustration for AI Champion',
    message:
      "Phenomenal mastery! You're an unstoppable AI Champion, ready to imagine, innovate, and inspire the future!",
    gradientClass: 'from-amber-500 via-orange-500 to-rose-500',
    badgeBgClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    scoreColorClass: 'text-amber-600',
    ringClass: 'ring-amber-300 border-amber-300',
    showConfetti: true,
  };
}

function AchievementIcon({ id }: { id: AchievementTier['id'] }) {
  switch (id) {
    case 'explorer':
      return <Compass className="w-5 h-5" aria-hidden="true" />;
    case 'beginner':
      return <Lightbulb className="w-5 h-5" aria-hidden="true" />;
    case 'learner':
      return <BrainCircuit className="w-5 h-5" aria-hidden="true" />;
    case 'enthusiast':
      return <Rocket className="w-5 h-5" aria-hidden="true" />;
    case 'expert':
      return <Medal className="w-5 h-5" aria-hidden="true" />;
    case 'champion':
      return <Trophy className="w-5 h-5" aria-hidden="true" />;
  }
}

const CONFETTI_COLORS = [
  '#F59E0B',
  '#EC4899',
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#06B6D4',
];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, idx) => ({
        id: idx,
        leftPercent: ((idx * 23 + 7) % 94) + 3,
        delay: (idx % 7) * 0.14,
        duration: 2.6 + (idx % 5) * 0.45,
        size: 8 + (idx % 4) * 3,
        rotateEnd: (idx % 2 === 0 ? 1 : -1) * (240 + (idx % 5) * 90),
        driftX: ((idx % 7) - 3) * 18,
        color: CONFETTI_COLORS[idx % CONFETTI_COLORS.length],
        isCircle: idx % 3 === 0,
      })),
    []
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-30"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ y: -24, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: '105vh',
            x: piece.driftX,
            opacity: [1, 1, 0.85, 0],
            rotate: piece.rotateEnd,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: 2,
            ease: 'easeIn',
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: `${piece.leftPercent}%`,
            width: piece.size,
            height: piece.isCircle ? piece.size : piece.size * 0.55,
            backgroundColor: piece.color,
            borderRadius: piece.isCircle ? '9999px' : '2px',
          }}
        />
      ))}
    </div>
  );
}

interface QuizResultsScreenProps {
  finalScore: number;
  onRestartQuiz: () => void;
}

export function QuizResultsScreen({
  finalScore,
  onRestartQuiz,
}: QuizResultsScreenProps) {
  const tier = getAchievementTier(finalScore);

  useEffect(() => {
    playCelebrationSound(tier.showConfetti);
  }, [tier.showConfetti]);

  return (
    <main className="min-h-dvh w-full flex flex-col p-2.5 sm:p-4 md:p-6 overflow-y-auto">
      {tier.showConfetti && <ConfettiBurst />}

      <motion.section
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        aria-labelledby="quiz-completed-title"
        className={`relative z-10 w-full flex-1 flex flex-col rounded-2xl sm:rounded-3xl border-2 bg-white shadow-lg overflow-hidden ring-4 ${tier.ringClass}`}
      >
        {/* Colourful Celebratory Top Ribbon */}
        <div
          className={`bg-gradient-to-r ${tier.gradientClass} px-5 py-4 sm:px-8 sm:py-5 text-white flex flex-col sm:flex-row sm:items-center items-start justify-between gap-3`}
        >
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest opacity-90">
              Artificial Intelligence Quiz
            </p>
            <h1
              id="quiz-completed-title"
              className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold"
            >
              Quiz Completed!
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs border border-white/30 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden="true" />
            <span className="font-display text-base sm:text-xl font-extrabold tracking-wide">
              {tier.title}
            </span>
          </div>
        </div>

        {/* Screenshot-Worthy 2-Column Achievement Certificate Body */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 items-center">
          {/* Left Visual Achievement Badge & Illustration */}
          <div className="md:col-span-5 h-full flex flex-col items-center justify-center text-center gap-4 rounded-2xl sm:rounded-3xl bg-slate-50/80 border border-slate-200/70 p-4 sm:p-6">
            <motion.div
              initial={{ scale: 0.85, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 max-w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white shadow-md ring-2 ring-slate-200/80"
            >
              <img
                src={tier.imageSrc}
                alt={tier.imageAlt}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div
              className={`inline-flex items-center gap-2.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl font-display text-lg sm:text-xl md:text-2xl font-bold shadow-xs ${tier.badgeBgClass}`}
            >
              <AchievementIcon id={tier.id} />
              <span>{tier.title}</span>
            </div>
          </div>

          {/* Right Score, Encouraging Message, Thank You & Restart */}
          <div className="md:col-span-7 flex flex-col items-center md:items-start justify-center text-center md:text-left space-y-4 sm:space-y-5 md:px-2">
            <div>
              <p className="text-base sm:text-xl md:text-2xl font-semibold text-slate-500">
                Your Score
              </p>
              <div
                className={`mt-1 font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tabular-nums ${tier.scoreColorClass}`}
              >
                {finalScore} / 100
              </div>
            </div>

            <div className="w-full rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 md:p-6">
              <p className="text-base sm:text-xl md:text-[1.35rem] font-semibold text-[#0f2942] leading-relaxed">
                {tier.message}
              </p>
            </div>

            <div className="w-full pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-lg sm:text-2xl font-bold text-[#0f2942]">
                  Thank you for participating!
                </p>
                <p className="text-sm sm:text-lg text-slate-600">
                  Keep exploring. Keep learning.
                </p>
                <p className="pt-0.5 text-base sm:text-xl font-extrabold text-[#0d9488]">
                  Tricky Toddlers
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                type="button"
                onClick={onRestartQuiz}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[52px] sm:min-h-[58px] px-7 sm:px-8 py-3 text-base sm:text-xl font-semibold text-white bg-[#0f2942] hover:bg-[#163a5c] rounded-xl shadow-sm transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d9488]"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>Restart Quiz</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
