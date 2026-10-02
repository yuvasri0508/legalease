import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  FileCheck2,
  PlusCircle,
} from 'lucide-react';
import { AuditResult, DocumentType } from '../types';
import { api } from '../services/api';

interface DocumentCheckViewProps {
  initialText?: string;
  initialType?: DocumentType;
  onSendToGenerator?: () => void;
}

export const DocumentCheckView: React.FC<DocumentCheckViewProps> = ({
  initialText,
  initialType,
  onSendToGenerator,
}) => {
  const [docText, setDocText] = useState(initialText || '');
  const [docType, setDocType] = useState<string>(initialType || 'Rental Agreement');
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    if (initialText && initialText.trim().length > 0) {
      handleRunAudit(initialText);
    }
  }, [initialText]);

  const handleRunAudit = async (textToAudit?: string) => {
    const text = (textToAudit || docText).trim();
    if (!text || loading) return;

    setLoading(true);
    setAuditResult(null);

    try {
      const result = await api.checkDocument(text, docType);
      setAuditResult(result);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    const sample = `COMMERCIAL CONTRACT DRAFT

1. PARTIES:
Supplier agrees to provide cloud infrastructure services to Buyer.

2. PAYMENT:
Buyer shall pay $5,000 monthly promptly. Late payments may result in suspension.

3. TERM:
This contract is effective immediately and continues until either party decides to terminate.

4. CONFIDENTIALITY:
Both parties shall keep information secret.

5. SIGNATURES:
Supplier Representative: _______________   Date: ________
Buyer Representative: _______________      Date: ________`;

    setDocText(sample);
    handleRunAudit(sample);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">High Risk</span>;
      case 'medium':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Notice</span>;
      case 'low':
        return <span className="text-[11px] font-semibold text-[#475569] bg-slate-100 px-2 py-0.5 rounded">Advisory</span>;
      default:
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Compliant</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F2937] text-white flex items-center justify-center">
            <FileCheck2 className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1F2937] tracking-tight">
              Document Audit & Health Check
            </h1>
            <p className="text-xs text-[#475569]">
              Scan drafts for missing essential provisions and vague terminology.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="text-xs text-[#06B6D4] hover:text-[#0891b2] font-medium transition-colors"
        >
          Load flawed sample draft
        </button>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Input (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#1F2937]">
              Document Text to Audit
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="text-xs bg-[#F1F5F9] border border-slate-200 rounded px-2 py-1 text-[#1F2937] focus:outline-none"
            >
              <option value="Rental Agreement">Rental Agreement</option>
              <option value="NDA">NDA</option>
              <option value="Loan Agreement">Loan Agreement</option>
              <option value="Employment Agreement">Employment</option>
              <option value="Affidavit">Affidavit</option>
              <option value="General Commercial Contract">Commercial</option>
            </select>
          </div>

          <textarea
            rows={8}
            value={docText}
            onChange={(e) => setDocText(e.target.value)}
            placeholder="Paste your legal document draft here to run a complete clause audit..."
            className="w-full p-3 text-xs text-[#1F2937] border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9] font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#475569] font-mono">
              {docText ? `${docText.split(/\s+/).filter(Boolean).length} words` : '0 words'}
            </span>

            <div className="flex items-center gap-2">
              {docText && (
                <button
                  type="button"
                  onClick={() => {
                    setDocText('');
                    setAuditResult(null);
                  }}
                  className="text-xs text-[#475569] hover:text-[#1F2937] px-2 py-1 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => handleRunAudit()}
                disabled={!docText.trim() || loading}
                className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891b2] disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>{loading ? 'Auditing...' : 'Run Audit'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Results (7 cols) */}
        <div className="lg:col-span-7">
          {loading && (
            <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-8 text-center space-y-2.5 shadow-xs">
              <div className="w-6 h-6 border-2 border-[#67E8F9] border-t-[#06B6D4] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#475569]">Checking covenants, notice mechanisms, and boilerplate...</p>
            </div>
          )}

          {auditResult && !loading && (
            <div className="space-y-3.5 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
              {/* Score Card */}
              <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-4 flex items-center justify-between gap-4 shadow-xs">
                <div>
                  <h2 className="text-sm font-semibold text-[#1F2937]">{auditResult.verdict}</h2>
                  <p className="text-xs text-[#475569] mt-0.5 leading-normal">
                    {auditResult.summary}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center p-2.5 bg-[#F1F5F9] rounded-lg min-w-[70px] shrink-0">
                  <span className="text-2xl font-bold font-mono text-[#06B6D4]">
                    {auditResult.score}
                  </span>
                  <span className="text-[9px] text-[#475569] font-medium uppercase">
                    Health
                  </span>
                </div>
              </div>

              {/* Missing Clauses */}
              {auditResult.missingClauses && auditResult.missingClauses.length > 0 && (
                <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2">
                  <h3 className="text-xs font-semibold text-[#1F2937]">
                    Missing Standard Provisions ({auditResult.missingClauses.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {auditResult.missingClauses.map((clause, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#F1F5F9] rounded-md text-[11px] font-medium text-[#1F2937] flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3 h-3 text-[#06B6D4] shrink-0" />
                        <span className="truncate">{clause}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clause Observations */}
              {auditResult.issues && auditResult.issues.length > 0 && (
                <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
                  <h3 className="text-xs font-semibold text-[#1F2937]">
                    Clause Observations ({auditResult.issues.length})
                  </h3>
                  <div className="space-y-2">
                    {auditResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[#F1F5F9]/60 border border-slate-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-xs text-[#1F2937]">{issue.title}</h4>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-[11px] text-[#475569] leading-relaxed">
                          {issue.description}
                        </p>
                        <div className="text-[11px] text-[#1F2937] pt-0.5">
                          <span className="font-semibold text-[#06B6D4]">Action: </span>
                          {issue.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {onSendToGenerator && (
                <button
                  onClick={onSendToGenerator}
                  className="w-full py-2 bg-[#1F2937] hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Draft Complete New Version in Generator</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {!auditResult && !loading && (
            <div className="bg-[#FFFFFF] rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2 text-[#475569]">
              <p className="text-xs font-medium text-[#1F2937]">
                Ready for contract verification
              </p>
              <p className="text-xs max-w-sm mx-auto text-slate-400">
                Paste contract text on the left to verify completeness and identify missing clauses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
