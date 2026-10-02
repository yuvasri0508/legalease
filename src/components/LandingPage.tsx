import React, { useState } from 'react';
import {
  ArrowRight,
  Search,
  Home,
  ShieldCheck,
  DollarSign,
  Briefcase,
  FileSignature,
  MessageSquare,
  FileText,
  FileCheck2,
  BookOpenText,
  Download,
  Check,
} from 'lucide-react';
import { DocumentType } from '../types';

interface LandingPageProps {
  onNavigate: (tab: string, meta?: any) => void;
  onStartGeneratorWithDoc?: (type: DocumentType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onStartGeneratorWithDoc,
}) => {
  const [askInput, setAskInput] = useState('');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;

    const lower = askInput.toLowerCase();
    if (lower.includes('rent') || lower.includes('lease')) {
      onNavigate('generator', { documentType: 'Rental Agreement' });
    } else if (lower.includes('nda') || lower.includes('confidential')) {
      onNavigate('generator', { documentType: 'NDA' });
    } else if (lower.includes('loan') || lower.includes('borrow')) {
      onNavigate('generator', { documentType: 'Loan Agreement' });
    } else if (lower.includes('employ') || lower.includes('job') || lower.includes('hire')) {
      onNavigate('generator', { documentType: 'Employment Agreement' });
    } else if (lower.includes('affidavit') || lower.includes('sworn')) {
      onNavigate('generator', { documentType: 'Affidavit' });
    } else if (lower.includes('explain') || lower.includes('mean')) {
      onNavigate('explain', { prefill: askInput });
    } else if (lower.includes('check') || lower.includes('audit') || lower.includes('review')) {
      onNavigate('check', { prefill: askInput });
    } else {
      onNavigate('chat', { initialMessage: askInput });
    }
  };

  const samplePrompts = [
    'Can landlord increase rent without notice?',
    'Draft mutual NDA for tech partnership',
    'Essential clauses in personal loan',
    'Explain early termination penalties',
  ];

  const documentTypesList: {
    type: DocumentType;
    title: string;
    icon: any;
    desc: string;
  }[] = [
    {
      type: 'Rental Agreement',
      title: 'Rental Agreement',
      icon: Home,
      desc: 'Residential lease covering terms, rent, deposits & utilities.',
    },
    {
      type: 'NDA',
      title: 'Non-Disclosure',
      icon: ShieldCheck,
      desc: 'Mutual or unilateral confidentiality for business secrets.',
    },
    {
      type: 'Loan Agreement',
      title: 'Loan Agreement',
      icon: DollarSign,
      desc: 'Promissory note with APR, repayment plan & default remedies.',
    },
    {
      type: 'Employment Agreement',
      title: 'Employment Contract',
      icon: Briefcase,
      desc: 'Executive terms, compensation, at-will status & IP assignment.',
    },
    {
      type: 'Affidavit',
      title: 'General Affidavit',
      icon: FileSignature,
      desc: 'Sworn statements under oath with certified notary block.',
    },
  ];

  const coreCapabilities = [
    {
      id: 'chat',
      title: 'AI Legal Chat',
      desc: 'Plain-English legal answers to contractual & rights questions.',
      icon: MessageSquare,
    },
    {
      id: 'generator',
      title: 'Smart Generator',
      desc: 'Adaptive questionnaire drafting comprehensive contracts.',
      icon: FileText,
    },
    {
      id: 'explain',
      title: 'Explain Document',
      desc: 'Demystify complex legalese & uncover hidden liabilities.',
      icon: BookOpenText,
    },
    {
      id: 'check',
      title: 'Document Check',
      desc: 'Audit drafts for missing standard clauses & ambiguous wording.',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Compact Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-2 pb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] border border-[#F1F5F9] text-[11px] font-medium text-[#475569] mb-3 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
          <span>AI Legal Assistant & Smart Document Suite</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1F2937] tracking-tight leading-tight max-w-3xl mx-auto">
          Legal documents, drafted and understood in minutes.
        </h1>

        <p className="mt-2.5 text-xs sm:text-sm text-[#475569] max-w-xl mx-auto leading-relaxed">
          Create customized legal contracts, translate complex legalese into plain English, and audit agreements for missing terms.
        </p>

        {/* Central Search Bar */}
        <div className="mt-5 max-w-2xl mx-auto">
          <form
            onSubmit={handleHeroSubmit}
            className="flex items-center bg-[#FFFFFF] rounded-xl shadow-xs border border-slate-200/90 p-1.5 focus-within:border-[#06B6D4] focus-within:ring-2 focus-within:ring-[#67E8F9]/30 transition-all"
          >
            <div className="pl-3 text-[#475569]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder="Ask a legal question or enter a document type to draft..."
              className="w-full px-3 py-2 text-xs sm:text-sm text-[#1F2937] placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <span>Ask LegalEase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-2.5 text-[11px] text-[#475569]">
            <span className="text-slate-400">Try asking:</span>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setAskInput(prompt);
                  onNavigate('chat', { initialMessage: prompt });
                }}
                className="hover:text-[#06B6D4] transition-colors"
              >
                "{prompt}"{i < samplePrompts.length - 1 && <span className="ml-2 text-slate-300" aria-hidden="true">·</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Supported Document Types - Compact 5-column row on desktop */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-[#1F2937] tracking-tight">
            Supported Document Types
          </h2>
          <button
            onClick={() => onNavigate('generator')}
            className="text-xs font-semibold text-[#06B6D4] hover:text-[#0891b2] flex items-center gap-1 transition-colors"
          >
            <span>Start Generator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {documentTypesList.map((doc) => {
            const Icon = doc.icon;
            return (
              <div
                key={doc.type}
                onClick={() => {
                  if (onStartGeneratorWithDoc) {
                    onStartGeneratorWithDoc(doc.type);
                  } else {
                    onNavigate('generator', { documentType: doc.type });
                  }
                }}
                className="bg-[#FFFFFF] rounded-xl p-4 border border-slate-200/80 hover:border-[#06B6D4] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#1F2937] flex items-center justify-center mb-3 group-hover:bg-[#06B6D4]/10 group-hover:text-[#06B6D4] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] text-xs sm:text-sm">
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-1 leading-normal line-clamp-2">
                    {doc.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] font-medium text-[#475569] group-hover:text-[#06B6D4]">
                  <span>Draft now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Core Capabilities - 4 Compact Columns */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-semibold text-[#1F2937] tracking-tight">
            Key Capabilities
          </h2>
          <span className="text-xs text-[#475569]">All-in-one legal suite</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {coreCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.id}
                onClick={() => onNavigate(cap.id)}
                className="bg-[#FFFFFF] rounded-xl p-4 border border-slate-200/80 hover:border-[#06B6D4] hover:shadow-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-md bg-[#F1F5F9] text-[#1F2937] group-hover:bg-[#06B6D4]/10 group-hover:text-[#06B6D4] flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-[#1F2937] text-xs sm:text-sm">
                    {cap.title}
                  </h3>
                </div>
                <p className="text-[11px] text-[#475569] leading-relaxed line-clamp-2">
                  {cap.desc}
                </p>
                <div className="mt-3 text-[11px] font-medium text-[#06B6D4] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open tool</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Compact PDF & Document Library Feature Banner */}
      <section className="bg-[#FFFFFF] border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs font-semibold text-[#06B6D4]">
            <Download className="w-3.5 h-3.5" />
            <span>Instant PDF Export</span>
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-[#1F2937]">
            Court & notary formatted legal documents ready for signing.
          </h3>
          <p className="text-xs text-[#475569] leading-relaxed">
            All generated contracts feature standard legal margins, numbered covenants, and party signature blocks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('my-docs')}
            className="px-3.5 py-2 bg-[#F1F5F9] hover:bg-slate-200 text-[#1F2937] rounded-lg text-xs font-medium transition-colors"
          >
            My Documents
          </button>
          <button
            onClick={() => onNavigate('generator')}
            className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Draft Contract</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
