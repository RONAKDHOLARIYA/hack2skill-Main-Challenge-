"use client";

import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';

export default function CloneTerminal() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading and cloning voice...');
    
    const formData = new FormData();
    formData.append('sample', file);

    try {
      const res = await fetch('/api/clone', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.voice_id) {
        localStorage.setItem('mana_parent_voice_id', data.voice_id);
        setStatus('Voice cloned successfully! You can now enable Parent Mode in chat.');
      } else {
        setStatus('Failed to clone voice.');
      }
    } catch (e) {
      setStatus('Error occurred during cloning.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] p-10 flex flex-col items-center">
      <div className="max-w-xl w-full bg-[#11141D] rounded-2xl p-8 border border-indigo-900/50">
        <h2 className="text-2xl font-light text-purple-200 mb-2">Parent Voice Mode</h2>
        <p className="text-indigo-400 mb-8 text-sm">Upload a short (10-30s) clean audio clip of your parents giving you warm encouragement. Mana will use this voice during audio journals.</p>
        
        <div className="border-2 border-dashed border-indigo-800/50 rounded-xl p-8 text-center hover:bg-indigo-900/10 transition-colors">
          <input 
            type="file" 
            accept="audio/*" 
            onChange={(e) => setFile(e.target.files?.[0] || null)} 
            className="hidden" 
            id="audio-upload"
          />
          <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
            <Upload size={32} className="text-indigo-500 mb-4" />
            <span className="text-indigo-200 font-medium">Select Audio File</span>
            <span className="text-indigo-500 text-xs mt-1">{file ? file.name : 'MP3, WAV, or M4A'}</span>
          </label>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file}
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl disabled:opacity-50 transition-colors"
        >
          Initialize Voice Clone
        </button>

        {status && (
          <div className="mt-4 flex items-center justify-center gap-2 text-indigo-300 text-sm">
            {status.includes('successfully') && <CheckCircle size={16} className="text-emerald-400" />}
            {status}
          </div>
        )}
      </div>
    </div>
  );
}