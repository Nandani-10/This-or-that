import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { Answer, Question, AnswererUser, RoomState } from '../types';
import { Confetti } from './Confetti';
import { soundFx } from '../utils/sound';

interface VersusRevealProps {
  roomState?: RoomState;
  question?: Question;
  answers?: Answer[];
  answerers?: AnswererUser[];
  currentUserId?: string;
  isGuessMode?: boolean;
}

export const VersusReveal: React.FC<VersusRevealProps> = ({
  roomState,
  question: propQuestion,
  answers: propAnswers,
  answerers: propAnswerers,
  currentUserId,
  isGuessMode: propIsGuessMode
}) => {
  const question = propQuestion || roomState?.currentQuestion;
  const answers = propAnswers || roomState?.answers || [];
  const answerers = propAnswerers || roomState?.answerers || [];
  const isGuessMode = propIsGuessMode ?? roomState?.isGuessMode ?? false;

  if (!question) {
    return null;
  }

  // Find two primary answerers to display in VS view
  let userA: { id: string; name: string } | null = null;
  let userB: { id: string; name: string } | null = null;

  const qAnswers = answers.filter((a) => a.questionId === question.id);

  if (qAnswers.length >= 2) {
    const ansA = qAnswers[0];
    const ansB = qAnswers[1];
    userA = { id: ansA.userId, name: ansA.userName };
    userB = { id: ansB.userId, name: ansB.userName };

    // If currentUserId is in answers, try to position currentUserId as userA
    if (currentUserId && ansB.userId === currentUserId) {
      userA = { id: ansB.userId, name: ansB.userName };
      userB = { id: ansA.userId, name: ansA.userName };
    }
  } else if (answerers.length >= 2) {
    userA = { id: answerers[0].id, name: answerers[0].name };
    userB = { id: answerers[1].id, name: answerers[1].name };
  }

  const ansA = qAnswers.find((a) => a.userId === userA?.id);
  const ansB = qAnswers.find((a) => a.userId === userB?.id);

  const choiceA = ansA?.choice;
  const choiceB = ansB?.choice;

  const isMatch = choiceA && choiceB && choiceA === choiceB;
  const isMismatch = choiceA && choiceB && choiceA !== choiceB;

  // Sound & celebration trigger
  useEffect(() => {
    if (isMatch) {
      soundFx.playMatchDing();
    } else if (isMismatch) {
      soundFx.playReaction();
    }
  }, [isMatch, isMismatch, question.id]);

  if (!userA || !userB || !ansA || !ansB) {
    return null;
  }

  const getOptionInfo = (choice?: 'A' | 'B') => {
    if (choice === 'A') return { text: question.optionA, emoji: question.emojiA };
    if (choice === 'B') return { text: question.optionB, emoji: question.emojiB };
    return { text: '...', emoji: '❓' };
  };

  const optAInfo = getOptionInfo(choiceA);
  const optBInfo = getOptionInfo(choiceB);

  // Guesses
  const guessA = ansA.guessChoice ? getOptionInfo(ansA.guessChoice) : null;
  const guessB = ansB.guessChoice ? getOptionInfo(ansB.guessChoice) : null;

  const isGuessACorrect = ansA.guessChoice && ansA.guessChoice === choiceB;
  const isGuessBCorrect = ansB.guessChoice && ansB.guessChoice === choiceA;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`relative w-full rounded-[36px] border-b-[10px] p-6 shadow-2xl transition-colors overflow-hidden ${
        isMatch
          ? 'border-pink-700 bg-gradient-to-b from-pink-500 to-rose-600 text-white dark:border-pink-900'
          : 'border-purple-700 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white dark:border-slate-800'
      }`}
    >
      {isMatch && <Confetti trigger={true} />}

      {/* Header Tag */}
      <div className="flex items-center justify-center mb-6">
        {isMatch ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="flex items-center space-x-2 rounded-full bg-white/20 border-2 border-white/40 px-5 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-inner"
          >
            <Heart className="h-4 w-4 text-pink-200 fill-pink-200 animate-pulse" />
            <span>100% In Sync! Match Made!</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="flex items-center space-x-2 rounded-full bg-amber-500/20 border-2 border-amber-400/40 px-5 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 backdrop-blur-md"
          >
            <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>Plot Twist! Total Opposites!</span>
          </motion.div>
        )}
      </div>

      {/* Side by Side Avatars / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center relative">
        {/* User A Card */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`rounded-3xl p-5 border-2 text-center backdrop-blur-md space-y-3 ${
            isMatch
              ? 'bg-white/15 border-white/30 text-white'
              : 'bg-white/10 border-purple-500/30 text-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-slate-900 font-black text-lg shadow-sm">
              {userA.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-black text-sm sm:text-base uppercase tracking-wide truncate max-w-[120px]">
              {userA.name} {userA.id === currentUserId ? '(You)' : ''}
            </span>
          </div>

          <div className="py-2">
            <span className="text-4xl sm:text-5xl block animate-bounce">{optAInfo.emoji}</span>
            <span className="mt-2 block font-black text-base sm:text-lg leading-tight">
              {optAInfo.text}
            </span>
          </div>

          {/* Note / GIF if attached */}
          {ansA.note && (
            <p className="text-xs font-bold italic bg-black/20 rounded-xl px-3 py-1.5 text-pink-100 max-w-full truncate">
              "{ansA.note}"
            </p>
          )}

          {/* Guess Mode reveal for User A */}
          {isGuessMode && guessA && (
            <div className="pt-2 border-t border-white/20 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                Guessed {userB.name} would pick:
              </span>
              <div className="mt-1 flex items-center justify-center gap-1 font-bold">
                <span>{guessA.emoji} {guessA.text}</span>
                {isGuessACorrect ? (
                  <span className="text-emerald-300 flex items-center gap-0.5 text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded-full font-black">
                    <CheckCircle2 className="h-3 w-3" /> Right! 🎯
                  </span>
                ) : (
                  <span className="text-rose-300 flex items-center gap-0.5 text-[10px] bg-rose-900/60 px-2 py-0.5 rounded-full font-black">
                    <XCircle className="h-3 w-3" /> Missed
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Center VS Divider */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none hidden sm:flex">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, delay: 0.3 }}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-xl shadow-2xl border-4 ${
              isMatch
                ? 'bg-amber-300 text-slate-900 border-white'
                : 'bg-purple-600 text-amber-300 border-purple-300'
            }`}
          >
            VS
          </motion.div>
        </div>

        {/* User B Card */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`rounded-3xl p-5 border-2 text-center backdrop-blur-md space-y-3 ${
            isMatch
              ? 'bg-white/15 border-white/30 text-white'
              : 'bg-white/10 border-purple-500/30 text-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-300 text-slate-900 font-black text-lg shadow-sm">
              {userB.name.charAt(0).toUpperCase()}
            </span>
            <span className="font-black text-sm sm:text-base uppercase tracking-wide truncate max-w-[120px]">
              {userB.name} {userB.id === currentUserId ? '(You)' : ''}
            </span>
          </div>

          <div className="py-2">
            <span className="text-4xl sm:text-5xl block animate-bounce">{optBInfo.emoji}</span>
            <span className="mt-2 block font-black text-base sm:text-lg leading-tight">
              {optBInfo.text}
            </span>
          </div>

          {/* Note / GIF if attached */}
          {ansB.note && (
            <p className="text-xs font-bold italic bg-black/20 rounded-xl px-3 py-1.5 text-pink-100 max-w-full truncate">
              "{ansB.note}"
            </p>
          )}

          {/* Guess Mode reveal for User B */}
          {isGuessMode && guessB && (
            <div className="pt-2 border-t border-white/20 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">
                Guessed {userA.name} would pick:
              </span>
              <div className="mt-1 flex items-center justify-center gap-1 font-bold">
                <span>{guessB.emoji} {guessB.text}</span>
                {isGuessBCorrect ? (
                  <span className="text-emerald-300 flex items-center gap-0.5 text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded-full font-black">
                    <CheckCircle2 className="h-3 w-3" /> Right! 🎯
                  </span>
                ) : (
                  <span className="text-rose-300 flex items-center gap-0.5 text-[10px] bg-rose-900/60 px-2 py-0.5 rounded-full font-black">
                    <XCircle className="h-3 w-3" /> Missed
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Outcome Banner */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center pt-3 border-t border-white/20"
      >
        {isMatch ? (
          <p className="text-sm font-black uppercase tracking-wide text-pink-100">
            ✨ Great minds think alike! You both chose <span className="underline">{optAInfo.emoji} {optAInfo.text}</span>!
          </p>
        ) : (
          <p className="text-sm font-black uppercase tracking-wide text-amber-200">
            🔥 Opposites attract! {userA.name} picked <span className="underline">{optAInfo.emoji} {optAInfo.text}</span> while {userB.name} picked <span className="underline">{optBInfo.emoji} {optBInfo.text}</span>!
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
