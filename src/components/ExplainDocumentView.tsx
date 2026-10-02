import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  ArrowRight,
  BookOpenText,
} from 'lucide-react';
import { SAMPLE_EXPLAIN_TEXTS } from '../data/documentTemplates';
import { api } from '../services/api';

interface ExplainDocumentViewProps {
  initialText?: string;
}

export const ExplainDocumentView: React.FC<ExplainDocumentViewProps> = ({ initialText }) => {
  const [inputText, setInputText] = useState(initialText || '');
  const [focusArea, setFocusArea] = useState('General Understanding');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialText && initialText.trim().length > 0) {
      handleExplain(initialText);
    }
  }, [initialText]);

  const handleExplain = async (textToExplain?: string) => {
    const text = (textToExplain || inputText).trim();
    if (!text || loading) return;

    setLoading(true);
    setExplanation(null);

    try {
      const result = await api.explainDocument(text, focusArea);
      setExplanation(result);
    } catch (err: any) {
      setExplanation(
        'Unable to explain the document text at this moment. Please verify your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    handleExplain(sampleText);
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F2937] text-white flex items-center justify-center">
            <BookOpenText className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1F2937] tracking-tight">
              Explain Legal Clauses
            </h1>
            <p className="text-xs text-[#475569]">
              Translate legalese into plain English & uncover hidden liabilities.
            </p>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Samples:</span>
          {SAMPLE_EXPLAIN_TEXTS.slice(0, 3).map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample.text)}
              className="text-[11px] px-2.5 py-1 rounded bg-[#FFFFFF] border border-slate-200 hover:border-[#06B6D4] text-[#475569] hover:text-[#1F2937] transition-colors"
            >
              {sample.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Responsive Layout for Zero Excessive Scrolling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Input and Configuration (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1F2937] mb-1">
              Contract Text or Clause
            </label>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste contract clauses, indemnities, non-competes, or paragraphs here..."
              className="w-full p-3 text-xs text-[#1F2937] border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9] leading-relaxed font-sans"
            />
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-[#475569] mb-1">
                Analysis Perspective
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full text-xs bg-[#F1F5F9] border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none text-[#1F2937]"
              >
                <option value="General Understanding">Plain English (Standard)</option>
                <option value="Hidden Liabilities & Risks">Spotting Hidden Risks</option>
                <option value="Tenant / Borrower Protection">Tenant & Borrower Rights</option>
                <option value="Contractor / Employee Rights">Contractor & Employee Rights</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-1">
              {inputText ? (
                <button
                  type="button"
                  onClick={() => {
                    setInputText('');
                    setExplanation(null);
                  }}
                  className="text-xs text-[#475569] hover:text-[#1F2937] transition-colors"
                >
                  Clear text
                </button>
              ) : <div />}

              <button
                onClick={() => handleExplain()}
                disabled={!inputText.trim() || loading}
                className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891b2] disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>{loading ? 'Analyzing...' : 'Explain in Plain English'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Explanation Results or Placeholder (7 cols) */}
        <div className="lg:col-span-7">
          {loading && (
            <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-8 text-center space-y-2.5 shadow-xs">
              <div className="w-6 h-6 border-2 border-[#67E8F9] border-t-[#06B6D4] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#475569]">Translating legalese and assessing risk allocations...</p>
            </div>
          )}

          {explanation && !loading && (
            <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-xs max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-[#1F2937]">
                  Plain English Breakdown
                </h2>
                <button
                  onClick={handleCopy}
                  className="text-xs text-[#475569] hover:text-[#1F2937] flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-xs sm:text-sm text-[#1F2937] leading-relaxed whitespace-pre-wrap space-y-3 font-sans">
                {explanation}
              </div>
            </div>
          )}

          {!explanation && !loading && (
            <div className="bg-[#FFFFFF] rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2 text-[#475569]">
              <p className="text-xs font-medium text-[#1F2937]">
                Ready to analyze legal clauses
              </p>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Paste any contract text on the left or select a sample above to generate a plain-English explanation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
