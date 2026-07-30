import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

export interface GifOption {
  id: string;
  title: string;
  url: string;
  category: string;
}

export const POPULAR_GIFS: GifOption[] = [
  {
    id: 'mind_blown',
    title: 'Mind Blown',
    category: 'Excited',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnAxd2w1YXpna2tvd3F1aGpxZmsxYXlzOHh0Zm0xMmppdW5lZGFtMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif',
  },
  {
    id: 'coffee_life',
    title: 'Coffee Power',
    category: 'Drinks',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHY5MmlidmxseHRhZmxsbmxsNmxmcTB3MXAxeTRuZnlnbjZid2ZzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o85xGocUH8RYoDKKs/giphy.gif',
  },
  {
    id: 'fire_dance',
    title: 'Hyped Dance',
    category: 'Party',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbms5ejdtb2x5OHowNHlyZXNkbTVpOHMyaGpzOWdmbXZrbm4ya2Z1ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZehjAZ8I/giphy.gif',
  },
  {
    id: 'laughing',
    title: 'Lol Laugh',
    category: 'Funny',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0bXFmdWxmdWR2czBhdmZpZ29vczg0dnZndzhzbmdsaXJnaGViaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0ExayQDzrI2xOb8A/giphy.gif',
  },
  {
    id: 'high_five',
    title: 'High Five',
    category: 'Party',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVnbWVybzJldHJwd2VvZnh4Nnd4OHdheDNlNzN0cnZicmxna2Z1YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEJHV0z8S7WM4MwnK/giphy.gif',
  },
  {
    id: 'thinking',
    title: 'Hard Choice',
    category: 'Thinking',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmlreXlhNHFya3lyc2hvcjY1ZzRneTZndDgxOXJxdGdrMHhhd3B2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif',
  },
  {
    id: 'thumbs_up',
    title: 'Approval',
    category: 'Agreed',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHM1ZWtwMThzNmY5OTRwczEyc3c1ZmZ6MGhkeXJmN3dtYW1tcnBhOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/111ebonMs90YLu/giphy.gif',
  },
  {
    id: 'fire',
    title: 'Lit Fire',
    category: 'Excited',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmllbmdodmt6czdzMnA2aTRyNmRoc3BwdG13bjVpZXN6NzFqdThxNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o72F8t9TDi2xVnxOE/giphy.gif',
  },
];

export const GifPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gifUrl: string) => void;
}> = ({ isOpen, onClose, onSelectGif }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Excited', 'Party', 'Funny', 'Drinks', 'Thinking'];

  const filteredGifs = POPULAR_GIFS.filter((gif) => {
    const matchesSearch =
      gif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gif.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || gif.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onSelectGif(customUrl.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border-4 border-pink-200 dark:border-pink-900 rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b-2 border-slate-100 dark:border-slate-800 bg-pink-50/50 dark:bg-slate-900">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🖼️</span>
              <h3 className="text-lg font-black uppercase text-slate-800 dark:text-white">
                Pick a Reaction GIF
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto flex-1 no-scrollbar">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search GIFs or stickers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:outline-none focus:border-pink-400 text-slate-800 dark:text-white"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-pink-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* GIF Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {filteredGifs.map((gif) => (
                <motion.div
                  key={gif.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onSelectGif(gif.url);
                    onClose();
                  }}
                  className="group relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs hover:border-pink-400 transition-all bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] font-black uppercase text-white truncate">
                      {gif.title}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Custom GIF Link Input */}
            <form onSubmit={handleCustomSubmit} className="pt-4 border-t-2 border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                <span>Or Paste Custom GIF Image URL</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://.../my-reaction.gif"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-pink-400 text-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 border-b-4 border-pink-700 text-white rounded-2xl text-xs font-black uppercase disabled:opacity-50 transition-all cursor-pointer"
                >
                  Attach
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
