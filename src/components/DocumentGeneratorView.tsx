import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Download,
  Save,
  CheckCircle2,
  FileCheck2,
  BookOpenText,
  Copy,
  Check,
  Edit3,
  Eye,
  Home,
  ShieldCheck,
  DollarSign,
  Briefcase,
  FileSignature,
} from 'lucide-react';
import { DocumentType, StoredDocument } from '../types';
import { DOCUMENT_CONFIGS, QUICK_DEMO_PRESETS } from '../data/documentTemplates';
import { api } from '../services/api';
import { exportDocumentToPdf } from '../utils/pdfGenerator';

interface DocumentGeneratorViewProps {
  initialDocType?: DocumentType;
  onSaveSuccess?: (doc: StoredDocument) => void;
  onAuditDoc?: (text: string, type: DocumentType) => void;
  onExplainDoc?: (text: string) => void;
}

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({
  initialDocType,
  onSaveSuccess,
  onAuditDoc,
  onExplainDoc,
}) => {
  const [selectedType, setSelectedType] = useState<DocumentType>(initialDocType || 'Rental Agreement');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [jurisdiction, setJurisdiction] = useState('State of California, USA');
  const [customTitle, setCustomTitle] = useState('');
  
  // Stages: 'select' | 'questions' | 'generating' | 'review'
  const [stage, setStage] = useState<'select' | 'questions' | 'generating' | 'review'>(
    initialDocType ? 'questions' : 'select'
  );

  const [generatedDoc, setGeneratedDoc] = useState<{
    content: string;
    title: string;
    type: DocumentType;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeConfig = DOCUMENT_CONFIGS.find((c) => c.type === selectedType) || DOCUMENT_CONFIGS[0];

  useEffect(() => {
    if (initialDocType) {
      setSelectedType(initialDocType);
      setStage('questions');
    }
  }, [initialDocType]);

  const handleSelectType = (type: DocumentType) => {
    setSelectedType(type);
    setAnswers({});
    setStage('questions');
  };

  const handleFieldChange = (fieldId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleApplyPreset = () => {
    const preset = QUICK_DEMO_PRESETS[selectedType];
    if (preset) {
      setAnswers(preset);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStage('generating');

    try {
      const result = await api.generateDocument({
        type: selectedType,
        title: customTitle || `${selectedType} – Draft`,
        jurisdiction,
        answers,
      });

      setGeneratedDoc({
        title: result.title,
        content: result.content,
        type: selectedType,
      });
      setEditableContent(result.content);
      setStage('review');
    } catch (err: any) {
      console.error(err);
      setStage('questions');
    }
  };

  const handleSaveDocument = async () => {
    if (!generatedDoc) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const saved = await api.saveDocument({
        title: customTitle || generatedDoc.title,
        type: generatedDoc.type,
        content: editableContent,
        status: 'Draft',
        summary: `${generatedDoc.type} draft generated via LegalEase AI.`,
      });

      setSaveMessage('Saved to My Documents');
      if (onSaveSuccess) onSaveSuccess(saved);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      setSaveMessage('Error saving document.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedDoc) return;
    const titleToUse = customTitle || generatedDoc.title;
    exportDocumentToPdf(titleToUse, editableContent, generatedDoc.type);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDocIcon = (type: DocumentType) => {
    switch (type) {
      case 'Rental Agreement': return Home;
      case 'NDA': return ShieldCheck;
      case 'Loan Agreement': return DollarSign;
      case 'Employment Agreement': return Briefcase;
      case 'Affidavit': return FileSignature;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Top Header & Compact Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2 shrink-0">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[#1F2937] tracking-tight">
            Smart Document Generator
          </h1>
          <p className="text-xs text-[#475569]">
            Answer essential details to draft legally structured covenants.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 text-xs text-[#475569]">
          <span className={stage === 'select' ? 'text-[#06B6D4] font-semibold' : ''}>1. Select</span>
          <span className="text-slate-300">·</span>
          <span className={stage === 'questions' ? 'text-[#06B6D4] font-semibold' : ''}>2. Details</span>
          <span className="text-slate-300">·</span>
          <span className={stage === 'review' ? 'text-[#06B6D4] font-semibold' : ''}>3. Review & PDF</span>
        </div>
      </div>

      {/* STAGE 1: SELECT DOCUMENT TYPE */}
      {stage === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENT_CONFIGS.map((cfg) => {
            const Icon = getDocIcon(cfg.type);
            const isSelected = selectedType === cfg.type;

            return (
              <div
                key={cfg.type}
                onClick={() => handleSelectType(cfg.type)}
                className={`p-5 rounded-xl border transition-all cursor-pointer bg-[#FFFFFF] group flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#06B6D4] ring-1 ring-[#06B6D4] shadow-xs'
                    : 'border-slate-200/80 hover:border-[#67E8F9]'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#1F2937] flex items-center justify-center mb-3 group-hover:bg-[#06B6D4]/10 group-hover:text-[#06B6D4] transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="font-semibold text-[#1F2937] text-sm">
                    {cfg.title}
                  </h3>
                  <p className="text-xs text-[#475569] mt-1.5 leading-relaxed line-clamp-3">
                    {cfg.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-medium text-[#475569] group-hover:text-[#06B6D4]">
                  <span>Configure & draft</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STAGE 2: QUESTIONNAIRE (Optimized 2-column layout to fit screen) */}
      {stage === 'questions' && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStage('select')}
              className="text-xs font-medium text-[#475569] hover:text-[#1F2937] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change document type</span>
            </button>

            <button
              type="button"
              onClick={handleApplyPreset}
              className="text-xs text-[#06B6D4] hover:text-[#0891b2] font-semibold underline underline-offset-2 transition-colors"
            >
              Auto-fill sample data
            </button>
          </div>

          <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1F2937]">{activeConfig.title}</h2>
                <p className="text-[11px] text-[#475569]">
                  Provide the parameters below to assemble your customized contract.
                </p>
              </div>
              <span className="text-[11px] font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded">
                {activeConfig.badge}
              </span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Optional Custom Title & Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-3 border-b border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-[#1F2937] mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={activeConfig.title}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1F2937] mb-1">
                    Governing Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g. State of California"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9]"
                  />
                </div>
              </div>

              {/* Dynamic Questions (2-column grid for space efficiency) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeConfig.fields.map((field) => (
                  <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-[#1F2937]">
                        {field.label} {field.required && <span className="text-[#06B6D4]">*</span>}
                      </label>
                      {field.helperText && (
                        <span className="text-[10px] text-[#475569] truncate max-w-[200px]">{field.helperText}</span>
                      )}
                    </div>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows={2}
                        required={field.required}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9] leading-relaxed font-sans"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9] bg-white"
                      >
                        <option value="">{field.placeholder || 'Select option...'}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        required={field.required}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStage('select')}
                  className="px-3 py-1.5 text-xs font-medium text-[#475569] hover:text-[#1F2937] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891b2] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Generate Document Draft</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAGE 3: GENERATING STATE */}
      {stage === 'generating' && (
        <div className="max-w-md mx-auto py-16 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-[#67E8F9] border-t-[#06B6D4] rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-semibold text-[#1F2937]">Synthesizing {selectedType} Draft...</h3>
          <p className="text-xs text-[#475569] max-w-sm mx-auto leading-relaxed">
            Formulating numbered covenants, statutory definitions, and signature blocks.
          </p>
        </div>
      )}

      {/* STAGE 4: REVIEW & PDF EXPORT */}
      {stage === 'review' && generatedDoc && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-2.5 shadow-xs">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setStage('questions')}
                className="text-xs text-[#475569] hover:text-[#1F2937] flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Adjust details</span>
              </button>

              <span className="text-slate-300">|</span>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-medium text-[#475569] hover:text-[#1F2937] flex items-center gap-1 transition-colors"
              >
                {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Preview Mode' : 'Edit Text'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyText}
                className="text-xs text-[#475569] hover:text-[#1F2937] px-2 py-1 rounded hover:bg-[#F1F5F9] flex items-center gap-1 transition-colors"
                title="Copy all text"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {onExplainDoc && (
                <button
                  onClick={() => onExplainDoc(editableContent)}
                  className="text-xs text-[#475569] hover:text-[#1F2937] px-2 py-1 rounded hover:bg-[#F1F5F9] flex items-center gap-1 transition-colors"
                >
                  <BookOpenText className="w-3 h-3 text-[#06B6D4]" />
                  <span>Explain</span>
                </button>
              )}

              {onAuditDoc && (
                <button
                  onClick={() => onAuditDoc(editableContent, generatedDoc.type)}
                  className="text-xs text-[#475569] hover:text-[#1F2937] px-2 py-1 rounded hover:bg-[#F1F5F9] flex items-center gap-1 transition-colors"
                >
                  <FileCheck2 className="w-3 h-3 text-[#06B6D4]" />
                  <span>Audit</span>
                </button>
              )}

              <button
                onClick={handleSaveDocument}
                disabled={isSaving}
                className="text-xs font-medium text-[#1F2937] px-2.5 py-1 rounded-md border border-slate-200 bg-[#FFFFFF] hover:bg-[#F1F5F9] transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                onClick={handleDownloadPdf}
                className="px-3 py-1 bg-[#06B6D4] hover:bg-[#0891b2] text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="p-2.5 text-xs text-[#1F2937] bg-white border border-slate-200 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* Legal Document Display / Editor Paper with max-height to fit viewport */}
          <div className="legal-paper max-w-4xl mx-auto p-6 sm:p-10 rounded-xl border border-slate-200/90 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {isEditing ? (
              <div>
                <div className="mb-2 text-xs text-[#475569] font-sans">
                  Editable Text Mode
                </div>
                <textarea
                  rows={20}
                  value={editableContent}
                  onChange={(e) => setEditableContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs text-[#1F2937] border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-slate-100 font-sans">
                  <p className="text-[10px] tracking-widest text-[#475569] uppercase font-mono">
                    Legal Document Draft
                  </p>
                  <h2 className="text-xl font-serif font-bold text-[#1F2937] mt-1">
                    {customTitle || generatedDoc.title}
                  </h2>
                  <p className="text-xs text-[#475569] mt-0.5">
                    Governed under the laws of {jurisdiction}
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-[#1F2937] whitespace-pre-wrap leading-relaxed space-y-3 pt-1">
                  {editableContent}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
