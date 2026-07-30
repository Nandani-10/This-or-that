import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Copy, Check, RotateCcw, Heart, Zap, Sparkles, Target } from 'lucide-react';
import { RoomState } from '../types';
import { Confetti } from './Confetti';
import { soundFx } from '../utils/sound';
import { getPairwiseCompatibilities, CompatibilityRecord } from '../utils/compatibility';

interface SummaryScreenProps {
  roomState: RoomState;
  role: 'asker' | 'answerer' | null;
  onRestartSession: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  roomState,
  onRestartSession
}) => {
  const [copied, setCopied] = useState(false);
  const totalQuestions = roomState.questions.length;
  const totalAnswers = roomState.answers.length;

  const answerers = roomState.answerers || [];
  const pairRecords = getPairwiseCompatibilities(roomState.answers, answerers);
  const primaryPair: CompatibilityRecord | null = pairRecords.length > 0 ? pairRecords[0] : null;

  // Matched & mismatched questions details for primary pair
  const matchedQuestions = primaryPair
    ? roomState.questions.filter((q) => primaryPair.matchedQuestionIds.includes(q.id))
    : [];

  const mismatchedQuestions = primaryPair
    ? roomState.questions.filter((q) => primaryPair.mismatchedQuestionIds.includes(q.id))
    : [];

  // Generate narrative share text
  const generateShareText = () => {
    let text = `💖 THIS OR THAT COMPATIBILITY REPORT (Room ${roomState.roomCode}) 💖\n\n`;

    if (primaryPair) {
      text += `👥 Pair: ${primaryPair.userAName} & ${primaryPair.userBName}\n`;
      text += `🎯 Match Score: ${primaryPair.matchPercent}% (${primaryPair.matches}/${primaryPair.totalShared} decisions matched)\n`;

      if (primaryPair.totalGuessesCount > 0) {
        text += `🔮 Guess Intuition: ${primaryPair.guessPercent}% (${primaryPair.correctGuessesCount}/${primaryPair.totalGuessesCount} correct guesses)\n`;
      }
      text += `\n`;

      if (matchedQuestions.length > 0) {
        text += `💚 MATCHES (${matchedQuestions.length}):\n`;
        matchedQuestions.forEach((q) => {
          const ans = roomState.answers.find((a) => a.questionId === q.id && a.userId === primaryPair.userAId);
          const opt = ans?.choice === 'A' ? `${q.emojiA} ${q.optionA}` : `${q.emojiB} ${q.optionB}`;
          text += `  • ${opt}\n`;
        });
        text += `\n`;
      }

      if (mismatchedQuestions.length > 0) {
        text += `🧡 DISAGREEMENTS (${mismatchedQuestions.length}):\n`;
        mismatchedQuestions.forEach((q) => {
          const ansA = roomState.answers.find((a) => a.questionId === q.id && a.userId === primaryPair.userAId);
          const ansB = roomState.answers.find((a) => a.questionId === q.id && a.userId === primaryPair.userBId);
          const optA = ansA?.choice === 'A' ? `${q.emojiA} ${q.optionA}` : `${q.emojiB} ${q.optionB}`;
          const optB = ansB?.choice === 'A' ? `${q.emojiA} ${q.optionA}` : `${q.emojiB} ${q.optionB}`;
          text += `  • ${q.optionA} vs ${q.optionB}: ${primaryPair.userAName} picked [${optA}] | ${primaryPair.userBName} picked [${optB}]\n`;
        });
      }
    } else {
      text += `📊 Questions: ${totalQuestions} | Answers: ${totalAnswers}\n`;
    }

    return text;
  };

  const handleCopySummary = () => {
    soundFx.playPop();
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    soundFx.playFanfare();
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 py-8">
      <Confetti trigger={true} />

      {/* Shareable Compatibility Card Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[36px] border-b-[10px] border-pink-700 bg-gradient-to-b from-pink-500 via-rose-500 to-purple-600 p-8 text-center text-white shadow-2xl space-y-4 relative overflow-hidden"
      >
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 text-4xl shadow-inner backdrop-blur-md">
          💖
        </span>

        <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Compatibility Report
        </h1>

        {primaryPair ? (
          <div className="space-y-3 max-w-lg mx-auto">
            <p className="text-sm sm:text-base font-extrabold text-pink-100">
              <span className="bg-white/20 px-3 py-1 rounded-full">{primaryPair.userAName} & {primaryPair.userBName} : {primaryPair.matchPercent}% Match</span>
            </p>

            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-black uppercase">
                <span>Vibe Match Score</span>
                <span className="text-amber-200 font-mono text-base">{primaryPair.matchPercent}%</span>
              </div>

              <div className="h-4 w-full rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full bg-amber-300 rounded-full transition-all duration-1000"
                  style={{ width: `${primaryPair.matchPercent}%` }}
                />
              </div>

              <p className="text-xs font-bold text-pink-100 text-center pt-1">
                Matched on <span className="underline font-black">{primaryPair.matches}</span> out of {primaryPair.totalShared} shared decisions!
              </p>

              {primaryPair.totalGuessesCount > 0 && (
                <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-center gap-2 text-xs font-extrabold text-amber-200">
                  <Target className="h-4 w-4" />
                  <span>Intuition Score: Guessed correctly {primaryPair.correctGuessesCount}/{primaryPair.totalGuessesCount} times ({primaryPair.guessPercent}%) 🎯</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm font-bold text-pink-100 max-w-md mx-auto">
            Here is how all the decisions stacked up during room <span className="font-mono font-black underline">{roomState.roomCode}</span>.
          </p>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={handleCopySummary}
          type="button"
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 px-5 py-3 text-xs font-black uppercase text-slate-700 dark:text-slate-200 shadow-md hover:bg-pink-50 transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-purple-500" />}
          <span>{copied ? 'Report Copied!' : 'Copy Compatibility Card'}</span>
        </button>

        <button
          onClick={() => {
            soundFx.playPop();
            onRestartSession();
          }}
          type="button"
          className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-2xl bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800 px-6 py-3 text-xs font-black uppercase text-white shadow-lg cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start New Session</span>
        </button>
      </div>

      {/* Matched Decisions Section */}
      {primaryPair && matchedQuestions.length > 0 && (
        <div className="rounded-[36px] border-b-[10px] border-emerald-300 dark:border-emerald-950 bg-emerald-50/70 dark:bg-slate-900 p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-300 flex items-center space-x-2">
            <Heart className="h-5 w-5 fill-emerald-500 text-emerald-500" />
            <span>Matched Decisions ({matchedQuestions.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matchedQuestions.map((q) => {
              const ans = roomState.answers.find((a) => a.questionId === q.id && a.userId === primaryPair.userAId);
              const opt = ans?.choice === 'A' ? { text: q.optionA, emoji: q.emojiA } : { text: q.optionB, emoji: q.emojiB };

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 space-y-1 shadow-xs"
                >
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
                    You both chose:
                  </span>
                  <div className="flex items-center space-x-2 text-sm font-black text-slate-800 dark:text-white">
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{opt.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mismatched / Plot Twist Section */}
      {primaryPair && mismatchedQuestions.length > 0 && (
        <div className="rounded-[36px] border-b-[10px] border-amber-300 dark:border-amber-950 bg-amber-50/70 dark:bg-slate-900 p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black uppercase tracking-wide text-amber-900 dark:text-amber-300 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span>Plot Twists / Disagreements ({mismatchedQuestions.length})</span>
          </h3>

          <div className="space-y-3">
            {mismatchedQuestions.map((q) => {
              const ansA = roomState.answers.find((a) => a.questionId === q.id && a.userId === primaryPair.userAId);
              const ansB = roomState.answers.find((a) => a.questionId === q.id && a.userId === primaryPair.userBId);

              const optA = ansA?.choice === 'A' ? { text: q.optionA, emoji: q.emojiA } : { text: q.optionB, emoji: q.emojiB };
              const optB = ansB?.choice === 'A' ? { text: q.optionA, emoji: q.emojiA } : { text: q.optionB, emoji: q.emojiB };

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 space-y-2 shadow-xs"
                >
                  <p className="text-xs font-black uppercase text-amber-800 dark:text-amber-300">
                    Question: {q.emojiA} {q.optionA} vs {q.emojiB} {q.optionB}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1 border-t border-slate-100 dark:border-slate-700">
                    <div className="bg-amber-50 dark:bg-slate-900 p-2 rounded-xl border border-amber-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">{primaryPair.userAName}:</span>
                      <span className="text-slate-800 dark:text-white font-black">{optA.emoji} {optA.text}</span>
                    </div>
                    <div className="bg-sky-50 dark:bg-slate-900 p-2 rounded-xl border border-sky-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">{primaryPair.userBName}:</span>
                      <span className="text-slate-800 dark:text-white font-black">{optB.emoji} {optB.text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Pairwise Combinations (if > 2 participants) */}
      {pairRecords.length > 1 && (
        <div className="rounded-[36px] border-b-[10px] border-purple-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black uppercase tracking-wide text-slate-800 dark:text-white flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span>Pairwise Compatibility Overview ({pairRecords.length} Pairs)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pairRecords.map((pair, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <span className="font-extrabold text-slate-800 dark:text-white">
                  {pair.userAName} & {pair.userBName}
                </span>
                <span className="font-black text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-950 px-2.5 py-1 rounded-full font-mono">
                  {pair.matchPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
