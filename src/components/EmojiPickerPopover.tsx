import React, { useState } from 'react';

const EMOJI_CATEGORIES: { name: string; emojis: string[] }[] = [
  { name: 'Popular', emojis: ['🥞', '🧇', '🐶', '🐱', '🍕', '🌮', '☕', '🍵', '🏖️', '🏔️', '🍩', '🍔', '🍦', '🍓', '🍣', '🍫'] },
  { name: 'Fun & Activities', emojis: ['🎉', '🚀', '📚', '🎧', '🎮', '🎬', '🎨', '⚽', '🎸', '✈️', '🎪', '🧩', '🎤', '🏆', '🍿', '🛍️'] },
  { name: 'Vibes & Nature', emojis: ['☀️', '❄️', '🌈', '🔥', '💖', '✨', '🌸', '🌴', '🦉', '🦄', '👻', '⏳', '⭐', '🌊', '🍀', '💡'] },
  { name: 'Reactions', emojis: ['😂', '😍', '😱', '🥳', '🤯', '😎', '😴', '💩', '🙌', '👀', '💃', '😜', '🙈', '🎯', '💯', '🔥'] }
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPickerPopover: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [customInput, setCustomInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onSelect(customInput.trim());
      onClose();
    }
  };

  return (
    <div className="absolute z-30 mt-2 w-72 rounded-2xl border-2 border-pink-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-2 flex items-center justify-between border-b border-purple-50 pb-2 dark:border-slate-700">
        <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-300">Pick or Type Emoji</span>
        <button
          onClick={onClose}
          type="button"
          className="rounded-full p-1 text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Direct Keyboard Input */}
      <form onSubmit={handleCustomSubmit} className="mb-2.5 flex gap-1.5">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Type any emoji from keyboard..."
          className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:border-pink-400"
        />
        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-black uppercase disabled:opacity-40 cursor-pointer"
        >
          Use
        </button>
      </form>

      <div className="mb-2 flex space-x-1 overflow-x-auto pb-1 text-xs no-scrollbar">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold transition-colors cursor-pointer ${
              activeTab === idx
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1">
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl hover:scale-110 hover:bg-purple-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
