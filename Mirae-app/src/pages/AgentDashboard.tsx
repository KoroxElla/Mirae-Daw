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

const EMOTION_COLORS = {
  joy: '#FFD93D',
  sadness: '#4D96FF',
  anger: '#FF6B6B',
  anxiety: '#9D4EDD',
  neutral: '#A0A0A0'
};

export default function AgentDashboard({ agentId }: AgentDashboardProps) {
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
  const [selectedUserId, setSelectedUserId] = useState('');
  

  // Load existing accessed users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem(`agent_${agentId}_users`);
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      setFilteredUsers(parsedUsers);
    }
  }, [agentId]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserData();
    }
  }, [selectedUser, timeRange]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredUsers([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/agent/users/search?q=${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      setFilteredUsers(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleAddUser = async () => {
    setShowTokenModal(true);
    setTokenInput('');
    setTokenError('');
  };


  const verifyToken = async () => {
    if (!selectedUser) return;

    setIsVerifying(true);
    setTokenError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agent/verify-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: tokenInput,
            userId: selectedUser.id   // ✅ REQUIRED
          })
        }
      );

      if (response.ok) {
        const data = await response.json();

        const updatedUsers = [...users, selectedUser];
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);

        localStorage.setItem(
          `agent_${agentId}_users`,
          JSON.stringify(updatedUsers)
        );

        // store token
        const newTokens = new Map(accessTokens);
        newTokens.set(selectedUser.id, tokenInput);
        setAccessTokens(newTokens);

        setShowTokenModal(false);
      } else {
        const error = await response.json();
        setTokenError(error.error || "Invalid token");
      }

    } catch {
      setTokenError("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchUserData = async () => {
    if (!selectedUser) return;
    
    const token = accessTokens.get(selectedUser.id);
    if (!token) return;
    
    try {
      const [emotions, journals, chats] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser.id}/emotions?range=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser.id}/journals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser.id}/chats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json())
      ]);
      
      setEmotionData(emotions.data);
      setJournalEntries(journals);
      setChatSessions(chats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const removeUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    setFilteredUsers(updatedUsers);
    localStorage.setItem(`agent_${agentId}_users`, JSON.stringify(updatedUsers));
    if (selectedUser?.id === userId) {
      setSelectedUser(null);
    }
  };

  // Emotion distribution for pie chart
  const emotionDistribution = emotionData.reduce((acc, day) => {
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
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-purple-600">Agent Dashboard</h2>
          <p className="text-xs text-gray-500">Therapist/Admin View</p>
        </div>
        <button onClick={onLogout} className="text-sm bg-gray-200 px-3 py-1 rounded-full hover:bg-gray-300 transition-colors">
            Logout
          </button>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />

          {searchQuery && filteredUsers.length > 0 && (
            <div className="absolute w-full bg-white border rounded-lg mt-1 shadow-lg z-10 max-h-40 overflow-y-auto">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {user.displayName || user.email}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 px-4 pt-4 pb-2">ACCESSED USERS</h3>
          <div className="space-y-1 px-2">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`group relative rounded-lg transition ${
                  selectedUser?.id === user.id
                    ? 'bg-purple-100'
                    : 'hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => setSelectedUser(user)}
                  className="w-full text-left px-3 py-2"
                >
                  <p className="font-medium text-sm truncate">{user.displayName || user.email}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </button>
                <button
                  onClick={() => removeUser(user.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-80 p-6">
        {!selectedUser ? (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No User Selected</h3>
              <p className="text-gray-500">Search for a user or add a new one using their token</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">{selectedUser.displayName || selectedUser.email}</h1>
                  <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Client since: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                    <option value="3months">Last 90 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Total Journals</p>
                <p className="text-2xl font-bold">{journalEntries.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Chat Sessions</p>
                <p className="text-2xl font-bold">{chatSessions.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Most Common Emotion</p>
                <p className="text-2xl font-bold capitalize">
                  {Object.entries(emotionDistribution).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Active Days</p>
                <p className="text-2xl font-bold">{emotionData.length}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold mb-4">Emotion Timeline</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={emotionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="joy" stroke={EMOTION_COLORS.joy} strokeWidth={2} />
                      <Line type="monotone" dataKey="sadness" stroke={EMOTION_COLORS.sadness} strokeWidth={2} />
                      <Line type="monotone" dataKey="anger" stroke={EMOTION_COLORS.anger} strokeWidth={2} />
                      <Line type="monotone" dataKey="anxiety" stroke={EMOTION_COLORS.anxiety} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-semibold mb-4">Emotion Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={EMOTION_COLORS[entry.emotion as keyof typeof EMOTION_COLORS]} />
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
              <h3 className="font-semibold mb-4">Recent Journal Entries</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {journalEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="border-b pb-3">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      <span className="capitalize px-2 py-0.5 rounded bg-gray-100">
                        {entry.primaryEmotion}
                      </span>
                    </div>
                    <p className="text-gray-700 line-clamp-2">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Token Verification Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Enter User Access Token</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter the token provided by the user to access their data.
            </p>
            
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token here..."
              className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:border-purple-600"
            />
            
            {tokenError && (
              <p className="text-red-500 text-sm mb-4">{tokenError}</p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={verifyToken}
                disabled={isVerifying || !tokenInput.trim()}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Add User'}
              </button>
              <button
                onClick={() => setShowTokenModal(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
