"use client";

import { useState, useRef, useEffect } from "react";
import { aiService } from "@/services/aiService";
import { Sparkles, X, Send, Bot, User, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AIStudyBuddy({ context }: { context?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Chào bạn! Tôi là StudyBuddy. Hôm nay bạn cần tôi giúp gì trong việc học không?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const response = await aiService.chat(userMsg, context);
    
    setMessages(prev => [...prev, { role: "ai", content: response }]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-accent text-background rounded-full shadow-2xl z-[100] flex items-center justify-center group"
      >
        <Sparkles size={28} className="group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-2 border-background animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
              "fixed bottom-28 right-8 z-[100] bg-card border border-border-notion rounded-[32px] shadow-soft overflow-hidden flex flex-col transition-all duration-300",
              isExpanded ? "w-[600px] h-[800px]" : "w-80 sm:w-96 h-[500px]"
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-border-notion bg-active-notion/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-black text-accent text-sm leading-none">StudyBuddy</h3>
                  <span className="text-[10px] font-bold text-success uppercase tracking-widest leading-none">AI Đang online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 hover:bg-active-notion rounded-lg text-foreground/40 transition-colors"
                >
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-active-notion rounded-lg text-foreground/40 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "")}>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                    msg.role === "ai" ? "bg-accent/10 text-accent" : "bg-active-notion text-foreground/40"
                  )}>
                    {msg.role === "ai" ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "ai" 
                      ? "bg-active-notion/50 text-accent font-medium" 
                      : "bg-accent text-background font-bold shadow-lg"
                  )}>
                    {msg.role === "ai" ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <div className="p-4 bg-active-notion/50 rounded-2xl w-24 h-10" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-notion bg-active-notion/20">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Hỏi bất cứ điều gì..."
                  className="w-full bg-card border border-border-notion rounded-2xl p-4 pr-14 text-sm font-bold outline-none focus:border-accent/30 transition-all placeholder:text-foreground/10 text-accent"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2.5 bg-accent text-background rounded-xl shadow-lg hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-center mt-3 text-foreground/20 font-bold uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
