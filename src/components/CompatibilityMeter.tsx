import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Users, Sparkles, Target, X } from 'lucide-react';
import { RoomState } from '../types';
import {
  getTopPairCompatibilityForUser,
  getPairwiseCompatibilities,
  CompatibilityRecord
} from '../utils/compatibility';

interface CompatibilityMeterProps {
  roomState: RoomState;
  currentUserId: string;
}

export const CompatibilityMeter: React.FC<CompatibilityMeterProps> = ({
  roomState,
  currentUserId
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const answerers = roomState.answerers || [];
  if (answerers.length < 2) {
    return null; // Need at least 2 participants for compatibility calculation
  }

  const topPair = getTopPairCompatibilityForUser(
    roomState.answers,
    answerers,
    currentUserId
  );

  const allPairs = getPairwiseCompatibilities(roomState.answers, answerers);

  if (!topPair || topPair.totalShared === 0) {
    return (
      <div className="flex items-center space-x-2 rounded-full bg-pink-50 dark:bg-slate-800 border-2 border-pink-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-black text-pink-700 dark:text-pink-300 shadow-xs">
        <Heart className="h-3.5 w-3.5 text-pink-500 fill-pink-500" />
        <span>Vibe Check Ready</span>
      </div>
    );
  }

  return (
    <>
      {/* Pill Widget in Header / Floating */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 border-2 border-white text-white px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        <Heart className="h-3.5 w-3.5 fill-white animate-pulse" />
        <span>
          {topPair.userAName} & {topPair.userBName} : {topPair.matchPercent}% Match
        </span>
        <span className="text-[10px] opacity-80 font-mono">
          ({topPair.matches}/{topPair.totalShared})
        </span>
      </motion.button>

      {/* Detail Popover / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-[32px] border-b-[8px] border-pink-700 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-2xl text-slate-800 dark:text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-pink-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600">
                    <Heart className="h-4 w-4 fill-pink-500" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wide">
                    Live Vibe Compatibility
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Top Match Highlight */}
              <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 p-4 text-white space-y-2 shadow-md">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                  <span>Top Match</span>
                  <span className="flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{topPair.matchPercent}% Match</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-black">{topPair.userAName} & {topPair.userBName} : {topPair.matchPercent}% Match</span>
                  <span className="text-xs font-bold font-mono bg-white/20 px-2.5 py-1 rounded-full">
                    {topPair.matches} of {topPair.totalShared} matched
                  </span>
                </div>

                {topPair.totalGuessesCount > 0 && (
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center space-x-1">
                      <Target className="h-3.5 w-3.5" />
                      <span>Guess Accuracy</span>
                    </span>
                    <span>{topPair.guessPercent}% ({topPair.correctGuessesCount}/{topPair.totalGuessesCount})</span>
                  </div>
                )}
              </div>

              {/* Pairwise List */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  All Room Pairings ({allPairs.length})
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {allPairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Users className="h-3.5 w-3.5 text-purple-500" />
                        <span className="font-bold">
                          {pair.userAName} & {pair.userBName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-pink-500 rounded-full"
                            style={{ width: `${pair.matchPercent}%` }}
                          />
                        </div>
                        <span className="font-black text-pink-600 dark:text-pink-400 font-mono w-10 text-right">
                          {pair.matchPercent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black uppercase cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
