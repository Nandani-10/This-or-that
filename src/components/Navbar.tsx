import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Copy, Check, LogOut, Users } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { RoomState } from '../types';
import { CompatibilityMeter } from './CompatibilityMeter';

interface NavbarProps {
  roomCode?: string;
  role?: 'asker' | 'answerer' | null;
  roomState?: RoomState | null;
  currentUserId?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLeaveRoom?: () => void;
  onSwitchRole?: () => void;
  answererCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  role,
  roomState,
  currentUserId = '',
  darkMode,
  onToggleDarkMode,
  onLeaveRoom,
  onSwitchRole,
  answererCount = 0
}) => {
  const [copied, setCopied] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);

  const handleToggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFx.playPop();
  };

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    soundFx.playPop();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b-4 border-pink-100 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-8">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500 text-2xl font-black text-white shadow-md shadow-pink-200 dark:shadow-none animate-bounce-subtle">
            T
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black tracking-tight text-xl uppercase text-pink-600 dark:text-pink-400">
              This or That?
            </span>
            {role && (
              <button
                type="button"
                onClick={() => {
                  if (onSwitchRole) {
                    soundFx.playPop();
                    onSwitchRole();
                  }
                }}
                title="Click to toggle between Asker and Answerer modes"
                className="ml-1 inline-flex items-center gap-1 rounded-full bg-pink-100 hover:bg-pink-200 dark:bg-pink-950 dark:hover:bg-pink-900 border border-pink-300 dark:border-pink-800 px-2.5 py-0.5 text-xs font-black text-pink-700 dark:text-pink-300 uppercase cursor-pointer transition-all active:scale-95"
              >
                <span>{role === 'asker' ? '🎤 Asker' : '🙋 Answerer'}</span>
                <span className="text-[10px] text-pink-500 font-bold">⇄ Switch</span>
              </button>
            )}
          </div>
        </div>

        {/* Room badge + controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {roomState && currentUserId && (
            <div className="hidden sm:block">
              <CompatibilityMeter roomState={roomState} currentUserId={currentUserId} />
            </div>
          )}

          {roomCode && (
            <div className="flex items-center space-x-2 rounded-full bg-purple-100 dark:bg-purple-950/80 border-2 border-purple-200 dark:border-purple-800 px-3.5 py-1.5 text-xs font-bold text-purple-900 dark:text-purple-200">
              <span className="text-purple-500 dark:text-purple-400 font-black uppercase text-[10px] hidden xs:inline">Room:</span>
              <span className="font-black text-purple-700 dark:text-purple-300 text-base tracking-widest font-mono">{roomCode}</span>
              <button
                onClick={handleCopyCode}
                title="Copy Room Code"
                className="ml-0.5 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 transition-colors"
                type="button"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}

          {role === 'asker' && answererCount > 0 && (
            <div className="hidden sm:flex items-center space-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-200 dark:border-emerald-800/80 px-3 py-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase">
              <Users className="h-3.5 w-3.5" />
              <span>{answererCount} Live</span>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-purple-300 hover:bg-pink-50 dark:hover:bg-slate-700 transition-all active:translate-y-0.5"
            type="button"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-purple-600 dark:text-purple-300" /> : <VolumeX className="h-4 w-4 opacity-50" />}
          </button>

          {/* Dark Mode Switch */}
          <button
            onClick={() => {
              onToggleDarkMode();
              soundFx.playPop();
            }}
            title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-700 transition-all active:translate-y-0.5"
            type="button"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* Leave room */}
          {onLeaveRoom && roomCode && (
            <button
              onClick={() => {
                soundFx.playPop();
                onLeaveRoom();
              }}
              title="Leave Room"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-b-4 border-rose-200 dark:border-rose-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition-all active:translate-y-0.5"
              type="button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
