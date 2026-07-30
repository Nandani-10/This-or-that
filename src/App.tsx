import React, { useState, useEffect, useCallback } from 'react';
import { RoleSelect } from './components/RoleSelect';
import { AskerDashboard } from './components/AskerDashboard';
import { AnswererScreen } from './components/AnswererScreen';
import { SummaryScreen } from './components/SummaryScreen';
import { Navbar } from './components/Navbar';
import { EmojiBlastOverlay } from './components/EmojiBlastOverlay';
import { Role, RoomState } from './types';

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [roomCode, setRoomCode] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userId] = useState<string>(() => {
    const saved = localStorage.getItem('this_or_that_uid');
    if (saved) return saved;
    const newUid = 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('this_or_that_uid', newUid);
    return newUid;
  });

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Dark Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('this_or_that_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('this_or_that_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('this_or_that_theme', 'light');
    }
  }, [darkMode]);

  // Check URL query parameters for room auto-fill e.g. ?room=8492
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setRoomCode(code.toUpperCase());
    }
  }, []);

  // Sync state fetch helper
  const fetchRoomState = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (res.ok) {
        const data = await res.json();
        setRoomState(data.room);
      }
    } catch (e) {
      console.warn('Failed to fetch room state:', e);
    }
  }, []);

  // Setup Server-Sent Events (SSE) listener & Polling Fallback
  useEffect(() => {
    if (!roomCode) return;

    fetchRoomState(roomCode);

    // SSE connection
    const eventSource = new EventSource(`/api/rooms/${roomCode}/events`);

    eventSource.onmessage = (event) => {
      try {
        const updatedRoom = JSON.parse(event.data);
        setRoomState(updatedRoom);
      } catch (e) {
        console.error('Failed to parse SSE event data:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    // Polling backup every 2s
    const pollInterval = setInterval(() => {
      fetchRoomState(roomCode);
    }, 2000);

    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [roomCode, fetchRoomState]);

  // Handle Start Asker
  const handleStartAsker = async (customCode?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: customCode, askerId: userId })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomCode(data.room.roomCode);
        setRoomState(data.room);
        setRole('asker');

        // Update URL query string
        const newUrl = `${window.location.pathname}?room=${data.room.roomCode}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (e) {
      console.error('Error starting asker:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Join Answerer
  const handleJoinAnswerer = async (code: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName: name, role: 'answerer' })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setRoomCode(data.room.roomCode);
        setUserName(name);
        setRoomState(data.room);
        setRole('answerer');

        // Update URL query string
        const newUrl = `${window.location.pathname}?room=${data.room.roomCode}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    } catch (e) {
      console.error('Error joining answerer:', e);
    } finally {
      setLoading(false);
    }
  };

  // Actions for Questions (Can be called by ANY room participant)
  const handleSendQuestion = async (
    optionA: string,
    emojiA: string,
    optionB: string,
    emojiB: string,
    setAsCurrent?: boolean
  ) => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionA,
          emojiA,
          optionB,
          emojiB,
          askedBy: userId,
          askedByName: userName || (role === 'asker' ? 'Host' : 'Participant'),
          setAsCurrent
        })
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error sending question:', e);
    }
  };

  const handleNextQuestion = async () => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/questions/next`, {
        method: 'POST'
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error advancing question:', e);
    }
  };

  const handleSelectQuestion = async (questionId: string) => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/questions/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error selecting question:', e);
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/questions/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error removing question:', e);
    }
  };

  const handleSendTyping = async (isTyping: boolean) => {
    if (!roomCode || role !== 'asker') return;
    try {
      await fetch(`/api/rooms/${roomCode}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping })
      });
    } catch (e) {
      console.error('Error sending typing status:', e);
    }
  };

  const handleEndSession = async () => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error ending session:', e);
    }
  };

  const handleToggleGuessMode = async (isGuessMode: boolean) => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/guess-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isGuessMode })
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error toggling guess mode:', e);
    }
  };

  // Actions for Answerer
  const handleSubmitAnswer = async (
    questionId: string,
    choice: 'A' | 'B',
    guessChoice?: 'A' | 'B',
    note?: string,
    gifUrl?: string
  ) => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, userId, userName, choice, guessChoice, note, gifUrl })
      });
      fetchRoomState(roomCode);
    } catch (e) {
      console.error('Error submitting answer:', e);
    }
  };

  const handleSendReaction = async (
    emoji: string,
    note?: string,
    gifUrl?: string
  ) => {
    if (!roomCode) return;
    try {
      await fetch(`/api/rooms/${roomCode}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName: userName || 'Answerer',
          emoji,
          questionId: roomState?.currentQuestion?.id,
          note,
          gifUrl
        })
      });
    } catch (e) {
      console.error('Error sending reaction:', e);
    }
  };

  const handleLeaveRoom = () => {
    setRole(null);
    setRoomCode('');
    setRoomState(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleRestartSession = () => {
    if (role === 'asker') {
      handleStartAsker(roomCode);
    } else {
      handleJoinAnswerer(roomCode, userName);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FDF2F8] dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors selection:bg-pink-200 dark:selection:bg-pink-900 flex flex-col font-sans overflow-x-hidden">
      {/* Real-Time Screen-Wide Emoji Reaction Explosion Overlay */}
      <EmojiBlastOverlay
        reactions={roomState?.reactions || []}
        currentUserId={userId}
      />

      {/* Decorative Background Blur Circles */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-200 dark:bg-purple-950/40 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-pink-200 dark:bg-pink-950/40 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

      <Navbar
        roomCode={roomCode}
        role={role}
        roomState={roomState}
        currentUserId={userId}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLeaveRoom={role ? handleLeaveRoom : undefined}
        onSwitchRole={role ? () => setRole(role === 'asker' ? 'answerer' : 'asker') : undefined}
        answererCount={roomState?.answerers?.length || 0}
      />

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        {!role || !roomState ? (
          <RoleSelect
            onStartAsker={handleStartAsker}
            onJoinAnswerer={handleJoinAnswerer}
            initialCode={roomCode}
            loading={loading}
          />
        ) : roomState.status === 'ended' ? (
          <SummaryScreen
            roomState={roomState}
            role={role}
            onRestartSession={handleRestartSession}
          />
        ) : role === 'asker' ? (
          <AskerDashboard
            roomState={roomState}
            onSendQuestion={handleSendQuestion}
            onNextQuestion={handleNextQuestion}
            onSelectQuestion={handleSelectQuestion}
            onRemoveQuestion={handleRemoveQuestion}
            onSendTyping={handleSendTyping}
            onEndSession={handleEndSession}
            onToggleGuessMode={handleToggleGuessMode}
          />
        ) : (
          <AnswererScreen
            roomState={roomState}
            userId={userId}
            userName={userName}
            onSubmitAnswer={handleSubmitAnswer}
            onSendReaction={handleSendReaction}
            onSendQuestion={handleSendQuestion}
            onNextQuestion={handleNextQuestion}
            onSelectQuestion={handleSelectQuestion}
          />
        )}
      </main>
    </div>
  );
}
