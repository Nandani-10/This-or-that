import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface Question {
  id: string;
  optionA: string;
  emojiA: string;
  optionB: string;
  emojiB: string;
  askedBy?: string;
  askedByName?: string;
  createdAt: number;
}

interface Answer {
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

interface Reaction {
  id: string;
  questionId?: string;
  userId: string;
  userName: string;
  emoji: string;
  note?: string;
  gifUrl?: string;
  timestamp: number;
}

interface AnswererUser {
  id: string;
  name: string;
  joinedAt: number;
  lastActive: number;
}

interface RoomState {
  roomCode: string;
  askerId: string;
  status: 'active' | 'ended';
  currentQuestion: Question | null;
  questions: Question[];
  queuedQuestions: Question[];
  answers: Answer[];
  reactions: Reaction[];
  isAskerTyping: boolean;
  isGuessMode?: boolean;
  answerers: AnswererUser[];
  createdAt: number;
}

// In-memory room store & SSE subscribers
const ROOMS: Record<string, RoomState> = {};
const SSE_CLIENTS: Record<string, Response[]> = {};

function broadcastRoomUpdate(roomCode: string) {
  const room = ROOMS[roomCode];
  if (!room) return;

  const clients = SSE_CLIENTS[roomCode] || [];
  const payload = `data: ${JSON.stringify(room)}\n\n`;

  SSE_CLIENTS[roomCode] = clients.filter((res) => {
    try {
      res.write(payload);
      return true;
    } catch {
      return false;
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Create room
  app.post('/api/rooms', (req: Request, res: Response) => {
    let { roomCode, askerId, isGuessMode } = req.body;
    if (!roomCode || typeof roomCode !== 'string') {
      roomCode = Math.floor(1000 + Math.random() * 9000).toString();
    } else {
      roomCode = roomCode.trim().toUpperCase();
    }

    if (!askerId) {
      askerId = 'asker_' + Math.random().toString(36).substring(2, 9);
    }

    if (!ROOMS[roomCode]) {
      ROOMS[roomCode] = {
        roomCode,
        askerId,
        status: 'active',
        currentQuestion: null,
        questions: [],
        queuedQuestions: [],
        answers: [],
        reactions: [],
        isAskerTyping: false,
        isGuessMode: !!isGuessMode,
        answerers: [],
        createdAt: Date.now()
      };
    } else {
      ROOMS[roomCode].askerId = askerId;
      ROOMS[roomCode].status = 'active';
      if (isGuessMode !== undefined) {
        ROOMS[roomCode].isGuessMode = !!isGuessMode;
      }
      if (!ROOMS[roomCode].queuedQuestions) {
        ROOMS[roomCode].queuedQuestions = [];
      }
    }

    res.json({ success: true, room: ROOMS[roomCode] });
  });

  // Toggle Guess Mode
  app.post('/api/rooms/:code/guess-mode', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { isGuessMode } = req.body;
    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    room.isGuessMode = !!isGuessMode;
    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Get room state
  app.get('/api/rooms/:code', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json({ room });
  });

  // Join room
  app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { userId, userName, role } = req.body;

    let room = ROOMS[code];
    if (!room) {
      // Auto-create room if joining as asker or answerer
      room = ROOMS[code] = {
        roomCode: code,
        askerId: role === 'asker' ? userId : 'asker_default',
        status: 'active',
        currentQuestion: null,
        questions: [],
        queuedQuestions: [],
        answers: [],
        reactions: [],
        isAskerTyping: false,
        answerers: [],
        createdAt: Date.now()
      };
    }

    if (!room.queuedQuestions) {
      room.queuedQuestions = [];
    }

    if (role === 'answerer' && userId) {
      const existingIdx = room.answerers.findIndex((a) => a.id === userId);
      if (existingIdx >= 0) {
        room.answerers[existingIdx].lastActive = Date.now();
        room.answerers[existingIdx].name = userName || room.answerers[existingIdx].name;
      } else {
        room.answerers.push({
          id: userId,
          name: userName || 'Answerer ' + (room.answerers.length + 1),
          joinedAt: Date.now(),
          lastActive: Date.now()
        });
      }
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Post Question (Can be asked by ANY member, queued if active question exists)
  app.post('/api/rooms/:code/questions', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { optionA, emojiA, optionB, emojiB, askedBy, askedByName, setAsCurrent } = req.body;

    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.queuedQuestions) {
      room.queuedQuestions = [];
    }

    const question: Question = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      optionA,
      emojiA: emojiA || '🥞',
      optionB,
      emojiB: emojiB || '🧇',
      askedBy,
      askedByName: askedByName || 'Participant',
      createdAt: Date.now()
    };

    if (!room.currentQuestion || setAsCurrent) {
      if (room.currentQuestion && setAsCurrent) {
        room.queuedQuestions.unshift(room.currentQuestion);
      }
      room.currentQuestion = question;
    } else {
      room.queuedQuestions.push(question);
    }
    room.questions.push(question);
    room.isAskerTyping = false;

    broadcastRoomUpdate(code);
    res.json({ success: true, question, room });
  });

  // Advance to next queued question
  app.post('/api/rooms/:code/questions/next', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.queuedQuestions) room.queuedQuestions = [];

    if (room.queuedQuestions.length > 0) {
      room.currentQuestion = room.queuedQuestions.shift()!;
    } else {
      room.currentQuestion = null;
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Select a specific question from queue or history to make current
  app.post('/api/rooms/:code/questions/select', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { questionId } = req.body;
    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.queuedQuestions) room.queuedQuestions = [];

    const found = room.questions.find((q) => q.id === questionId);
    if (found) {
      if (room.currentQuestion && room.currentQuestion.id !== questionId) {
        // Push former active question to front of queue if not already answered
        room.queuedQuestions.unshift(room.currentQuestion);
      }
      room.currentQuestion = found;
      room.queuedQuestions = room.queuedQuestions.filter((q) => q.id !== questionId);
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Remove question from queue
  app.post('/api/rooms/:code/questions/remove', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { questionId } = req.body;
    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.queuedQuestions) room.queuedQuestions = [];

    room.queuedQuestions = room.queuedQuestions.filter((q) => q.id !== questionId);
    if (room.currentQuestion?.id === questionId) {
      room.currentQuestion = room.queuedQuestions.length > 0 ? room.queuedQuestions.shift()! : null;
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Submit Answer
  app.post('/api/rooms/:code/answer', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { questionId, userId, userName, choice, guessChoice, note, gifUrl } = req.body;

    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Guard against duplicate answer for same user + question
    const existingIdx = room.answers.findIndex(
      (a) => a.questionId === questionId && a.userId === userId
    );

    const answer: Answer = {
      id: 'ans_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      questionId,
      userId,
      userName: userName || 'Answerer',
      choice,
      guessChoice,
      note,
      gifUrl,
      timestamp: Date.now()
    };

    if (existingIdx >= 0) {
      room.answers[existingIdx] = answer;
    } else {
      room.answers.push(answer);
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, answer, room });
  });

  // Send Reaction
  app.post('/api/rooms/:code/reaction', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { userId, userName, emoji, questionId, note, gifUrl } = req.body;

    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const reaction: Reaction = {
      id: 'react_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      questionId,
      userId,
      userName: userName || 'Answerer',
      emoji: emoji || '😍',
      note,
      gifUrl,
      timestamp: Date.now()
    };

    room.reactions.push(reaction);
    // Keep max 20 reactions
    if (room.reactions.length > 20) {
      room.reactions = room.reactions.slice(-20);
    }

    broadcastRoomUpdate(code);
    res.json({ success: true, reaction, room });
  });

  // Typing Status
  app.post('/api/rooms/:code/typing', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const { isTyping } = req.body;

    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    room.isAskerTyping = !!isTyping;
    broadcastRoomUpdate(code);
    res.json({ success: true, isAskerTyping: room.isAskerTyping });
  });

  // End Session
  app.post('/api/rooms/:code/end', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();

    const room = ROOMS[code];
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    room.status = 'ended';
    broadcastRoomUpdate(code);
    res.json({ success: true, room });
  });

  // Server-Sent Events (SSE) endpoint for real-time room updates
  app.get('/api/rooms/:code/events', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    if (!SSE_CLIENTS[code]) {
      SSE_CLIENTS[code] = [];
    }
    SSE_CLIENTS[code].push(res);

    // Send current room state immediately if exists
    if (ROOMS[code]) {
      res.write(`data: ${JSON.stringify(ROOMS[code])}\n\n`);
    }

    req.on('close', () => {
      SSE_CLIENTS[code] = (SSE_CLIENTS[code] || []).filter((client) => client !== res);
    });
  });

  // Vite development server middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
