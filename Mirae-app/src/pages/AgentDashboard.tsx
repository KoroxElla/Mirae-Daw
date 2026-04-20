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
}

export default function AgentDashboard({ agentId }: AgentDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [chatSessions, setChatSessions] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months'>('month');
  const [loading, setLoading] = useState(true);
  const [apiToken, setApiToken] = useState('');

  useEffect(() => {
    // Load users when dashboard mounts
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserData();
    }
  }, [selectedUser, timeRange]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        if (data.length > 0) {
          setSelectedUser(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const [emotions, journals, chats] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser}/emotions?range=${timeRange}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser}/journals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser}/chats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json())
      ]);
      
      setEmotionData(emotions);
      setJournalEntries(journals);
      setChatSessions(chats);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/users/${selectedUser}/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_${selectedUser}_data.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting data:', error);
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

  const EMOTION_COLORS = {
    joy: '#FFD93D',
    sadness: '#4D96FF',
    anger: '#FF6B6B',
    anxiety: '#9D4EDD',
    neutral: '#A0A0A0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const selectedUserInfo = users.find(u => u.id === selectedUser);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-purple-600">Agent Dashboard</h2>
          <p className="text-xs text-gray-500">Therapist/Admin View</p>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">USERS</h3>
          <div className="space-y-1">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  selectedUser === user.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {user.displayName || user.email}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedUserInfo?.displayName || 'Select a user'}
              </h1>
              <p className="text-gray-500 text-sm">{selectedUserInfo?.email}</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="3months">Last 90 days</option>
              </select>
              <button
                onClick={exportData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                Export Data
              </button>
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
          {/* Emotion Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-semibold mb-4">Emotion Timeline</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emotionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="joy" stroke="#FFD93D" strokeWidth={2} />
                  <Line type="monotone" dataKey="sadness" stroke="#4D96FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="anger" stroke="#FF6B6B" strokeWidth={2} />
                  <Line type="monotone" dataKey="anxiety" stroke="#9D4EDD" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotion Distribution */}
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

        {/* Chat Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-4">Chat Sessions</h3>
          <div className="space-y-3">
            {chatSessions.map(session => (
              <div key={session.id} className="border-b pb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{new Date(session.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-purple-600">{session.messageCount} messages</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {session.preview}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
