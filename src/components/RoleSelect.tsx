import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Dices, Users, MessageCircleHeart } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface RoleSelectProps {
  onStartAsker: (customCode?: string) => void;
  onJoinAnswerer: (code: string, name: string) => void;
  initialCode?: string;
  loading?: boolean;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({
  onStartAsker,
  onJoinAnswerer,
  initialCode = '',
  loading = false
}) => {
  const [roomCode, setRoomCode] = useState(initialCode);
  const [userName, setUserName] = useState('');
  const [mode, setMode] = useState<'select' | 'asker_setup' | 'answerer_setup'>(
    initialCode ? 'answerer_setup' : 'select'
  );
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateRoom = () => {
    soundFx.playPop();
    onStartAsker(roomCode.trim() || undefined);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || roomCode.trim().length < 4) {
      setErrorMsg('Please enter a valid 4-digit room code');
      soundFx.playPop();
      return;
    }
    setErrorMsg('');
    soundFx.playChime();
    onJoinAnswerer(roomCode.trim().toUpperCase(), userName.trim() || 'Friendly Answerer');
  };

  const generateRandomCode = () => {
    soundFx.playPop();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
  };

  return (
    <div className="mx-auto my-auto flex w-full max-w-xl flex-col items-center justify-center p-4 py-8">
      {/* Decorative Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <span className="mb-3 inline-flex items-center space-x-2 rounded-full bg-white border-2 border-pink-200 px-4 py-1 text-xs font-black uppercase text-pink-600 shadow-xs dark:bg-slate-900 dark:border-pink-900/60 dark:text-pink-300">
          <Sparkles className="h-3.5 w-3.5 text-pink-500" />
          <span>This or That</span>
        </span>
        <h1 className="mt-3 text-4xl sm:text-5xl font-black uppercase tracking-tight text-slate-800 dark:text-white">
          This or That?
        </h1>
        <p className="mt-2 text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          One person asks live custom questions, everyone else taps their favorite vibe!
        </p>
      </motion.div>

      {/* Main Choice Cards */}
      {mode === 'select' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full space-y-4"
        >
          <p className="text-center font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 text-sm mb-4">
            Pick Your Vibe Today
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Asker Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 4 }}
              onClick={() => {
                soundFx.playPop();
                setMode('asker_setup');
                generateRandomCode();
              }}
              type="button"
              className="group relative flex flex-col items-center justify-between rounded-[36px] bg-purple-500 hover:bg-purple-600 border-b-[10px] border-purple-700 p-6 text-white shadow-xl transition-all cursor-pointer text-left overflow-hidden"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-inner backdrop-blur-sm">
                🎤
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black uppercase tracking-wide">I'm Asking</h2>
                <p className="mt-1 text-xs font-semibold text-purple-100 leading-relaxed">
                  Create custom questions, send live choices & watch responses instantly!
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-black uppercase bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all">
                <span>Start as Asker</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Answerer Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 4 }}
              onClick={() => {
                soundFx.playPop();
                setMode('answerer_setup');
              }}
              type="button"
              className="group relative flex flex-col items-center justify-between rounded-[36px] bg-pink-500 hover:bg-pink-600 border-b-[10px] border-pink-700 p-6 text-white shadow-xl transition-all cursor-pointer text-left overflow-hidden"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl shadow-inner backdrop-blur-sm">
                🙋
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black uppercase tracking-wide">I'm Answering</h2>
                <p className="mt-1 text-xs font-semibold text-pink-100 leading-relaxed">
                  Enter a room code, tap big tactile cards & react with fun emojis!
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-black uppercase bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-all">
                <span>Join as Answerer</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Asker Setup */}
      {mode === 'asker_setup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[36px] border-b-[10px] border-purple-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-6 text-center">
            <span className="text-4xl">🎤</span>
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white mt-2">Create Asker Room</h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              Your 4-digit room code connects your Answerer(s) in real-time.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Room Code (4-digits)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 8492"
                  className="w-full rounded-2xl border-2 border-purple-200 bg-purple-50/50 px-4 py-3 font-mono text-center text-2xl font-black tracking-widest text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  title="Generate Random Code"
                  className="flex items-center space-x-1 rounded-2xl bg-purple-100 border-2 border-purple-200 px-4 text-xs font-black uppercase text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:border-purple-800 dark:text-purple-300 transition-colors"
                >
                  <Dices className="h-4 w-4" />
                  <span className="hidden sm:inline">Random</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={loading}
              type="button"
              className="w-full rounded-2xl bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'Creating Session...' : 'Create Room & Start Asking'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playPop();
                setMode('select');
              }}
              type="button"
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-2 uppercase tracking-wider"
            >
              ← Back to role choice
            </button>
          </div>
        </motion.div>
      )}

      {/* Answerer Setup */}
      {mode === 'answerer_setup' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[36px] border-b-[10px] border-pink-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-6 text-center">
            <span className="text-4xl">🙋</span>
            <h2 className="text-2xl font-black uppercase text-slate-800 dark:text-white mt-2">Join a Room</h2>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              Enter the 4-digit room code shared by your Asker.
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                4-Digit Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. 8492"
                required
                className="w-full rounded-2xl border-2 border-pink-200 bg-pink-50/50 px-4 py-3 font-mono text-center text-2xl font-black tracking-widest text-pink-600 dark:border-slate-700 dark:bg-slate-800 dark:text-pink-300 focus:outline-none focus:border-pink-400"
              />
              {errorMsg && <p className="mt-1.5 text-xs text-rose-500 font-bold">{errorMsg}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Your Nickname
              </label>
              <input
                type="text"
                maxLength={20}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-pink-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-pink-500 hover:bg-pink-600 border-b-4 border-pink-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageCircleHeart className="h-4 w-4" />
              <span>{loading ? 'Connecting...' : 'Join Session'}</span>
            </button>

            <button
              onClick={() => {
                soundFx.playPop();
                setMode('select');
              }}
              type="button"
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pt-2 uppercase tracking-wider"
            >
              ← Back to role choice
            </button>
          </form>
        </motion.div>
      )}

      {/* Quick Info Footer */}
      <div className="mt-8 flex items-center space-x-4 text-xs text-slate-400 dark:text-slate-500">
        <span className="flex items-center space-x-1">
          <Users className="h-3.5 w-3.5 text-purple-400" />
          <span>Multi-device sync</span>
        </span>
        <span>•</span>
        <span className="flex items-center space-x-1">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>No login needed</span>
        </span>
      </div>
    </div>
  );
};
