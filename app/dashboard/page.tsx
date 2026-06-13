"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { Activity, Brain, Target } from 'lucide-react';

const COLORS = ['#818CF8', '#A78BFA', '#C084FC', '#E879F9', '#38BDF8'];

export default function Dashboard() {
  const [trends, setTrends] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [triggers, setTriggers] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics/trends').then(res => res.json()),
      fetch('/api/analytics/emotions').then(res => res.json()),
      fetch('/api/analytics/triggers').then(res => res.json()),
    ]).then(([trendsData, emotionsData, triggersData]) => {
      setTrends(trendsData);
      setEmotions(emotionsData);
      setTriggers(triggersData);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-indigo-50 p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-light text-purple-200">Wellness Analytics</h1>
        <p className="text-indigo-400 mt-2">Tracking your internal state to help you breathe easier.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 14-Day Trajectory */}
        <div className="bg-[#11141D] p-6 rounded-2xl border border-indigo-900/50">
          <div className="flex items-center gap-3 mb-6 text-indigo-300">
            <Activity size={20} />
            <h2 className="text-lg">14-Day Stress Trajectory</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <XAxis dataKey="date" stroke="#4F46E5" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                <YAxis stroke="#4F46E5" fontSize={12} domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#1E1B4B', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="avg_stress" stroke="#A78BFA" strokeWidth={3} dot={{ fill: '#818CF8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotions Doughnut */}
        <div className="bg-[#11141D] p-6 rounded-2xl border border-indigo-900/50">
          <div className="flex items-center gap-3 mb-6 text-indigo-300">
            <Brain size={20} />
            <h2 className="text-lg">Primary Emotion States</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={emotions} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {emotions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E1B4B', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Triggers Bar Chart */}
        <div className="bg-[#11141D] p-6 rounded-2xl border border-indigo-900/50 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6 text-indigo-300">
            <Target size={20} />
            <h2 className="text-lg">AI-Identified Hidden Triggers</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={triggers} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#312E81" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} stroke="#4F46E5" />
                <YAxis dataKey="trigger" type="category" stroke="#A78BFA" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1E1B4B', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="avg_stress" fill="#818CF8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}