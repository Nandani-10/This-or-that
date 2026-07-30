export interface Question {
  id: string;
  optionA: string;
  emojiA: string;
  optionB: string;
  emojiB: string;
  askedBy?: string;
  askedByName?: string;
  createdAt: number;
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  choice: 'A' | 'B';
  guessChoice?: 'A' | 'B';
  note?: string;
  gifUrl?: string;
  timestamp: number;
}

export interface Reaction {
  id: string;
  questionId?: string;
  userId: string;
  userName: string;
  emoji: string;
  note?: string;
  gifUrl?: string;
  timestamp: number;
}

export interface AnswererUser {
  id: string;
  name: string;
  joinedAt: number;
  lastActive: number;
}

export interface RoomState {
  roomCode: string;
  askerId: string;
  status: 'active' | 'ended';
  currentQuestion: Question | null;
  questions: Question[];
  queuedQuestions?: Question[];
  answers: Answer[];
  reactions: Reaction[];
  isAskerTyping: boolean;
  isGuessMode?: boolean;
  answerers: AnswererUser[];
  createdAt: number;
}

export type Role = 'asker' | 'answerer' | null;

export interface PresetQuestion {
  optionA: string;
  emojiA: string;
  optionB: string;
  emojiB: string;
  category: string;
}

export const PRESET_QUESTIONS: PresetQuestion[] = [
  { optionA: "Pancakes", emojiA: "🥞", optionB: "Waffles", emojiB: "🧇", category: "Food" },
  { optionA: "Dogs", emojiA: "🐶", optionB: "Cats", emojiB: "🐱", category: "Animals" },
  { optionA: "Beach Vacation", emojiA: "🏖️", optionB: "Mountain Cabin", emojiB: "🏔️", category: "Travel" },
  { optionA: "Iced Coffee", emojiA: "☕", optionB: "Matcha Latte", emojiB: "🍵", category: "Drinks" },
  { optionA: "Time Travel to Past", emojiA: "⏳", optionB: "Time Travel to Future", emojiB: "🚀", category: "Sci-Fi" },
  { optionA: "Early Bird", emojiA: "🌅", optionB: "Night Owl", emojiB: "🦉", category: "Lifestyle" },
  { optionA: "Movie at Theater", emojiA: "🍿", optionB: "Show at Home", emojiB: "🛋️", category: "Fun" },
  { optionA: "Sweet Snacks", emojiA: "🍩", optionB: "Salty Snacks", emojiB: "🍿", category: "Food" },
  { optionA: "Summer Warmth", emojiA: "☀️", optionB: "Winter Snow", emojiB: "❄️", category: "Seasons" },
  { optionA: "Flight Power", emojiA: "🦅", optionB: "Invisibility Power", emojiB: "👻", category: "Superpowers" },
  { optionA: "Reading Books", emojiA: "📚", optionB: "Listening to Podcasts", emojiB: "🎧", category: "Hobbies" },
  { optionA: "Pizza", emojiA: "🍕", optionB: "Tacos", emojiB: "🌮", category: "Food" }
];
