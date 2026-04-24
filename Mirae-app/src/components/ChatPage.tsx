import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  linkedEntryId?: string;
  messages: Message[];
}

interface ChatPageProps {
  userId: string;
}

export default function ChatPage({ userId }: ChatPageProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHotline, setShowHotline] = useState(false);
  
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🎤 Voice setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        handleSendMessage(transcript);
        console.log("VOICE RESULT:", event);
      };

      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-GB";
    }
  }, []);

  // 📥 Load sessions
  useEffect(() => {
    loadSessions();
  }, []);

  // Check for journal entry chat start
  useEffect(() => {
    const entryId = localStorage.getItem("chatEntryId");
    if (entryId) {
      startChatWithEntry(entryId);
      localStorage.removeItem("chatEntryId");
    }
  }, []);
//  Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  

  const loadSessions = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    setSessions(data);
  };

  // 📥 Load full session
  const loadSession = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    setActiveSession({
      ...data,
      messages: (data.messages || []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    });
  };

  // ➕ New chat
  const startChat = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setSessions([data, ...sessions]);
    loadSession(data.id);
  };

  // Starting a chat from a journal entry
  const startChatWithEntry = async (entryId: string) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ linkedEntryId: entryId })
    });

    const data = await res.json();
    loadSession(data.id);
  };

  // 📤 Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeSession) return;

    setInputMessage('');
    setIsLoading(true);

    const token = localStorage.getItem('token');

    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId: activeSession.id,
        message: text
      })
    });

    if (!res.ok) {
      console.error("Request failed");
      setIsLoading(false);
      return;
    }

    const data = await res.json();

    if (!data) {
      console.error("Empty response");
      setIsLoading(false);
      return;
    }

    await loadSession(activeSession.id);

    if (data.isCrisis) {
      setShowHotline(true);
      setTimeout(() => setShowHotline(false), 10000);
    }

    if (data.isOutOfScope) {
      alert("⚠️ This topic is restricted. Please change the conversation.");
    }

    setIsLoading(false);
  };

  // 🎤 Voice start
  const startVoice = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop(); // reset if already running
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Voice error:", err);
    }
  };

  const deleteChat = async (id: string) => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/chat/sessions/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }

      // ✅ Remove from UI
      setSessions(prev => prev.filter(s => s.id !== id));

      // ✅ If the deleted chat was open, reset view
      if (activeSession?.id === id) {
        setActiveSession(null);
      }

    } catch (err) {
      console.error("Delete failed:", err);
    }
  };
  

  return (
    <div
      className="h-[80vh] rounded-xl overflow-hidden relative bg-cover bg-center"
      style={{ backgroundImage: "url('/Chattime.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative flex h-full text-white">

        {/* Sidebar */}
        <div className="w-72 bg-white/10 backdrop-blur-md border-r border-white/20 p-4">
          <button
            onClick={startChat}
            className="w-full bg-purple-600 py-2 rounded-lg mb-4"
          >
            + New Chat
          </button>

          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              className="p-2 cursor-pointer hover:bg-white/20 rounded"
            >
              {s.title}
              <button  onClick={(e) => { e.stopPropagation(); deleteChat(s.id); }} className="ml-2 text-red-500 hover:text-red-700">
                🗑
              </button>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
        {activeSession?.linkedEntryId && (
          <button
            onClick={() => navigate(`/journal?entryId=${activeSession.linkedEntryId}`)}
            className="text-sm text-purple-300 underline"
          >
            📖 Go to Journal Entry
          </button>
        )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSession?.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-3 rounded-lg max-w-[70%] ${
                  msg.role === 'user'
                    ? 'bg-purple-600'
                    : 'bg-white/80 text-black'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && <p>Typing...</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white/10 backdrop-blur-md flex gap-2">

            {isVoiceMode ? (
              <button
                onClick={startVoice}
                className={`flex-1 py-2 rounded ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600'
                }`}
              >
                {isRecording ? 'Recording...' : '🎤 Speak'}
              </button>
            ) : (
              <>
                <input
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMessage)}
                  className="flex-1 p-2 rounded text-black"
                  placeholder="Type a message..."
                />

                <button
                  onClick={() => handleSendMessage(inputMessage)}
                  className="bg-purple-600 px-4 rounded"
                >
                  Send
                </button>
              </>
            )}

            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className="bg-white/20 px-3 rounded"
            >
              🎤
            </button>

          </div>
        </div>
      </div>

      {/* 🚨 Crisis Popup */}
      {showHotline && (
        <div className="absolute bottom-4 right-4 bg-red-600 p-4 rounded-lg shadow-lg">
          <p className="font-bold">You’re not alone ❤️</p>
          <p className="text-sm">Call Samaritans (UK): 116 123</p>
        </div>
      )}
    </div>
  );
}