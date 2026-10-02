import React, { useState } from 'react';
import {
  Search,
  Download,
  Trash2,
  Edit3,
  FilePlus2,
  X,
  Save,
  CheckCircle2,
  FileCheck2,
  BookOpenText,
  Copy,
  Check,
  FolderOpen,
} from 'lucide-react';
import { StoredDocument, DocumentType, DocumentStatus } from '../types';
import { exportDocumentToPdf } from '../utils/pdfGenerator';
import { api } from '../services/api';

interface MyDocumentsViewProps {
  documents: StoredDocument[];
  onRefreshDocs: () => void;
  onNavigateToGenerator: (type?: DocumentType) => void;
  onAuditDoc?: (text: string, type: DocumentType) => void;
  onExplainDoc?: (text: string) => void;
}

export const MyDocumentsView: React.FC<MyDocumentsViewProps> = ({
  documents,
  onRefreshDocs,
  onNavigateToGenerator,
  onAuditDoc,
  onExplainDoc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [viewingDoc, setViewingDoc] = useState<StoredDocument | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedStatus, setEditedStatus] = useState<DocumentStatus>('Draft');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filterOptions = [
    'All',
    'Rental Agreement',
    'NDA',
    'Loan Agreement',
    'Employment Agreement',
    'Affidavit',
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = selectedTypeFilter === 'All' || doc.type === selectedTypeFilter;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenDoc = (doc: StoredDocument, editMode = false) => {
    setViewingDoc(doc);
    setEditedTitle(doc.title);
    setEditedContent(doc.content);
    setEditedStatus(doc.status);
    setIsEditing(editMode);
    setFeedbackMsg(null);
  };

  const handleSaveEdit = async () => {
    if (!viewingDoc) return;
    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const updated = await api.updateDocument(viewingDoc.id, {
        title: editedTitle,
        content: editedContent,
        status: editedStatus,
      });

      setViewingDoc(updated);
      setIsEditing(false);
      setFeedbackMsg('Document updated.');
      onRefreshDocs();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg('Failed to update document.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this document?')) {
      return;
    }

    try {
      await api.deleteDocument(id);
      if (viewingDoc && viewingDoc.id === id) {
        setViewingDoc(null);
      }
      onRefreshDocs();
    } catch (err: any) {
      console.error('Delete error:', err);
    }
  };

  const handleDownloadPdf = (doc: StoredDocument, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    exportDocumentToPdf(doc.title, doc.content, doc.type);
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header & Controls in One Balanced Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1F2937] text-white flex items-center justify-center">
            <FolderOpen className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[#1F2937] tracking-tight">
              My Documents
            </h1>
            <p className="text-xs text-[#475569]">
              {documents.length} document{documents.length === 1 ? '' : 's'} saved
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#475569] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FFFFFF] border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] w-48 sm:w-56"
            />
          </div>

          {/* New Doc Button */}
          <button
            onClick={() => onNavigateToGenerator()}
            className="px-3 py-1.5 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {filterOptions.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedTypeFilter(type)}
            className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors text-xs ${
              selectedTypeFilter === type
                ? 'bg-[#1F2937] text-white font-medium'
                : 'bg-[#FFFFFF] border border-slate-200/80 text-[#475569] hover:text-[#1F2937] hover:bg-[#F1F5F9]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 p-12 text-center space-y-3 shadow-xs">
          <h3 className="font-semibold text-[#1F2937] text-sm">No documents found</h3>
          <p className="text-xs text-[#475569] max-w-sm mx-auto">
            {searchTerm || selectedTypeFilter !== 'All'
              ? 'Try adjusting your search query or type filter.'
              : 'Draft your first legal agreement with our generator.'}
          </p>
          <button
            onClick={() => onNavigateToGenerator()}
            className="px-3.5 py-1.5 bg-[#06B6D4] text-white text-xs font-semibold rounded-lg hover:bg-[#0891b2] transition-colors"
          >
            Start a Draft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const dateStr = new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const wordCount = doc.content.split(/\s+/).filter(Boolean).length;

            return (
              <div
                key={doc.id}
                onClick={() => handleOpenDoc(doc)}
                className="bg-[#FFFFFF] rounded-xl border border-slate-200/90 hover:border-[#06B6D4] p-4 transition-all cursor-pointer flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#475569] mb-1.5">
                    <span className="font-medium text-[#06B6D4]">{doc.type}</span>
                    <span className="font-semibold text-[#1F2937] bg-[#F1F5F9] px-2 py-0.5 rounded text-[10px]">
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#1F2937] text-xs sm:text-sm group-hover:text-[#06B6D4] transition-colors line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-[#475569] mt-1.5 line-clamp-2 leading-relaxed">
                    {doc.summary || doc.content.substring(0, 110)}...
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#475569]">
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span>{dateStr}</span>
                    <span className="text-slate-300">·</span>
                    <span>{wordCount}w</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDoc(doc, true);
                      }}
                      className="text-[#475569] hover:text-[#1F2937] p-1 rounded hover:bg-[#F1F5F9]"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDownloadPdf(doc, e)}
                      className="text-[#06B6D4] hover:text-[#0891b2] p-1 rounded hover:bg-[#06B6D4]/10"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="text-[#475569] hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View / Edit Modal (Optimized to fit screen with internal scroll) */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex-1 pr-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-sm font-semibold text-[#1F2937] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[#06B6D4] w-full"
                  />
                ) : (
                  <h2 className="text-sm font-semibold text-[#1F2937]">{viewingDoc.title}</h2>
                )}
                <div className="flex items-center gap-2 text-[11px] text-[#475569] mt-0.5">
                  <span className="text-[#06B6D4] font-medium">{viewingDoc.type}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Status:{' '}
                    {isEditing ? (
                      <select
                        value={editedStatus}
                        onChange={(e) => setEditedStatus(e.target.value as DocumentStatus)}
                        className="text-xs border border-slate-200 rounded px-1.5 py-0.5 ml-1"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Finalized">Finalized</option>
                      </select>
                    ) : (
                      <span className="text-[#1F2937] font-semibold">{viewingDoc.status}</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-2.5 py-1 text-xs font-medium text-[#475569] border border-slate-200 rounded hover:bg-[#F1F5F9] transition-colors"
                >
                  {isEditing ? 'Preview' : 'Edit Text'}
                </button>

                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1 rounded text-[#475569] hover:text-[#1F2937]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Action Subbar */}
            <div className="px-5 py-2.5 bg-[#F1F5F9]/60 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyText(editedContent)}
                  className="text-[#475569] hover:text-[#1F2937] flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>

                {onAuditDoc && (
                  <button
                    onClick={() => {
                      setViewingDoc(null);
                      onAuditDoc(editedContent, viewingDoc.type);
                    }}
                    className="text-[#475569] hover:text-[#06B6D4] flex items-center gap-1 transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Run Audit</span>
                  </button>
                )}

                {onExplainDoc && (
                  <button
                    onClick={() => {
                      setViewingDoc(null);
                      onExplainDoc(editedContent);
                    }}
                    className="text-[#475569] hover:text-[#06B6D4] flex items-center gap-1 transition-colors"
                  >
                    <BookOpenText className="w-3.5 h-3.5" />
                    <span>Explain Clauses</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-3 py-1 bg-[#1F2937] text-white rounded text-xs font-medium hover:bg-slate-900 flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadPdf(viewingDoc)}
                  className="px-3 py-1 bg-[#06B6D4] hover:bg-[#0891b2] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {feedbackMsg && (
              <div className="px-5 py-1.5 text-xs bg-[#F1F5F9] text-[#1F2937] flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {/* Document Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F1F5F9]/30">
              {isEditing ? (
                <textarea
                  rows={20}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full p-3 font-mono text-xs text-[#1F2937] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] leading-relaxed"
                />
              ) : (
                <div className="legal-paper max-w-3xl mx-auto p-8 sm:p-10 rounded-xl border border-slate-200/90">
                  <div className="text-xs sm:text-sm text-[#1F2937] whitespace-pre-wrap leading-relaxed space-y-3">
                    {editedContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
