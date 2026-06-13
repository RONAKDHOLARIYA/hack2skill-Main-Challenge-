"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Activity } from 'lucide-react';
import Dashboard from '@/components/Dashboard';

// Mock Student ID for the Hackathon
const DEMO_STUDENT_ID = "123e4567-e89b-12d3-a456-426614174000"; 

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Idle");
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startSession = async () => {
    try {
      // 1. Connect to Python Backend WebSocket
      wsRef.current = new WebSocket(`ws://localhost:8080/voice-agent?student_id=${DEMO_STUDENT_ID}&lang=hi`);
      
      wsRef.current.onopen = () => setStatus("Connecting to Mana...");
      wsRef.current.onmessage = (event) => {
        // Handle incoming audio bytes from Cartesia TTS
        if (event.data instanceof Blob) {
          const audioUrl = URL.createObjectURL(event.data);
          const audio = new Audio(audioUrl);
          audio.play();
          setStatus("Mana is speaking...");
        } else {
          // Handle JSON events
          const data = JSON.parse(event.data);
          if (data.event === "bot_turn_done") setStatus("Listening...");
        }
      };

      // 2. Capture Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      setIsRecording(true);
      setStatus("Listening...");

    } catch (error) {
      console.error("Error accessing microphone", error);
      setStatus("Microphone access denied.");
    }
  };

  const stopSession = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsRecording(false);
    setStatus("Session saved. AI is analyzing logs...");
    
    // Refresh the page after 3 seconds so the dashboard updates
    setTimeout(() => window.location.reload(), 3000); 
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 font-sans text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="text-center pt-10">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">
            Mana Wellness
          </h1>
          <p className="text-lg text-indigo-200">Your safe space to vent, reflect, and reset.</p>
        </header>

        {/* Voice Interaction Orb */}
        <section className="flex flex-col items-center justify-center py-10">
          <div className="relative group">
            <div className={`absolute inset-0 rounded-full blur-3xl opacity-50 transition-all duration-1000 ${isRecording ? 'bg-purple-500 scale-150 animate-pulse' : 'bg-indigo-500 scale-100'}`}></div>
            
            <button 
              onClick={isRecording ? stopSession : startSession}
              className={`relative flex items-center justify-center w-40 h-40 rounded-full shadow-2xl transition-all duration-300 z-10 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              {isRecording ? <Square className="w-12 h-12 text-white" /> : <Mic className="w-16 h-16 text-white" />}
            </button>
          </div>
          
          <div className="mt-8 flex items-center gap-3 text-xl text-indigo-200 h-8">
            {isRecording && <Activity className="w-6 h-6 animate-pulse text-purple-400" />}
            {status}
          </div>
        </section>

        {/* The Dashboard */}
        <section>
          <Dashboard studentId={DEMO_STUDENT_ID} />
        </section>

      </div>
    </main>
  );
}