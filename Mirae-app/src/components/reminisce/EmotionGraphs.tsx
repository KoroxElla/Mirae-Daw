import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface JournalEntry {
  id: string;
  text: string;
  primaryEmotion: string;
  createdAt: string;
  weights?: Record<string, number>;
}

interface EmotionGraphsProps {
  entries: JournalEntry[];
}

const EMOTION_ORDER = ['joy', 'calm', 'neutral', 'sadness', 'anxious', 'anger'];
const EMOTION_COLORS: Record<string, string> = {
  joy: '#FFD93D',
  calm: '#6BCB77',
  neutral: '#A0A0A0',
  sadness: '#4D96FF',
  anxious: '#9D4EDD',
  anger: '#FF6B6B',
};
const EMOTION_EMOJIS: Record<string, string> = {
  joy: '😊',
  calm: '😌',
  neutral: '😐',
  sadness: '😢',
  anxious: '😰',
  anger: '😠',
};

type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export default function EmotionGraphs({ entries }: EmotionGraphsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');

  const filteredEntries = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3months':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6months':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }
    
    return entries.filter(entry => new Date(entry.createdAt) >= startDate);
  }, [entries, timeRange]);

  // Timeline data (emotions over time)
  const timelineData = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { date };
        EMOTION_ORDER.forEach(emotion => { grouped[date][emotion] = 0; });
      }
      grouped[date][entry.primaryEmotion] = (grouped[date][entry.primaryEmotion] || 0) + 1;
    });
    
    return Object.values(grouped);
  }, [filteredEntries]);

  // Distribution data (pie chart)
  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    EMOTION_ORDER.forEach(emotion => { counts[emotion] = 0; });
    
    filteredEntries.forEach(entry => {
      counts[entry.primaryEmotion]++;
    });
    
    return EMOTION_ORDER
      .filter(emotion => counts[emotion] > 0)
      .map(emotion => ({
        name: `${EMOTION_EMOJIS[emotion]} ${emotion}`,
        value: counts[emotion],
        emotion,
      }));
  }, [filteredEntries]);

  // Statistics
  const statistics = useMemo(() => {
    const total = filteredEntries.length;
    if (total === 0) return null;
    
    const mostCommon = EMOTION_ORDER.reduce((prev, curr) => 
      (filteredEntries.filter(e => e.primaryEmotion === curr).length > 
       filteredEntries.filter(e => e.primaryEmotion === prev).length) ? curr : prev
    );
    
    const trend = filteredEntries.slice(-5).map(e => e.primaryEmotion);
    const improving = trend.filter(e => e === 'joy' || e === 'calm').length > trend.filter(e => e === 'anger' || e === 'sadness').length;
    
    return { total, mostCommon, improving };
  }, [filteredEntries]);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All Time' },
  ];

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Yet</h3>
        <p className="text-gray-500">Write some journal entries to see your emotional journey!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">📊 Emotional Journey Analytics</h3>
        <p className="text-gray-500 text-sm">Track how your emotions evolve over time</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Total Entries</p>
            <p className="text-2xl font-bold">{statistics.total}</p>
          </div>
          <div 
            className="rounded-lg p-4 text-white"
            style={{ background: `linear-gradient(135deg, ${EMOTION_COLORS[statistics.mostCommon]}, ${EMOTION_COLORS[statistics.mostCommon]}cc)` }}
          >
            <p className="text-sm opacity-90">Most Common Emotion</p>
            <p className="text-2xl font-bold capitalize">
              {EMOTION_EMOJIS[statistics.mostCommon]} {statistics.mostCommon}
            </p>
          </div>
          <div className={`rounded-lg p-4 text-white ${statistics.improving ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
            <p className="text-sm opacity-90">Recent Trend</p>
            <p className="text-2xl font-bold">
              {statistics.improving ? '📈 Improving' : '📉 Declining'}
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-2">
          {timeRangeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                timeRange === option.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {(['line', 'bar', 'pie'] as const).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm transition capitalize ${
                chartType === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-[400px]">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-4xl mb-2">📭</p>
              <p>No entries in this time period</p>
              <p className="text-sm">Try selecting a different range</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && timelineData.length > 0 ? (
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {EMOTION_ORDER.map(emotion => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={EMOTION_COLORS[emotion]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: EMOTION_COLORS[emotion] }}
                    name={`${EMOTION_EMOJIS[emotion]} ${emotion}`}
                  />
                ))}
              </LineChart>
            ) : chartType === 'bar' && timelineData.length > 0 ? (
              <BarChart data={timelineData.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {EMOTION_ORDER.map(emotion => (
                  <Bar
                    key={emotion}
                    dataKey={emotion}
                    stackId="stack"
                    fill={EMOTION_COLORS[emotion]}
                    name={`${EMOTION_EMOJIS[emotion]} ${emotion}`}
                  />
                ))}
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={130}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Insight Message */}
      {filteredEntries.length > 0 && statistics && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">💡 Emotional Insight</h4>
          <p className="text-sm text-gray-600">
            {statistics.mostCommon === 'joy' && "You're radiating positivity! Keep nurturing what makes you happy. 🌟"}
            {statistics.mostCommon === 'calm' && "You're maintaining great emotional balance. Your mindfulness is working! 🧘"}
            {statistics.mostCommon === 'neutral' && "You're in a stable emotional state. Perfect time for reflection. ⚖️"}
            {statistics.mostCommon === 'sadness' && "You've been feeling down. Remember that difficult times pass, and reaching out helps. 💙"}
            {statistics.mostCommon === 'anxious' && "Anxiety has been present. Take deep breaths and tackle things one step at a time. 🦋"}
            {statistics.mostCommon === 'anger' && "Frustration has been frequent. Consider taking breaks and practicing relaxation techniques. 🧘"}
          </p>
        </div>
      )}
    </div>
  );
}
