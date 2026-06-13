"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi there. I'm Mana. I know the pressure can feel incredibly heavy right now. I'm here to listen, whenever you're ready to share.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when a new message is added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput(""); // Clear input immediately for better UX
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Send the entire conversation history to maintain context
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat({ role: "user", content: userMsg }).map(m => ({
            role: m.role,
            content: m.content
          })),
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        console.error("No reply in response", data);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having a little trouble connecting right now. Let's take a deep breath and try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center pt-8 pb-4 px-4 sm:px-8">
      {/* Header */}
      <div className="w-full max-w-3xl mb-6">
        <h1 className="text-2xl font-light text-purple-200 flex items-center gap-2">
          <Sparkles size={24} className="text-indigo-400" />
          Chat Journal
        </h1>
        <p className="text-indigo-400/80 text-sm mt-1">
          A safe, quiet space to write out what you are feeling.
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 w-full max-w-3xl bg-[#11141D] border border-indigo-900/50 rounded-2xl flex flex-col overflow-hidden shadow-xl shadow-indigo-900/10">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-indigo-900 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user"
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "bg-purple-900/30 text-purple-300"
                }`}
              >
                {msg.role === "user" ? <User size={20} /> : <Sparkles size={20} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm md:text-base font-light leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-indigo-50 rounded-tr-sm"
                    : "bg-[#1A1E2C] text-indigo-100 border border-indigo-800/30 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-full bg-purple-900/30 text-purple-300 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-[#1A1E2C] border border-indigo-800/30 rounded-tl-sm flex items-center gap-2 text-indigo-300">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-light">Mana is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0A0C10]/50 border-t border-indigo-900/50">
          <form
            onSubmit={handleSend}
            className="flex items-end gap-3 bg-[#11141D] border border-indigo-800/50 rounded-xl p-2 focus-within:border-indigo-500/50 transition-colors"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your thoughts here... (Shift+Enter for new line)"
              className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-indigo-50 placeholder-indigo-700 focus:ring-0 resize-none py-3 px-4 text-sm"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="mb-1 mr-1 w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex-shrink-0"
            >
              <Send size={18} className={`${input.trim() && !isLoading ? "ml-1" : ""}`} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}