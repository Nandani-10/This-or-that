import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Send, CheckCircle2, Image as ImageIcon, MessageCircle, X, Plus, Target } from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { GifPickerModal } from './GifPickerModal';
import { VersusReveal } from './VersusReveal';
import { RoomState } from '../types';
import { Confetti } from './Confetti';
import { soundFx } from '../utils/sound';

interface AnswererScreenProps {
  roomState: RoomState;
  userId: string;
  userName: string;
  onSubmitAnswer: (questionId: string, choice: 'A' | 'B', guessChoice?: 'A' | 'B', note?: string, gifUrl?: string) => void;
  onSendReaction: (emoji: string, note?: string, gifUrl?: string) => void;
  onSendQuestion?: (optionA: string, emojiA: string, optionB: string, emojiB: string, setAsCurrent?: boolean) => void;
  onNextQuestion?: () => void;
  onSelectQuestion?: (questionId: string) => void;
}

const REACTION_EMOJIS = ['😂', '😍', '😱', '🔥', '🤯', '💖', '💩', '🎉'];

export const AnswererScreen: React.FC<AnswererScreenProps> = ({
  roomState,
  userId,
  userName,
  onSubmitAnswer,
  onSendReaction,
  onSendQuestion,
  onNextQuestion,
  onSelectQuestion
}) => {
  const [triggerConfetti, setTriggerConfetti] = useState<boolean | number>(false);
  const [lastSentReaction, setLastSentReaction] = useState<string | null>(null);

  // Note & GIF state for Answer / Reaction
  const [answerNote, setAnswerNote] = useState('');
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isGifModalOpen, setIsGifModalOpen] = useState(false);

  // Reaction custom keyboard input
  const [typedReaction, setTypedReaction] = useState('');
  const [reactionNote, setReactionNote] = useState('');
  const [showReactionNoteInput, setShowReactionNoteInput] = useState(false);

  // Custom question creation state
  const [showAskDrawer, setShowAskDrawer] = useState(false);
  const [optA, setOptA] = useState('');
  const [emA, setEmA] = useState('🥞');
  const [optB, setOptB] = useState('');
  const [emB, setEmB] = useState('🧇');
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);

  const queuedQuestions = roomState.queuedQuestions || [];

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optA.trim() || !optB.trim() || !onSendQuestion) return;

    soundFx.playPop();
    onSendQuestion(optA.trim(), emA, optB.trim(), emB);
    setOptA('');
    setOptB('');
    setShowAskDrawer(false);
  };

  const currentQuestion = roomState.currentQuestion;

  // Check if current user already answered the active question
  const myAnswer = currentQuestion
    ? roomState.answers.find((a) => a.questionId === currentQuestion.id && a.userId === userId)
    : null;

  const [selectedGuess, setSelectedGuess] = useState<'A' | 'B' | null>(null);

  const handleSelectOption = (choice: 'A' | 'B') => {
    if (!currentQuestion || myAnswer) return;

    soundFx.playChime();
    setTriggerConfetti(Date.now());
    onSubmitAnswer(
      currentQuestion.id,
      choice,
      selectedGuess || undefined,
      answerNote.trim() || undefined,
      selectedGif || undefined
    );
    setSelectedGif(null);
    setAnswerNote('');
    setIsGifModalOpen(false);
  };

  const handleSelectGuess = (guess: 'A' | 'B') => {
    if (!currentQuestion) return;
    setSelectedGuess(guess);
    soundFx.playPop();

    // If already answered choice, update answer with guess
    if (myAnswer) {
      onSubmitAnswer(
        currentQuestion.id,
        myAnswer.choice,
        guess,
        myAnswer.note,
        myAnswer.gifUrl
      );
    }
  };

  const handleReaction = (emojiToSend: string) => {
    if (!emojiToSend.trim()) return;
    soundFx.playReaction();
    setLastSentReaction(emojiToSend.trim());
    onSendReaction(
      emojiToSend.trim(),
      reactionNote.trim() || undefined,
      selectedGif || undefined
    );
    setTypedReaction('');
    setReactionNote('');
    setSelectedGif(null);
    setIsGifModalOpen(false);
    setTimeout(() => setLastSentReaction(null), 1800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedReaction.trim()) {
      handleReaction(typedReaction.trim());
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 min-h-[80vh] flex flex-col justify-start">
      {/* Confetti canvas effect */}
      <Confetti trigger={triggerConfetti} />

      {/* GIF Selector Modal */}
      <GifPickerModal
        isOpen={isGifModalOpen}
        onClose={() => setIsGifModalOpen(false)}
        onSelectGif={(url) => {
          setSelectedGif(url);
          setIsGifModalOpen(false);
        }}
      />

      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-pink-100 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500 text-xl font-black text-white shadow-sm">
            ✨
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-800 dark:text-white">
              This or That Room
            </h2>
            <p className="text-xs font-bold text-slate-400">
              Room <span className="font-mono font-black text-purple-600 dark:text-purple-300 tracking-wider">{roomState.roomCode}</span>
            </p>
          </div>
        </div>

        {/* Typing indicator */}
        {roomState.isAskerTyping && (
          <div className="flex items-center space-x-2 rounded-full bg-pink-100 dark:bg-pink-950 border-2 border-pink-200 px-3 py-1 text-xs font-black text-pink-700 dark:text-pink-300 uppercase animate-pulse">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Someone is typing a question...</span>
          </div>
        )}
      </div>

      {/* SECTION 1 (TOP): SENT / LIVE QUESTION */}
      {currentQuestion ? (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="inline-block px-4 py-1 bg-white border-2 border-pink-200 text-pink-500 rounded-full text-xs font-black uppercase mb-1 shadow-xs dark:bg-slate-900 dark:border-pink-900 dark:text-pink-300">
              Active Question #{roomState.questions.length}
            </div>
            {currentQuestion.askedByName && (
              <p className="text-xs font-bold text-slate-400">
                Asked by <span className="text-purple-600 font-black">{currentQuestion.askedByName}</span>
              </p>
            )}
          </div>

          {/* Answer Attachment Bar (Note & GIF) before picking */}
          {!myAnswer && (
            <div className="bg-white dark:bg-slate-900 border-2 border-purple-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                  <span>Attach Note or GIF with Your Answer (Optional)</span>
                </label>

                <button
                  onClick={() => setIsGifModalOpen(true)}
                  type="button"
                  className="flex items-center space-x-1.5 px-3 py-1 bg-pink-100 hover:bg-pink-200 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-full text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>{selectedGif ? 'Change GIF' : '+ Add GIF'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={answerNote}
                  onChange={(e) => setAnswerNote(e.target.value)}
                  placeholder="e.g. Coffee is life! ☕ or 100% waffles!"
                  className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Selected GIF Preview */}
              {selectedGif && (
                <div className="relative inline-block rounded-2xl overflow-hidden border-2 border-pink-400 shadow-md">
                  <img src={selectedGif} alt="Attached GIF" className="h-20 w-32 object-cover" />
                  <button
                    onClick={() => setSelectedGif(null)}
                    className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-1 hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Guess Mode Selector */}
          {roomState.isGuessMode && currentQuestion && (
            <div className="rounded-2xl bg-amber-50 dark:bg-slate-800/80 border-2 border-amber-200 dark:border-amber-900/60 p-4 space-y-2 text-center shadow-xs">
              <p className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                <Target className="h-4 w-4 text-amber-500" />
                <span>Guess Mode: What do you think they picked?</span>
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => handleSelectGuess('A')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                    (myAnswer?.guessChoice || selectedGuess) === 'A'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-amber-200 dark:border-slate-700 hover:bg-amber-100'
                  }`}
                >
                  Guess {currentQuestion.emojiA} {currentQuestion.optionA}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectGuess('B')}
                  className={`py-2 px-3 rounded-xl text-xs font-black uppercase border-2 transition-all cursor-pointer ${
                    (myAnswer?.guessChoice || selectedGuess) === 'B'
                      ? 'bg-sky-500 text-white border-sky-600 shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-sky-200 dark:border-slate-700 hover:bg-sky-100'
                  }`}
                >
                  Guess {currentQuestion.emojiB} {currentQuestion.optionB}
                </button>
              </div>
            </div>
          )}

          <QuestionCard
            question={currentQuestion}
            selectedChoice={myAnswer ? myAnswer.choice : null}
            onSelect={handleSelectOption}
            enableSwipe={!myAnswer}
          />

          {/* Side-by-Side Versus Reveal Component */}
          <VersusReveal roomState={roomState} currentUserId={userId} />

          {/* Post-answer feedback */}
          {myAnswer && (
            <div className="rounded-2xl bg-emerald-50 dark:bg-slate-800 border-2 border-emerald-200 dark:border-slate-700 p-3 text-center space-y-1">
              <div className="flex items-center justify-center space-x-2 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Your answer is submitted!</span>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        /* Waiting State if no question is live yet */
        <div className="rounded-[32px] border-2 border-dashed border-pink-200 dark:border-slate-800 bg-pink-50/50 dark:bg-slate-900/50 p-6 text-center space-y-2">
          <span className="text-3xl">⏳</span>
          <h3 className="text-base font-black uppercase text-slate-800 dark:text-white">
            Waiting for next question...
          </h3>
          <p className="text-xs font-bold text-slate-500">
            Type your own question below or wait for someone to send one!
          </p>
        </div>
      )}

      {/* SECTION 2 (BELOW): TYPE & ASK A QUESTION DIRECTLY ON THE PAGE */}
      {onSendQuestion && (
        <div className="rounded-[32px] border-b-[8px] border-pink-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-pink-500" />
            <span>Type a New Question Below</span>
          </h3>

          <form onSubmit={handleCreateQuestion} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={emA}
                  onChange={(e) => setEmA(e.target.value)}
                  className="w-12 h-10 text-center text-xl rounded-xl border-2 border-amber-200 dark:border-slate-700 bg-amber-50 dark:bg-slate-800 font-bold"
                />
                <input
                  type="text"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Option THIS (e.g. Pancakes)"
                  required
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border-2 border-amber-200 dark:border-slate-700 bg-amber-50/50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={emB}
                  onChange={(e) => setEmB(e.target.value)}
                  className="w-12 h-10 text-center text-xl rounded-xl border-2 border-sky-200 dark:border-slate-700 bg-sky-50 dark:bg-slate-800 font-bold"
                />
                <input
                  type="text"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Option THAT (e.g. Waffles)"
                  required
                  className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border-2 border-sky-200 dark:border-slate-700 bg-sky-50/50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!optA.trim() || !optB.trim()}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 border-b-4 border-pink-700 text-white rounded-2xl text-xs font-black uppercase disabled:opacity-40 transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Question Live 🚀</span>
            </button>
          </form>
        </div>
      )}

      {/* Queued questions list if any exist */}
      {queuedQuestions.length > 0 && (
        <div className="rounded-2xl bg-amber-50/80 dark:bg-slate-900 border-2 border-amber-200 dark:border-slate-800 p-4 space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Upcoming Questions Queue ({queuedQuestions.length})
          </p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {queuedQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-xs"
              >
                <span className="font-bold text-slate-800 dark:text-white">
                  #{idx + 1} {q.emojiA} {q.optionA} vs {q.emojiB} {q.optionB}
                </span>
                {onSelectQuestion && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      onSelectQuestion(q.id);
                    }}
                    className="px-2.5 py-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  >
                    Launch
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: REACTION & GIF BLAST BAR */}
      <div className="rounded-[32px] border-b-[8px] border-purple-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Send Live Screen Blast:
          </p>
          <button
            type="button"
            onClick={() => setIsGifModalOpen(true)}
            className="text-xs font-black uppercase text-pink-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{selectedGif ? 'GIF Ready' : '+ Send GIF'}</span>
          </button>
        </div>

        {/* Selected GIF indicator if attached */}
        {selectedGif && (
          <div className="relative inline-block rounded-xl overflow-hidden border-2 border-pink-400">
            <img src={selectedGif} alt="Selected GIF" className="h-16 w-24 object-cover" />
            <button
              onClick={() => setSelectedGif(null)}
              className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full p-0.5 hover:bg-rose-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={typedReaction}
            onChange={(e) => setTypedReaction(e.target.value)}
            placeholder="Type emoji or reaction message... (e.g. 🥳 HYPE!)"
            className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-pink-200 dark:border-slate-700 bg-pink-50/50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={!typedReaction.trim() && !selectedGif}
            className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 border-b-4 border-pink-700 text-white rounded-2xl text-xs font-black uppercase disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Blast</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {REACTION_EMOJIS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReaction(emoji)}
              type="button"
              className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full border-b-4 border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg hover:bg-pink-50 transition-colors shadow-xs cursor-pointer"
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {lastSentReaction && (
          <p className="text-center text-xs font-black uppercase text-pink-600 dark:text-pink-300">
            Blasted "{lastSentReaction}" live! 🚀
          </p>
        )}
      </div>
    </div>
  );
};

