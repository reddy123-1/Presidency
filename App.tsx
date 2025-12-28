
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, Coffee, BookOpen, GraduationCap, Building2, Send, Loader2, Compass, Home } from 'lucide-react';
import { ChatMessage as ChatMessageType, Location } from './types';
import { searchCampus } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';

const QUICK_ACTIONS = [
  { icon: Building2, label: 'Directions to Block A', query: 'How do I get to Block A from the main entrance?' },
  { icon: Coffee, label: 'Nearest Cafeteria', query: 'Where is the nearest cafeteria or food court on campus?' },
  { icon: BookOpen, label: 'Central Library', query: 'Show me the location of the Central Library.' },
  { icon: Navigation, label: 'Main Entrance', query: 'Where is the main entrance of Presidency University?' },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your Presidency University Navigator. How can I help you find your way around campus today?',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation access denied or unavailable.");
        }
      );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await searchCampus(textToSend, userLocation);
      const assistantMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        links: result.groundingLinks,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the campus map right now. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">Presidency Navigator</h1>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span>Bengaluru Campus</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userLocation ? (
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
               <MapPin size={12} />
               <span>Location Active</span>
             </div>
          ) : (
            <button 
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
              }}
              className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
            >
              Enable GPS
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-slate-400 text-sm animate-pulse ml-2 mb-6">
                <div className="bg-slate-200 w-10 h-10 rounded-full flex items-center justify-center">
                  <Loader2 className="animate-spin" size={20} />
                </div>
                <span>Checking campus maps...</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions overlay when no messages except welcome */}
        {messages.length === 1 && !isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Presidency University</h2>
              <p className="text-slate-500">How can I assist you with campus navigation today?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.query)}
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all group text-left"
                >
                  <div className="bg-slate-50 group-hover:bg-indigo-50 p-3 rounded-xl transition-colors">
                    <action.icon className="text-slate-500 group-hover:text-indigo-600" size={20} />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4 md:p-6 sticky bottom-0">
          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-4 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all shadow-sm">
              <Compass className="text-slate-400 flex-shrink-0" size={20} />
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for directions, locations, or facilities..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 py-3"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-xl transition-all ${
                  input.trim() && !isLoading 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest font-bold">
              Powered by Gemini Maps Grounding
            </p>
          </div>
        </div>
      </main>

      {/* Navigation Bar (Mobile) */}
      <nav className="md:hidden bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around text-slate-400">
        <button className="flex flex-col items-center gap-1 text-indigo-600">
          <Home size={20} />
          <span className="text-[10px] font-bold">HOME</span>
        </button>
        <button 
          onClick={() => setMessages([{ id: 'welcome', role: 'assistant', content: 'Hello! How can I help you find your way around today?', timestamp: Date.now() }])}
          className="flex flex-col items-center gap-1 hover:text-indigo-600 transition-colors"
        >
          <Search size={20} />
          <span className="text-[10px] font-bold">NEW TRIP</span>
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-indigo-600 transition-colors">
          <Navigation size={20} />
          <span className="text-[10px] font-bold">MAP</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
