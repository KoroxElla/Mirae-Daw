import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

interface EmotionData {
  date: string;
  joy: number;
  sadness: number;
  anger: number;
  anxiety: number;
  neutral: number;
}

interface AgentDashboardProps {
  agentId: string;
  onLogout: () => void;
}

interface AgentNote {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  userId?: string;
}

const EMOTION_COLORS = {
  joy: '#FFD93D',
  sadness: '#4D96FF',
  anger: '#FF6B6B',
  anxiety: '#9D4EDD',
  neutral: '#A0A0A0'
};

export default function AgentDashboard({ agentId, onLogout }: AgentDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');
  const [accessTokens, setAccessTokens] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<AgentNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem(`agent_${agentId}_users`);
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      setFilteredUsers(parsedUsers);
    }
    
    const savedTokens = localStorage.getItem(`agent_${agentId}_tokens`);
    if (savedTokens) {
      const parsedTokens = JSON.parse(savedTokens);
      setAccessTokens(new Map(parsedTokens));
    }
    
    const savedNotes = localStorage.getItem(`agent_${agentId}_notes`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [agentId]);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(`agent_${agentId}_notes`, JSON.stringify(notes));
    }
  }, [notes, agentId]);

  // Fetch data when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchUserData();
    }
  }, [selectedUser, timeRange]);

  // Handle pending user from token modal
  useEffect(() => {
    if (showTokenModal) {
      const pendingUser = localStorage.getItem(`pending_user_${agentId}`);
      if (pendingUser) {
        const user = JSON.parse(pendingUser);
        setSelectedUser(user);
        localStorage.removeItem(`pending_user_${agentId}`);
      }
    }
  }, [showTokenModal, agentId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/agent/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setFilteredUsers(data);
      } else {
        setFilteredUsers(users.filter(user => 
          user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase())
        ));
      }
    } catch (err) {
      console.error("Search failed:", err);
      setFilteredUsers(users.filter(user => 
        user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase())
      ));
    }
  };

  const verifyToken = async () => {
      if (!tokenInput.trim()) {
          setTokenError("Please enter a token");
          return;
      }

      setIsVerifying(true);
      setTokenError('');

      try {
          console.log("Verifying token:", tokenInput); // Debug log
          
          const response = await fetch(
              `${import.meta.env.VITE_API_URL}/agent/verify-token`,
              {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      token: tokenInput.trim()
                  })
              }
          );

          const data = await response.json();
          console.log("Verification response:", data); // Debug log

          if (response.ok) {
              const newUser: User = {
                  id: data.userId,
                  email: data.email,
                  displayName: data.displayName || data.email,
                  createdAt: data.createdAt || new Date().toISOString()
              };

              // Check if user already exists
              if (!users.some(u => u.id === newUser.id)) {
                  const updatedUsers = [...users, newUser];
                  setUsers(updatedUsers);
                  setFilteredUsers(updatedUsers);
                  
                  // Save users to localStorage
                  localStorage.setItem(
                      `agent_${agentId}_users`,
                      JSON.stringify(updatedUsers)
                  );

                  // Store token for this user
                  const newTokens = new Map(accessTokens);
                  newTokens.set(newUser.id, tokenInput.trim());
                  setAccessTokens(newTokens);
                  
                  // Save tokens to localStorage
                  localStorage.setItem(
                      `agent_${agentId}_tokens`,
                      JSON.stringify(Array.from(newTokens.entries()))
                  );
                  
                  console.log("User added successfully:", newUser);
              } else {
                  console.log("User already exists in list");
              }

              setSelectedUser(newUser);
              setShowTokenModal(false);
              setTokenInput('');
              setTokenError('');
          } else {
              // Handle specific error messages
              if (data.error === "Token not found") {
                  setTokenError("Invalid token. Please check and try again.");
              } else if (data.error === "Token has been revoked") {
                  setTokenError("This token has been revoked and is no longer valid.");
              } else if (data.error === "Token has expired") {
                  setTokenError("This token has expired. Please ask the user to generate a new one.");
              } else {
                  setTokenError(data.error || "Invalid token. Please verify and try again.");
              }
          }
      } catch (err) {
          console.error("Verification error:", err);
          setTokenError("Network error. Please check your connection and try again.");
      } finally {
          setIsVerifying(false);
      }
  };

  const handleUserSelect = (user: User) => {
      // Check if we already have a token for this user
      const existingToken = accessTokens.get(user.id);
      
      if (existingToken) {
          // If we already have a token, just select the user
          setSelectedUser(user);
          setSearchQuery('');
      } else {
          // If no token exists, prompt for token
          setSelectedUser(user);
          setShowTokenModal(true);
          // Store the selected user temporarily
          localStorage.setItem(`pending_user_${agentId}`, JSON.stringify(user));
      }
      setSearchQuery('');
  };

  const fetchUserData = async () => {
    if (!selectedUser) return;
    
    const token = accessTokens.get(selectedUser.id);
    if (!token) {
      console.error("No token found for user");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const [emotions, journals, chats] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser.id}/emotions?range=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : { data: [] }),
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser.id}/journals?decrypt=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []),
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser.id}/chats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : [])
      ]);
      
      setEmotionData(emotions.data || emotions || []);
      setJournalEntries(journals || []);
      setChatSessions(chats || []);
      
      // Load notes for this user
      const userNotes = JSON.parse(localStorage.getItem(`agent_${agentId}_notes_${selectedUser.id}`) || '[]');
      setNotes(userNotes);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    localStorage.setItem(`agent_${agentId}_users`, JSON.stringify(updatedUsers));
    
    const newTokens = new Map(accessTokens);
    newTokens.delete(userId);
    setAccessTokens(newTokens);
    localStorage.setItem(`agent_${agentId}_tokens`, JSON.stringify(Array.from(newTokens.entries())));
    
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
  };

  const saveNote = () => {
    if (!newNote.trim() || !selectedUser) return;
    
    const note: AgentNote = {
      id: Date.now().toString(),
      content: newNote,
      tags: selectedTags,
      createdAt: new Date().toISOString(),
      userId: selectedUser.id
    };
    
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem(`agent_${agentId}_notes_${selectedUser.id}`, JSON.stringify(updatedNotes));
    
    setNewNote("");
    setSelectedTags([]);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    if (selectedUser) {
      localStorage.setItem(`agent_${agentId}_notes_${selectedUser.id}`, JSON.stringify(updatedNotes));
    }
  };

  // Emotion distribution for pie chart
  const emotionDistribution = (emotionData || []).reduce((acc, day) => {
    Object.entries(day).forEach(([emotion, count]) => {
      if (emotion !== 'date' && typeof count === 'number') {
        acc[emotion] = (acc[emotion] || 0) + count;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(emotionDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    emotion: name
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Bubble Animation Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 120 + 30}px`,
              height: `${Math.random() * 120 + 30}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(147, 51, 234, ${Math.random() * 0.15 + 0.05}) 0%, rgba(147, 51, 234, 0) 70%)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 8 + 6}s`,
              transform: `scale(${Math.random() * 0.8 + 0.5})`
            }}
          />
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-20">
        <button
          onClick={() => document.getElementById('sidebar')?.classList.toggle('hidden')}
          className="bg-purple-600 text-white p-2 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div id="sidebar" className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform -translate-x-full md:translate-x-0 transition-transform duration-300 z-10 overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <h2 className="text-2xl font-bold">Agent Dashboard</h2>
          <p className="text-purple-100 text-sm mt-1">Therapist & Admin View</p>
          <button 
            onClick={onLogout} 
            className="mt-4 text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors w-full"
          >
            Logout
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border rounded-lg p-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            onClick={() => setShowTokenModal(true)}
            className="mt-3 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            + Add User with Token
          </button>
        </div>
        
        {/* Users List */}
        <div className="flex-1 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">ACCESSED USERS</h3>
          <div className="space-y-2">
            {filteredUsers.map(user => (
                <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0 transition-colors"
                >
                    <p className="font-medium text-sm">{user.displayName || user.email}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    {!accessTokens.has(user.id) && (
                        <p className="text-xs text-orange-500 mt-1">⚠️ Token required for access</p>
                    )}
                </div>
            ))}
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No users added yet</p>
                <p className="text-xs mt-1">Click "Add User with Token" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-80 min-h-screen">
        <div className="p-4 md:p-8">
          {!selectedUser ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center max-w-md mx-auto">
                <div className="text-8xl mb-6">👥</div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-3">No User Selected</h3>
                <p className="text-gray-500 mb-6">Search for an existing user or add a new one using their access token</p>
                <button
                  onClick={() => setShowTokenModal(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add User with Token
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading user data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedUser.displayName || selectedUser.email}</h1>
                    <p className="text-gray-500 text-sm mt-1">{selectedUser.email}</p>
                    <p className="text-xs text-gray-400 mt-2">Client since: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as any)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="week">Last 7 days</option>
                      <option value="month">Last 30 days</option>
                      <option value="3months">Last 90 days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm">Total Journals</p>
                  <p className="text-2xl font-bold text-gray-800">{journalEntries.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm">Chat Sessions</p>
                  <p className="text-2xl font-bold text-gray-800">{chatSessions.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm">Most Common Emotion</p>
                  <p className="text-2xl font-bold capitalize text-gray-800">
                    {Object.entries(emotionDistribution).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-gray-500 text-sm">Active Days</p>
                  <p className="text-2xl font-bold text-gray-800">{emotionData.length}</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold mb-4 text-gray-800">Emotion Timeline</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={emotionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="joy" stroke={EMOTION_COLORS.joy} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="sadness" stroke={EMOTION_COLORS.sadness} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="anger" stroke={EMOTION_COLORS.anger} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="anxiety" stroke={EMOTION_COLORS.anxiety} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-semibold mb-4 text-gray-800">Emotion Distribution</h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS] || '#A0A0A0'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Journal Entries */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <h3 className="font-semibold mb-4 text-gray-800">Recent Journal Entries</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {journalEntries.slice(0, 10).map(entry => (
                    <div key={entry.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                          {entry.primaryEmotion}
                        </span>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{entry.text || entry.content || "No content available"}</p>
                    </div>
                  ))}
                  {journalEntries.length === 0 && (
                    <p className="text-gray-400 text-center py-8">No journal entries found</p>
                  )}
                </div>
              </div>

              {/* Agent Notes Section */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold mb-4 text-gray-800">📝 Agent Notes</h3>

                <textarea
                  placeholder="Write observations about this user..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full border rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />

                <div className="flex flex-wrap gap-2 mb-3">
                  {["journal", "chat", "emotion", "insight", "action"].map(tag => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        selectedTags.includes(tag)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>

                <button
                  onClick={saveNote}
                  disabled={!newNote.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Note
                </button>

                {/* Notes list */}
                <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                  {notes.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No notes yet. Add your first note above.</p>
                  )}
                  {notes.map(note => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3 relative group">
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                      <p className="text-sm text-gray-700 pr-6">{note.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="text-xs bg-white px-2 py-0.5 rounded-full text-purple-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Token Verification Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTokenModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Enter User Access Token</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the access token provided by the user to view their data.
            </p>
            
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token here..."
              className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && verifyToken()}
            />
            
            {tokenError && (
              <p className="text-red-500 text-sm mb-4">{tokenError}</p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={verifyToken}
                disabled={isVerifying || !tokenInput.trim()}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Add User'}
              </button>
              <button
                onClick={() => setShowTokenModal(false)}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-40px) translateX(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-20px) translateX(5px) rotate(3deg);
          }
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}