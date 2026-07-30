import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reaction } from '../types';

interface BlastParticle {
  id: string;
  emoji: string;
  x: number; // % starting horizontal position
  startY: number; // % starting vertical position
  deltaX: number; // px shift
  deltaY: number; // px shift upwards
  scale: number;
  rotation: number;
  duration: number;
  delay: number;
}

interface ActiveBlast {
  id: string;
  emoji: string;
  userName: string;
  note?: string;
  gifUrl?: string;
  particles: BlastParticle[];
}

const SingleBlastBanner: React.FC<{
  blast: ActiveBlast;
  onDismiss: (id: string) => void;
}> = ({ blast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(blast.id);
    }, 2500);
    return () => clearTimeout(timer);
  }, [blast.id, onDismiss]);

  return (
    <>
      {/* Top Banner Tag for Reaction & Note / GIF */}
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.8 }}
        animate={{ opacity: 1, y: 20, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
      >
        <div className="flex items-center gap-2.5 bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-5 py-2.5 rounded-full border-2 border-pink-400 dark:border-pink-500 shadow-2xl backdrop-blur-md">
          <span className="text-3xl animate-bounce">{blast.emoji}</span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black uppercase tracking-wider text-pink-400 dark:text-pink-600">
              {blast.userName} reacted!
            </span>
            {blast.note && (
              <span className="text-sm font-bold leading-tight max-w-xs truncate">
                "{blast.note}"
              </span>
            )}
          </div>
        </div>

        {blast.gifUrl && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="rounded-2xl border-4 border-white shadow-2xl overflow-hidden max-w-[200px] max-h-[140px]"
          >
            <img
              src={blast.gifUrl}
              alt="Reaction GIF"
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Flying / Bursting Emoji Particles */}
      {blast.particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 0,
            scale: 0.2,
            x: `${p.x}vw`,
            y: `${p.startY}vh`,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.2, p.scale, p.scale * 1.1, 0.4],
            x: `calc(${p.x}vw + ${p.deltaX}px)`,
            y: `calc(${p.startY}vh + ${p.deltaY}px)`,
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="absolute text-5xl sm:text-6xl drop-shadow-2xl select-none"
        >
          {p.emoji}
        </motion.div>
      ))}
    </>
  );
};

export const EmojiBlastOverlay: React.FC<{
  reactions: Reaction[];
  currentUserId?: string;
}> = ({ reactions }) => {
  const [blasts, setBlasts] = useState<ActiveBlast[]>([]);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!reactions || reactions.length === 0) return;

    const latest = reactions[reactions.length - 1];
    if (latest && !processedIds.has(latest.id)) {
      setProcessedIds((prev) => new Set([...prev, latest.id]));

      const blastId = latest.id || 'blast_' + Date.now();
      const particleCount = 20;
      const particles: BlastParticle[] = [];

      const baseEmoji = latest.emoji || '🔥';

      for (let i = 0; i < particleCount; i++) {
        const startX = 20 + Math.random() * 60;
        particles.push({
          id: `${blastId}_p_${i}`,
          emoji: baseEmoji,
          x: startX,
          startY: 85 + Math.random() * 10,
          deltaX: (Math.random() - 0.5) * 280,
          deltaY: -350 - Math.random() * 450,
          scale: 0.8 + Math.random() * 1.5,
          rotation: (Math.random() - 0.5) * 120,
          duration: 1.6 + Math.random() * 0.8,
          delay: Math.random() * 0.2,
        });
      }

      const newBlast: ActiveBlast = {
        id: blastId,
        emoji: baseEmoji,
        userName: latest.userName,
        note: latest.note,
        gifUrl: latest.gifUrl,
        particles,
      };

      setBlasts((prev) => [...prev.slice(-2), newBlast]);
    }
  }, [reactions, processedIds]);

  const handleDismiss = (blastId: string) => {
    setBlasts((prev) => prev.filter((b) => b.id !== blastId));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {blasts.map((blast) => (
          <SingleBlastBanner
            key={blast.id}
            blast={blast}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
