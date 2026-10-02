import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Scale,
} from 'lucide-react';
import { ChatMessage, DocumentType } from '../types';
import { api } from '../services/api';

interface AIChatViewProps {
  initialMessage?: string;
  onNavigateToGenerator?: (docType?: DocumentType) => void;
}

export const AIChatView: React.FC<AIChatViewProps> = ({
  initialMessage,
  onNavigateToGenerator,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am LegalEase AI, your legal assistant.

You can ask me questions about contract terms, tenancy rights, NDAs, loan agreements, or employment guidelines.

What legal question can I help explain for you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState(initialMessage || '');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialMessage && initialMessage.trim().length > 0) {
      handleSend(initialMessage);
    }
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const replyText = await api.sendChatMessage(query, history);

      let suggestedAction: any = undefined;
      const lowerReply = replyText.toLowerCase();
      if (lowerReply.includes('rental agreement') || lowerReply.includes('residential lease')) {
        suggestedAction = { type: 'generate', label: 'Draft Rental Agreement', payload: 'Rental Agreement' };
      } else if (lowerReply.includes('non-disclosure') || lowerReply.includes('nda')) {
        suggestedAction = { type: 'generate', label: 'Draft Non-Disclosure Agreement', payload: 'NDA' };
      } else if (lowerReply.includes('loan agreement') || lowerReply.includes('promissory')) {
        suggestedAction = { type: 'generate', label: 'Draft Loan Agreement', payload: 'Loan Agreement' };
      } else if (lowerReply.includes('employment agreement') || lowerReply.includes('offer letter')) {
        suggestedAction = { type: 'generate', label: 'Draft Employment Agreement', payload: 'Employment Agreement' };
      } else if (lowerReply.includes('affidavit')) {
        suggestedAction = { type: 'generate', label: 'Draft Affidavit', payload: 'Affidavit' };
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to process your inquiry right now. Please verify your connection and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterChips = [
    'Tenant rights for security deposit return',
    'Is an NDA enforceable without payment?',
    'Employee vs. 1099 contractor rules',
    'Legal interest rate caps on personal loans',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 h-[calc(100vh-6rem)] flex flex-col justify-between">
      {/* Compact Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F2937] text-white flex items-center justify-center">
            <Scale className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#1F2937]">
              AI Legal Chat
            </h1>
            <p className="text-[11px] text-[#475569]">
              Ask legal questions in natural language.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="text-xs text-[#475569] hover:text-[#1F2937] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#F1F5F9]"
          title="Reset conversation"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'ml-auto justify-end max-w-xl' : 'mr-auto max-w-2xl'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-[#1F2937] text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  <span className="text-[#06B6D4]">LE</span>
                </div>
              )}

              <div
                className={`group rounded-xl p-4 text-xs sm:text-sm leading-relaxed transition-all ${
                  isUser
                    ? 'bg-[#1F2937] text-white shadow-xs'
                    : 'bg-[#FFFFFF] border border-slate-200/90 text-[#1F2937] shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.content}
                </div>

                {/* Suggested Action Button if contract intent was detected */}
                {!isUser && msg.suggestedAction && onNavigateToGenerator && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateToGenerator(msg.suggestedAction?.payload)}
                      className="text-xs font-semibold text-[#06B6D4] hover:text-[#0891b2] flex items-center gap-1 transition-colors"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#475569]">
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1F2937] flex items-center gap-1"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-md bg-slate-200 text-[#1F2937] flex items-center justify-center shrink-0 text-xs mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-2xl">
            <div className="w-6 h-6 rounded-md bg-[#1F2937] text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
              <span className="text-[#06B6D4]">LE</span>
            </div>
            <div className="bg-[#FFFFFF] border border-slate-200/90 rounded-xl p-3 text-xs text-[#475569] shadow-xs flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#06B6D4] animate-ping" />
              <span>Formulating legal analysis...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Starter Chips */}
      {messages.length <= 2 && (
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs shrink-0">
          <span className="text-slate-400 shrink-0 font-medium text-[11px]">Suggested:</span>
          {starterChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="whitespace-nowrap px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-slate-200 rounded-md text-[#475569] hover:text-[#1F2937] transition-colors text-[11px]"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Compact Input Bar */}
      <div className="pt-2 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-1.5 focus-within:border-[#06B6D4] focus-within:ring-2 focus-within:ring-[#67E8F9]/30 transition-all shadow-xs"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask any legal question (e.g. lease notice rules, NDA scope)..."
            className="w-full px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-slate-400 bg-transparent focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891b2] disabled:bg-slate-200 text-white disabled:text-slate-400 transition-colors shrink-0 shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
