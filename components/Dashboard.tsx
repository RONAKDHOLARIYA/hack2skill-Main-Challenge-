"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BrainCircuit, AlertTriangle, HeartPulse } from 'lucide-react';

interface TriggerData {
  trigger: string;
  count: number;
  stressLevel: number;
}

export default function Dashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<TriggerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching data from your Python FastAPI backend
    fetch(`http://localhost:8080/api/dashboard/${studentId}/triggers`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      });
  }, [studentId]);

  if (loading) return <div className="text-center p-10 animate-pulse text-purple-400">Analyzing emotional logs...</div>;

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <BrainCircuit className="text-purple-400 w-8 h-8" />
        <h2 className="text-2xl font-semibold text-white">Hidden Stress Triggers</h2>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-400">No journaling sessions recorded yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* The Chart */}
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="trigger" type="category" stroke="#a78bfa" tick={{ fill: '#e2e8f0' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', color: 'white' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="stressLevel" name="Avg Stress (1-10)" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.stressLevel >= 8 ? '#ef4444' : '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-purple-900/20 p-5 rounded-xl border border-purple-500/20">
            <h3 className="text-lg font-medium text-purple-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Top Burnout Risk
            </h3>
            <div className="text-3xl font-bold text-white mb-2">{data[0]?.trigger}</div>
            <p className="text-sm text-gray-300 mb-6">
              Mentioned {data[0]?.count} times this week with severe anxiety spikes.
            </p>
            
            <h3 className="text-lg font-medium text-purple-200 mb-2 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-green-400" /> AI Recommendation
            </h3>
            <p className="text-sm text-gray-300">
              Trigger "box breathing" exercises automatically when user mentions this topic in future sessions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}