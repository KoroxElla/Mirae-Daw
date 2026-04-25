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
  const location = useLocation();
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

  // Check for journal entry chat start via URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const entryId = params.get("entryId");

    if (entryId) {
      startChatWithEntry(entryId);
    }
  }, [location.search]);

  

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

  //  Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeSession) return;

    setInputMessage('');
    setIsLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId: activeSession.id, message: text })
      });

      const data = await res.json();

      // ✅ Update the chat history locally
      await loadSession(activeSession.id);

      // ✅ Trigger Crisis UI
      if (data.isCrisis) {
        setShowHotline(true); 
        // Don't auto-hide it if it's serious, or use a longer timer
      }

      // ✅ Trigger Restricted Topic Alert
      if (data.isOutOfScope) {
        // You can use a toast notification here instead of a generic alert
        console.log("Topic restricted");
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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

  const handleDeleteWithConfirm = (id: string) => {
    const confirmDelete = window.confirm(
      "⚠️ This chat will be permanently deleted and cannot be restored. Continue?"
    );

    if (confirmDelete) {
      deleteChat(id);
    }
  };
  

  return (
    <div
      className="h-[80vh] rounded-xl overflow-hidden relative bg-cover bg-center"
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
              
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b border-white/20">
            {activeSession?.linkedEntryId ? (
              <button
                onClick={() => navigate(`/journal?entryId=${activeSession.linkedEntryId}`)}
                className="text-sm text-purple-300 underline"
              >
                📖 Back to Journal
              </button>
            ) : <div />}

            <button
              onClick={() => activeSession && handleDeleteWithConfirm(activeSession.id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              🗑 Delete Chat
            </button>
          </div>

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
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white text-black p-6 rounded-2xl max-w-md shadow-2xl border-t-4 border-red-500">
            <h2 className="text-2xl font-bold mb-2">You're not alone.</h2>
            <p className="mb-4 text-gray-600">I'm Mirae, an AI, and I'm not a licensed professional. Please reach out to someone who can help right now:</p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <p className="font-bold">Samaritans (UK)</p>
                <p className="text-sm">Call 116 123 - 24/7 confidential support for anyone in emotional distress.</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <p className="font-bold">National Suicide Prevention (US)</p>
                <p className="text-sm">Call or text 988 - Free and confidential support for people in distress.</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <p className="font-bold">Shout</p>
                <p className="text-sm">Text 'SHOUT' to 85258 - 24/7 text support for mental health concerns.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowHotline(false)}
              className="mt-6 w-full py-2 bg-gray-200 rounded-lg font-semibold"
            >
              Close & Continue Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}