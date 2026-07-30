import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Question, Answer } from '../types';
import { soundFx } from '../utils/sound';

interface QuestionCardProps {
  question: Question;
  selectedChoice?: 'A' | 'B' | null;
  onSelect?: (choice: 'A' | 'B') => void;
  answers?: Answer[];
  isAskerView?: boolean;
  disabled?: boolean;
  enableSwipe?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedChoice,
  onSelect,
  answers = [],
  isAskerView = false,
  disabled = false,
  enableSwipe = false
}) => {
  if (!question) return null;

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  // Compute tallies
  const totalAnswers = answers.length;
  const countA = answers.filter((a) => a.choice === 'A').length;
  const countB = answers.filter((a) => a.choice === 'B').length;
  const percentA = totalAnswers > 0 ? Math.round((countA / totalAnswers) * 100) : 0;
  const percentB = totalAnswers > 0 ? Math.round((countB / totalAnswers) * 100) : 0;

  // Touch Swipe handlers for mobile Answerer
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe || disabled || selectedChoice) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || !enableSwipe || disabled || selectedChoice) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;
    setSwipeOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!enableSwipe || disabled || selectedChoice || touchStartX === null) return;
    if (swipeOffset < -80 && onSelect) {
      // Swiped Left -> Option A
      soundFx.playChime();
      onSelect('A');
    } else if (swipeOffset > 80 && onSelect) {
      // Swiped Right -> Option B
      soundFx.playChime();
      onSelect('B');
    }
    setTouchStartX(null);
    setSwipeOffset(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -15 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full"
    >
      {/* Mobile Swipe Hint */}
      {enableSwipe && !selectedChoice && !disabled && (
        <div className="mb-2 text-center text-xs font-medium text-purple-500 dark:text-purple-300 sm:hidden flex items-center justify-center space-x-1 animate-pulse">
          <span>👈 Swipe Left for THIS</span>
          <span>•</span>
          <span>Swipe Right for THAT 👉</span>
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 transition-transform duration-100"
      >
        {/* VS Badge in the middle */}
        <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-sm font-black text-white shadow-lg ring-4 ring-white dark:ring-slate-900 animate-pulse">
          VS
        </div>

        {/* Option A (THIS) */}
        <motion.button
          whileHover={!disabled && !selectedChoice ? { scale: 1.02, y: -2 } : {}}
          whileTap={!disabled && !selectedChoice ? { scale: 0.98, y: 4 } : {}}
          onClick={() => {
            if (!disabled && onSelect && !selectedChoice) {
              soundFx.playPop();
              soundFx.playChime();
              onSelect('A');
            }
          }}
          disabled={disabled || (!!selectedChoice && !isAskerView)}
          type="button"
          className={`relative flex flex-col items-center justify-center rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-center transition-all overflow-hidden cursor-pointer ${
            selectedChoice === 'A'
              ? 'bg-amber-400 border-b-[8px] sm:border-b-[12px] border-amber-600 text-slate-900 shadow-xl shadow-amber-500/30'
              : selectedChoice === 'B'
              ? 'bg-slate-100 dark:bg-slate-800/80 border-b-[6px] border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-60'
              : 'bg-amber-100 hover:bg-amber-50 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border-b-[8px] sm:border-b-[12px] border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-100 shadow-md'
          }`}
        >
          <span className="text-6xl sm:text-7xl mb-3 hover:scale-110 transition-transform drop-shadow-md">
            {question.emojiA || '🥞'}
          </span>
          <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide leading-tight">
            {question.optionA}
          </span>
          <span className="mt-2 rounded-full bg-amber-200/80 dark:bg-amber-900/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-200">
            Option THIS
          </span>

          {/* Checkmark badge */}
          {selectedChoice === 'A' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-3 flex items-center space-x-1.5 rounded-full bg-slate-900/10 dark:bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-amber-900 dark:text-amber-100" />
              <span>{isAskerView ? 'Selected!' : 'You Picked This!'}</span>
            </motion.div>
          )}

          {/* Answerer tally bar for Asker / multi-answerer view */}
          {isAskerView && totalAnswers > 0 && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs font-black mb-1">
                <span>{percentA}%</span>
                <span>{countA} pick{countA !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-amber-200/80 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                  style={{ width: `${percentA}%` }}
                />
              </div>
            </div>
          )}
        </motion.button>

        {/* Option B (THAT) */}
        <motion.button
          whileHover={!disabled && !selectedChoice ? { scale: 1.02, y: -2 } : {}}
          whileTap={!disabled && !selectedChoice ? { scale: 0.98, y: 4 } : {}}
          onClick={() => {
            if (!disabled && onSelect && !selectedChoice) {
              soundFx.playPop();
              soundFx.playChime();
              onSelect('B');
            }
          }}
          disabled={disabled || (!!selectedChoice && !isAskerView)}
          type="button"
          className={`relative flex flex-col items-center justify-center rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-center transition-all overflow-hidden cursor-pointer ${
            selectedChoice === 'B'
              ? 'bg-sky-400 border-b-[8px] sm:border-b-[12px] border-sky-600 text-slate-900 shadow-xl shadow-sky-500/30'
              : selectedChoice === 'A'
              ? 'bg-slate-100 dark:bg-slate-800/80 border-b-[6px] border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 opacity-60'
              : 'bg-sky-100 hover:bg-sky-50 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 border-b-[8px] sm:border-b-[12px] border-sky-300 dark:border-sky-700 text-sky-950 dark:text-sky-100 shadow-md'
          }`}
        >
          <span className="text-6xl sm:text-7xl mb-3 hover:scale-110 transition-transform drop-shadow-md">
            {question.emojiB || '🧇'}
          </span>
          <span className="text-2xl sm:text-3xl font-black uppercase tracking-wide leading-tight">
            {question.optionB}
          </span>
          <span className="mt-2 rounded-full bg-sky-200/80 dark:bg-sky-900/80 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-sky-800 dark:text-sky-200">
            Option THAT
          </span>

          {/* Checkmark badge */}
          {selectedChoice === 'B' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-3 flex items-center space-x-1.5 rounded-full bg-slate-900/10 dark:bg-white/20 px-3 py-1 text-xs font-black backdrop-blur-sm"
            >
              <CheckCircle2 className="h-4 w-4 text-sky-900 dark:text-sky-100" />
              <span>{isAskerView ? 'Selected!' : 'You Picked That!'}</span>
            </motion.div>
          )}

          {/* Answerer tally bar for Asker / multi-answerer view */}
          {isAskerView && totalAnswers > 0 && (
            <div className="mt-4 w-full">
              <div className="flex justify-between text-xs font-black mb-1">
                <span>{percentB}%</span>
                <span>{countB} pick{countB !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-sky-200/80 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-sky-500 dark:bg-sky-400 transition-all duration-500"
                  style={{ width: `${percentB}%` }}
                />
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* Answerer list summary & attached notes / GIFs for Asker */}
      {isAskerView && answers.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            {answers.map((a) => (
              <span
                key={a.id}
                className={`inline-flex items-center space-x-1.5 rounded-full px-3.5 py-1 border-2 shadow-xs ${
                  a.choice === 'A'
                    ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200'
                    : 'bg-sky-100 border-sky-300 text-sky-900 dark:bg-sky-950/60 dark:border-sky-800 dark:text-sky-200'
                }`}
              >
                <span>{a.userName}:</span>
                <span className="font-black uppercase">
                  {a.choice === 'A' ? `${question.emojiA} ${question.optionA}` : `${question.emojiB} ${question.optionB}`}
                </span>
              </span>
            ))}
          </div>

          {/* Attached Notes & GIFs feed */}
          {answers.some((a) => a.note || a.gifUrl) && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 p-4 space-y-2.5 text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-500 block">
                💬 Answerer Notes & Reaction Stickers:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {answers
                  .filter((a) => a.note || a.gifUrl)
                  .map((a) => (
                    <div
                      key={a.id + '_note'}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
                    >
                      <span className="text-xl">
                        {a.choice === 'A' ? question.emojiA : question.emojiB}
                      </span>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-black uppercase text-slate-800 dark:text-white">
                          {a.userName}
                        </span>
                        {a.note && (
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic leading-snug">
                            "{a.note}"
                          </p>
                        )}
                        {a.gifUrl && (
                          <img
                            src={a.gifUrl}
                            alt="Answer GIF"
                            className="h-20 rounded-lg border border-pink-200 object-cover mt-1"
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
