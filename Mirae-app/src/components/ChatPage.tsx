import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  linkedEntryId?: string;
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
  initialEntryId?: string;
}

const CRISIS_HOTLINES = [
  { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7 free and confidential support" },
  { name: "Crisis Text Line", number: "Text HOME to 741741", description: "Free 24/7 crisis counseling" },
  { name: "SAMHSA Helpline", number: "1-800-662-4357", description: "Treatment referral and information" }
];

export default function ChatPage({ userId, initialEntryId }: ChatPageProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHotline, setShowHotline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Load chat sessions
  useEffect(() => {
    loadChatSessions();
    
    // Initialize voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
        handleSendMessage(transcript);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (initialEntryId) {
      startNewChat(initialEntryId);
    }
  }, [initialEntryId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  const loadChatSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startNewChat = async (linkedEntryId?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ linkedEntryId })
      });
      
      if (response.ok) {
        const newSession = await response.json();
        setSessions([newSession, ...sessions]);
        setActiveSession(newSession);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !activeSession) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setActiveSession({
      ...activeSession,
      messages: [...activeSession.messages, userMessage]
    });
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: activeSession.id,
          message: message
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: data.id,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date()
        };
        
        setActiveSession({
          ...activeSession,
          messages: [...activeSession.messages, userMessage, assistantMessage]
        });
        
        // Check if message indicates crisis
        if (data.isCrisis) {
          setShowHotline(true);
          // Auto-hide after 10 seconds
          setTimeout(() => setShowHotline(false), 10000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-[80vh] bg-gray-100 rounded-xl overflow-hidden relative">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={() => startNewChat()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold"
          >
            + New Conversation
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => setActiveSession(session)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                activeSession?.id === session.id ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-sm truncate">{session.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.lastMessageAt).toLocaleDateString()}
                  </p>
                </div>
                {session.linkedEntryId && (
                  <span className="text-xs text-purple-600">📖</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeSession ? (
          <>
            <div className="p-4 bg-white border-b">
              <h3 className="font-semibold">{activeSession.title}</h3>
              {activeSession.linkedEntryId && (
                <p className="text-xs text-purple-600">Linked to journal entry</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeSession.messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white text-gray-800 shadow'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg shadow">
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

            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                {isVoiceMode ? (
                  <button
                    onClick={startVoiceInput}
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      isRecording
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {isRecording ? '🔴 Recording...' : '🎤 Click to Speak'}
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                      placeholder="Type your message..."
                      className="flex-1 border rounded-lg p-2 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      onClick={() => handleSendMessage(inputMessage)}
                      className="bg-purple-600 text-white px-4 rounded-lg"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setIsVoiceMode(!isVoiceMode)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      🎤
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
              <p className="text-gray-500 mb-4">
                Choose an existing chat or start a new one
              </p>
              <button
                onClick={() => startNewChat()}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg"
              >
                New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Crisis Hotline Modal */}
      {showHotline && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-500 text-white rounded-lg shadow-xl p-4 max-w-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold">⚠️ Need Support?</h4>
              <button onClick={() => setShowHotline(false)} className="text-white">✕</button>
            </div>
            <p className="text-sm mb-3">You're not alone. Help is available 24/7:</p>
            <div className="space-y-2">
              {CRISIS_HOTLINES.map(hotline => (
                <div key={hotline.number} className="bg-white/20 rounded p-2">
                  <p className="font-semibold text-sm">{hotline.name}</p>
                  <p className="text-sm">{hotline.number}</p>
                  <p className="text-xs opacity-90">{hotline.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
