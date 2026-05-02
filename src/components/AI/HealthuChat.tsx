import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, Send, X, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const HealthuChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hi! I'm Healthu, your personal medical assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm ready to help, but I need a Gemini API Key to function. Please add GEMINI_API_KEY to your Secrets/Environment variables." }]);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const history = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: `You are "Healthu", a helpful, empathetic, and knowledgeable healthcare assistant for the MedVault platform. 
          Your goals are:
          1. Provide accurate medical information and health tips.
          2. Remind users that you are an AI and not a substitute for professional medical advice.
          3. Help users understand their potential symptoms but avoid definitive diagnoses.
          4. Be concise and friendly. Use simple language.
          5. MedVault specific: You can mention that MedVault helps them carry their health records safely.`,
          temperature: 0.7,
        }
      });

      const aiText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      let errorMsg = "Oops, I encountered a temporary connection issue. Please check your internet or try again later.";
      if (error.message && error.message.includes('API_KEY')) {
        errorMsg = "Invalid API Key. Please check your GEMINI_API_KEY in the environment.";
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] max-w-[380px] h-[500px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Healthu AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Medical Assistant</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 scroll-smooth"
            >
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-100' 
                      : 'bg-slate-50 text-slate-700 rounded-bl-none border border-slate-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none border border-slate-100 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask any health question..."
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm font-medium"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider mt-3">Healthu may provide inaccurate info. Consult a doctor.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthuChat;
