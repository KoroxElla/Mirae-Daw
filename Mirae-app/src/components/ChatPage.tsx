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

export default function ChatPage({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const loadChatSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/chat/sessions', {
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
      const response = await fetch('/chat/sessions', {
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
      const response = await fetch('/chat/message', {
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
          showCrisisHotline();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showCrisisHotline = () => {
    alert("We're here for you. Please reach out:\n\n988 - Suicide & Crisis Lifeline\nCrisis Text Line: Text HOME to 741741");
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

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages]);

  return (
    <div className="flex h-[80vh] bg-gray-100 rounded-xl overflow-hidden">
      {/* Sidebar - Chat Sessions */}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to journal entry
                    }}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    📖 View Entry
                  </button>
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
            {/* Chat Header */}
            <div className="p-4 bg-white border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{activeSession.title}</h3>
                {activeSession.linkedEntryId && (
                  <button
                    onClick={() => {
                      // Navigate to journal entry
                    }}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    ← Back to Journal Entry
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-2 rounded-full transition ${
                    isVoiceMode ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  🎤
                </button>
              </div>
            </div>

            {/* Messages */}
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

            {/* Input Area */}
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
    </div>
  );
}
