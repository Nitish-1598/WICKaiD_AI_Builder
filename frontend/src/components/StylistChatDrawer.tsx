import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Wand2, User, Loader2, ShoppingBag, ArrowRight, Globe, Cpu, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface GroundingSource {
  title: string;
  url: string;
  snippet?: string;
}

interface AgentAction {
  tool: string;
  input?: any;
  output: string;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  recommendedItemIds?: string[];
  groundingSources?: GroundingSource[];
  agentActions?: AgentAction[];
  modelUsed?: string;
}

interface StylistChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userGarments: any[];
  occasion: string;
  onAddToCart: (item: any) => void;
  cartItems: any[];
}

const QUICK_PROMPTS = [
  'How do I style my coat for an executive meeting?',
  'What 3 essential pieces is my wardrobe missing?',
  'Give me a rainy day outfit formula.',
  'How do I dress up sneakers for a stylish dinner?',
];

const renderFormattedMessage = (content: string) => {
  if (!content) return null;
  const lines = content.split('\n');

  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const rawContent = isBullet ? trimmed.replace(/^[•\-\*]\s*/, '') : line;

    // Parse **bold text** into <strong> elements
    const parts = rawContent.split(/(\*\*[^*]+?\*\*)/g);
    const parsedLine = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanText = part.slice(2, -2).replace(/\*\*/g, '');
        return (
          <strong key={partIdx} className="font-semibold text-white">
            {cleanText}
          </strong>
        );
      }
      // Strip any stray dangling asterisks
      return part.replace(/\*\*/g, '');
    });

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start space-x-2 my-1 pl-1">
          <span className="text-rose-400 font-bold shrink-0 leading-relaxed">•</span>
          <span className="leading-relaxed">{parsedLine}</span>
        </div>
      );
    }

    return (
      <p key={lineIdx} className="leading-relaxed">
        {parsedLine}
      </p>
    );
  });
};

export const StylistChatDrawer: React.FC<StylistChatDrawerProps> = ({
  isOpen,
  onClose,
  userGarments,
  occasion,
  onAddToCart,
  cartItems,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Hello, darling. I'm **Aura**, your Haute Couture Personal Stylist and Wardrobe Architect. I'm analyzing your digitized closet for **${occasion}**. How can I elevate your silhouette today?`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await axios.get('/api/catalog');
        setCatalogItems(res.data);
      } catch (err) {
        console.warn('Catalog fetch failed in chat');
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const res = await axios.post('/api/chat-stylist', {
        message: text,
        history,
        userGarments,
        occasion,
      });

      const replyMsg: Message = {
        role: 'model',
        text: res.data.reply,
        recommendedItemIds: res.data.recommendedItemIds || [],
        groundingSources: res.data.groundingSources || [],
        agentActions: res.data.agentActions || [],
        modelUsed: res.data.modelUsed,
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Forgive me, darling—I encountered a brief connection flutter. But as a general rule: balance oversized silhouettes with tapered trousers for instant architectural elegance.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg glass-panel-luxury h-full border-l border-rose-950/50 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-400 to-violet-600 p-0.5 shadow-lg shadow-rose-500/30">
                <div className="h-full w-full bg-[#0b0c10] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-rose-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#0b0c10]"></span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-white text-base">Aura AI Stylist</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Grounded Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {userGarments.length} closet pieces • Google Search Grounding Active
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const matchedItems = msg.recommendedItemIds
              ? catalogItems.filter((c) => msg.recommendedItemIds?.includes(c.id))
              : [];

            return (
              <div
                key={idx}
                className={`flex flex-col space-y-2 ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-start space-x-2 max-w-[88%]">
                  {!isUser && (
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Wand2 className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-tr-none shadow-md shadow-rose-900/40'
                        : 'glass-panel-card text-slate-200 border border-slate-800/90 rounded-tl-none space-y-3'
                    }`}
                  >
                    {/* Agent Tool Executions Pill */}
                    {!isUser && msg.agentActions && msg.agentActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800/60">
                        {msg.agentActions.map((act, actIdx) => (
                          <span
                            key={actIdx}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-[10px] text-indigo-300 font-mono"
                          >
                            <Cpu className="h-2.5 w-2.5 text-indigo-400" />
                            <span className="font-semibold">{act.tool}:</span>
                            <span className="text-slate-300">{act.output}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1 text-xs md:text-sm">{renderFormattedMessage(msg.text)}</div>

                    {/* Google Search Grounding Sources */}
                    {!isUser && msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400">
                          <Globe className="h-3 w-3 text-emerald-400" />
                          <span>Grounded in Live Fashion Search Intelligence:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.groundingSources.map((src, srcIdx) => (
                            <a
                              key={srcIdx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-[10px] text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors max-w-[240px] truncate"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                {/* Recommended Catalog Items Card Callout */}
                {matchedItems.length > 0 && (
                  <div className="ml-9 space-y-2 max-w-[88%]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                      Recommended Pieces Mentioned:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedItems.map((item) => {
                        const inCart = cartItems.some((ci) => ci.id === item.id);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800"
                          >
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-semibold text-white truncate">{item.name}</p>
                              <p className="text-[10px] text-rose-300 font-mono">${item.price}</p>
                            </div>
                            <button
                              onClick={() => onAddToCart(item)}
                              disabled={inCart}
                              className={`p-1.5 rounded-lg text-xs transition-all ${
                                inCart
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'btn-luxury-primary text-white'
                              }`}
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-rose-300 p-3 rounded-xl glass-panel-card w-fit ml-9 border border-rose-950/40">
              <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
              <span>Aura is curating your personalized styling advice...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2 border-t border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-[10px] text-slate-300 hover:text-white glass-panel-card border border-slate-800 whitespace-nowrap hover:border-rose-500/40 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0f17]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Aura anything about styling, colors, occasions..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs md:text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl btn-luxury-primary text-white disabled:opacity-40 transition-all shadow-md shadow-rose-900/30"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
