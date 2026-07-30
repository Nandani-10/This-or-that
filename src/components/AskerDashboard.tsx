import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Dices, Users, StopCircle, MessageCircle, Smile, CheckCircle, RefreshCw, Target } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { EmojiPickerPopover } from './EmojiPickerPopover';
import { VersusReveal } from './VersusReveal';
import { RoomState, PRESET_QUESTIONS } from '../types';
import { soundFx } from '../utils/sound';

interface AskerDashboardProps {
  roomState: RoomState;
  onSendQuestion: (optionA: string, emojiA: string, optionB: string, emojiB: string, setAsCurrent?: boolean) => void;
  onNextQuestion?: () => void;
  onSelectQuestion?: (questionId: string) => void;
  onRemoveQuestion?: (questionId: string) => void;
  onSendTyping: (isTyping: boolean) => void;
  onEndSession: () => void;
  onToggleGuessMode?: (isGuessMode: boolean) => void;
}

export const AskerDashboard: React.FC<AskerDashboardProps> = ({
  roomState,
  onSendQuestion,
  onNextQuestion,
  onSelectQuestion,
  onRemoveQuestion,
  onSendTyping,
  onEndSession,
  onToggleGuessMode
}) => {
  const [optionA, setOptionA] = useState('');
  const [emojiA, setEmojiA] = useState('🥞');
  const [optionB, setOptionB] = useState('');
  const [emojiB, setEmojiB] = useState('🧇');
  const [showEmojiPickerA, setShowEmojiPickerA] = useState(false);
  const [showEmojiPickerB, setShowEmojiPickerB] = useState(false);

  // Typing status effect
  useEffect(() => {
    const isTyping = optionA.length > 0 || optionB.length > 0;
    onSendTyping(isTyping);
  }, [optionA, optionB, onSendTyping]);

  // Handle Preset Inspiration
  const handleRandomInspiration = () => {
    soundFx.playPop();
    const randomItem = PRESET_QUESTIONS[Math.floor(Math.random() * PRESET_QUESTIONS.length)];
    setOptionA(randomItem.optionA);
    setEmojiA(randomItem.emojiA);
    setOptionB(randomItem.optionB);
    setEmojiB(randomItem.emojiB);
  };

  // Handle Send Question
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionA.trim() || !optionB.trim()) return;

    soundFx.playPop();
    onSendQuestion(optionA.trim(), emojiA, optionB.trim(), emojiB);

    // Reset inputs
    setOptionA('');
    setOptionB('');
    onSendTyping(false);
  };

  const currentQuestion = roomState.currentQuestion;
  const currentAnswers = currentQuestion
    ? roomState.answers.filter((a) => a.questionId === currentQuestion.id)
    : [];

  // Recent floating reactions
  const recentReactions = roomState.reactions.slice(-6);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
      {/* Live Floating Reactions Banner */}
      <AnimatePresence>
        {recentReactions.length > 0 && (
          <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
            {recentReactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1.2, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                className="flex items-center space-x-2 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-purple-200 dark:border-slate-700 px-4 py-2 shadow-xl backdrop-blur-md"
              >
                <span className="text-2xl animate-bounce">{r.emoji}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {r.userName} reacted!
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-full bg-white dark:bg-slate-900 border-2 border-pink-100 dark:border-slate-800 px-6 py-3.5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500 text-2xl font-black text-white shadow-md">
            🎤
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-wide text-slate-800 dark:text-white">
              Asker Control Center
            </h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {roomState.answerers.length > 0
                ? `${roomState.answerers.length} Answerer(s) connected in room!`
                : 'Waiting for Answerer to join room...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onEndSession}
            type="button"
            className="flex items-center space-x-1.5 rounded-full bg-white dark:bg-slate-800 border-b-4 border-rose-200 dark:border-rose-900 px-4 py-2 text-xs font-black uppercase text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <StopCircle className="h-4 w-4" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Active Live Question Status Card */}
      {currentQuestion ? (
        <div className="rounded-[36px] border-b-[10px] border-purple-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-purple-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Question Sent
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onToggleGuessMode && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    onToggleGuessMode(!roomState.isGuessMode);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                    roomState.isGuessMode
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-amber-50'
                  }`}
                >
                  <Target className="h-3.5 w-3.5" />
                  <span>Guess Mode: {roomState.isGuessMode ? 'ON 🎯' : 'OFF'}</span>
                </button>
              )}

              <div className="text-xs font-black uppercase text-slate-500">
                {currentAnswers.length} / {Math.max(1, roomState.answerers.length)} Answered
              </div>
            </div>
          </div>

          <QuestionCard
            question={currentQuestion}
            answers={currentAnswers}
            isAskerView={true}
            disabled={true}
          />

          {/* Versus Side-by-Side Live Reveal */}
          <div className="mt-4">
            <VersusReveal roomState={roomState} currentUserId={roomState.askerId} />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500 border-t border-purple-100 dark:border-slate-800 pt-3">
            <span>
              {roomState.queuedQuestions && roomState.queuedQuestions.length > 0
                ? `${roomState.queuedQuestions.length} question(s) waiting in queue!`
                : 'No pending questions in queue.'}
            </span>
            <div className="flex items-center gap-2">
              {roomState.queuedQuestions && roomState.queuedQuestions.length > 0 && onNextQuestion && (
                <button
                  onClick={() => {
                    soundFx.playPop();
                    onNextQuestion();
                  }}
                  type="button"
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-black uppercase text-xs cursor-pointer shadow-sm transition-all"
                >
                  🚀 Launch Next Queued Question
                </button>
              )}
              <button
                onClick={handleRandomInspiration}
                type="button"
                className="flex items-center space-x-1 text-purple-600 dark:text-purple-300 font-black uppercase hover:underline cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Preset</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[36px] border-2 border-dashed border-purple-200 dark:border-slate-800 bg-purple-50/50 dark:bg-slate-900/50 p-8 text-center">
          <span className="text-5xl">🚀</span>
          <h3 className="mt-2 text-lg font-black uppercase text-slate-800 dark:text-slate-200">
            Ready for your first question!
          </h3>
          <p className="text-xs font-bold text-slate-500 max-w-sm mx-auto mt-1">
            Fill out option THIS and option THAT below or launch one from the queue!
          </p>
        </div>
      )}

      {/* Live Question Queue Card */}
      {roomState.queuedQuestions && roomState.queuedQuestions.length > 0 && (
        <div className="rounded-[32px] border-2 border-amber-200 dark:border-slate-800 bg-amber-50/70 dark:bg-slate-900 p-6 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Question Queue ({roomState.queuedQuestions.length})</span>
            </h3>
            {onNextQuestion && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  onNextQuestion();
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer"
              >
                Advance Queue ➔
              </button>
            )}
          </div>

          <div className="space-y-2">
            {roomState.queuedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-amber-600 dark:text-amber-400">#{idx + 1}</span>
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-white">
                      {q.emojiA} {q.optionA} <span className="text-pink-500 font-black px-1">VS</span> {q.emojiB} {q.optionB}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">
                      Asked by: {q.askedByName || 'Participant'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onSelectQuestion && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        onSelectQuestion(q.id);
                      }}
                      className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-lg text-[11px] font-black uppercase cursor-pointer"
                    >
                      Make Live
                    </button>
                  )}
                  {onRemoveQuestion && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        onRemoveQuestion(q.id);
                      }}
                      className="px-2 py-1 text-slate-400 hover:text-rose-500 text-[11px] font-bold cursor-pointer"
                      title="Remove from queue"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send Question Form */}
      <div className="rounded-[36px] border-b-[10px] border-pink-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-black uppercase tracking-wide text-slate-800 dark:text-white flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-pink-500" />
            <span>Ask a Custom Question</span>
          </h3>

          <button
            onClick={handleRandomInspiration}
            type="button"
            className="flex items-center space-x-1.5 rounded-full bg-purple-100 border-2 border-purple-200 dark:bg-purple-900/50 dark:border-purple-800 px-3.5 py-1.5 text-xs font-black uppercase text-purple-700 dark:text-purple-300 hover:bg-purple-200 transition-colors cursor-pointer"
          >
            <Dices className="h-3.5 w-3.5" />
            <span>Need inspiration?</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option A Field */}
            <div className="relative">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Option THIS (Amber Vibe)
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPickerA(!showEmojiPickerA)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-amber-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-800 text-2xl hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  {emojiA}
                </button>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="e.g. Fresh Coffee"
                  required
                  className="w-full rounded-2xl border-2 border-amber-200 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {showEmojiPickerA && (
                <EmojiPickerPopover
                  onSelect={(e) => setEmojiA(e)}
                  onClose={() => setShowEmojiPickerA(false)}
                />
              )}
            </div>

            {/* Option B Field */}
            <div className="relative">
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                Option THAT (Sky Vibe)
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPickerB(!showEmojiPickerB)}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-sky-200 dark:border-slate-700 bg-sky-50 dark:bg-slate-800 text-2xl hover:bg-sky-100 transition-colors cursor-pointer"
                >
                  {emojiB}
                </button>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="e.g. Icy Juice"
                  required
                  className="w-full rounded-2xl border-2 border-sky-200 dark:border-slate-700 bg-sky-50/50 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-sky-400"
                />
              </div>

              {showEmojiPickerB && (
                <EmojiPickerPopover
                  onSelect={(e) => setEmojiB(e)}
                  onClose={() => setShowEmojiPickerB(false)}
                />
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-pink-500 hover:bg-pink-600 border-b-4 border-pink-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Send Question Live 🚀</span>
          </button>
        </form>
      </div>

      {/* History Feed */}
      {roomState.questions.length > 0 && (
        <div className="rounded-3xl border border-purple-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-purple-500" />
            <span>Sent Questions Feed ({roomState.questions.length})</span>
          </h3>

          <div className="space-y-3">
            {roomState.questions.slice().reverse().map((q, idx) => {
              const qAnswers = roomState.answers.filter((a) => a.questionId === q.id);
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3.5 text-xs"
                >
                  <div className="flex items-center space-x-2 font-semibold">
                    <span className="rounded-full bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 text-purple-700 dark:text-purple-300">
                      #{roomState.questions.length - idx}
                    </span>
                    <span>
                      {q.emojiA} {q.optionA} <span className="text-slate-400">vs</span> {q.emojiB} {q.optionB}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {qAnswers.length > 0 ? (
                      <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>{qAnswers.length} answered</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Waiting...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
