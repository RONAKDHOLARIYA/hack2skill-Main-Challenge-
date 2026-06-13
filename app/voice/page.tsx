"use client";

import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';

export default function VoiceJournal() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    
    mediaRecorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.current.push(e.data);
    };

    mediaRecorder.current.onstop = processAudio;
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
    audioChunks.current = [];
    
    const formData = new FormData();
    formData.append('audio', audioBlob);
    
    // UPDATED: Using your specific voice ID as the default
    const voiceId = localStorage.getItem('mana_parent_voice_id') || '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc';
    formData.append('voice_id', voiceId);

    try {
      const res = await fetch('/api/voice', { method: 'POST', body: formData });
      const audioBuffer = await res.arrayBuffer();
      
      const audioContext = new AudioContext();
      const decodedData = await audioContext.decodeAudioData(audioBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = decodedData;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (e) {
      console.error("Audio playback failed:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-8">
      <div className={`w-48 h-48 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(129,140,248,0.2)] transition-all duration-700 ${isRecording ? 'bg-indigo-600/20 scale-110 animate-pulse' : 'bg-[#11141D]'}`}>
        {isRecording ? (
          <button onClick={stopRecording} className="text-indigo-400 hover:text-indigo-300">
            <Square size={48} />
          </button>
        ) : (
          <button onClick={startRecording} disabled={isProcessing} className="text-indigo-500 hover:text-indigo-400 disabled:opacity-50">
            <Mic size={48} />
          </button>
        )}
      </div>
      <p className="mt-8 text-indigo-300 font-light tracking-wide">
        {isProcessing ? "Mana is thinking..." : isRecording ? "I'm listening..." : "Tap to start journaling"}
      </p>
    </div>
  );
}