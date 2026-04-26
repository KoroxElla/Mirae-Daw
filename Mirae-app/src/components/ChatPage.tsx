import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSettings } from '../contexts/SettingsContext';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

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
  
  // Auto scroll
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
    
    // Close sidebar on mobile when a session is selected
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
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

  // Send message
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

      // Text-to-Speech
      if (settings?.textToSpeech && data.reply) {
        const utterance = new SpeechSynthesisUtterance(data.reply);
        speechSynthesis.speak(utterance);
      }

      // Desktop Notification
      if (settings?.notifications && Notification.permission === "granted") {
        new Notification("Mirae", {
          body: data.reply
        });
      }


      // Update the chat history locally
      await loadSession(activeSession.id);

      // Trigger Crisis UI
      if (data.isCrisis) {
        setShowHotline(true); 
      }

      // Trigger Restricted Topic Alert
      if (data.isOutOfScope) {
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
      recognitionRef.current.stop();
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

      setSessions(prev => prev.filter(s => s.id !== id));

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
    <div className="h-[85vh] sm:h-[80vh] rounded-xl overflow-hidden relative bg-cover bg-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative flex h-full text-white">
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-3 left-3 z-20 md:hidden bg-white/20 rounded-lg p-2 backdrop-blur-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Sidebar - Responsive */}
        <div className={`
          fixed md:relative z-10 w-64 sm:w-72 bg-white/10 backdrop-blur-md border-r border-white/20 
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-full overflow-y-auto
        `}>
          <div className="p-3 sm:p-4">
            <button
              onClick={startChat}
              className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg mb-4 text-sm sm:text-base transition-colors"
            >
              + New Chat
            </button>

            <div className="space-y-1">
              {sessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  className="group flex items-center justify-between p-2 cursor-pointer hover:bg-white/20 rounded transition-colors"
                >
                  <span className="text-sm truncate flex-1">{s.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteWithConfirm(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-1 transition-opacity"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-white/20 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {activeSession?.linkedEntryId ? (
                <button
                  onClick={() => navigate(`/journal?entryId=${activeSession.linkedEntryId}`)}
                  className="text-xs sm:text-sm text-purple-300 underline"
                >
                  📖 Back to Journal
                </button>
              ) : <div className="w-20" />}
            </div>

            <h3 className="text-sm sm:text-base font-medium truncate max-w-[150px] sm:max-w-xs">
              {activeSession?.title || "Select a chat"}
            </h3>

            {activeSession && (
              <button
                onClick={() => handleDeleteWithConfirm(activeSession.id)}
                className="text-red-400 hover:text-red-600 text-xs sm:text-sm"
              >
                🗑 Delete
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
            {activeSession?.messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-white/60">
                <div className="space-y-2">
                  <div className="text-4xl">💬</div>
                  <p className="text-sm">Start the conversation!</p>
                  <p className="text-xs">Share how you're feeling today</p>
                </div>
              </div>
            )}
            
            {activeSession?.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[70%] text-sm sm:text-base ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/80 text-black'
                }`}>
                  {msg.content}
                  <div className={`text-[10px] sm:text-xs mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 text-black p-2 sm:p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce delay-100">●</span>
                    <span className="animate-bounce delay-200">●</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Responsive */}
          <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
            <div className="flex gap-2">
              {isVoiceMode ? (
                <button
                  onClick={startVoice}
                  className={`flex-1 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors ${
                    isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isRecording ? '🔴 Recording...' : '🎤 Click to Speak'}
                </button>
              ) : (
                <>
                  <input
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputMessage)}
                    className="flex-1 p-2 sm:p-3 rounded-lg text-black text-sm sm:text-base bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Type a message..."
                  />

                  <button
                    onClick={() => handleSendMessage(inputMessage)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Send
                  </button>
                </>
              )}

              <button
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className="bg-white/20 hover:bg-white/30 px-3 sm:px-4 rounded-lg transition-colors text-sm sm:text-base"
              >
                🎤
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 Crisis Popup - Responsive */}
      {showHotline && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white text-black p-5 sm:p-6 rounded-2xl max-w-md w-full shadow-2xl border-t-4 border-red-500 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">You're not alone.</h2>
            <p className="mb-4 text-gray-600 text-sm sm:text-base">
              I'm Mirae, an AI, and I'm not a licensed professional. Please reach out to someone who can help right now:
            </p>
            
            <div className="space-y-3">
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-bold text-sm sm:text-base">Samaritans (UK)</p>
                <p className="text-xs sm:text-sm text-gray-600">Call 116 123 - 24/7 confidential support for anyone in emotional distress.</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-bold text-sm sm:text-base">National Suicide Prevention (US)</p>
                <p className="text-xs sm:text-sm text-gray-600">Call or text 988 - Free and confidential support for people in distress.</p>
              </div>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-bold text-sm sm:text-base">Shout</p>
                <p className="text-xs sm:text-sm text-gray-600">Text 'SHOUT' to 85258 - 24/7 text support for mental health concerns.</p>
              </div>
            </div>

            <button 
              onClick={() => setShowHotline(false)}
              className="mt-6 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Close & Continue Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}