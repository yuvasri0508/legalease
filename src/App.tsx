/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { LandingPage } from './components/LandingPage';
import { AIChatView } from './components/AIChatView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { ExplainDocumentView } from './components/ExplainDocumentView';
import { DocumentCheckView } from './components/DocumentCheckView';
import { MyDocumentsView } from './components/MyDocumentsView';
import { AuthModal } from './components/AuthModal';
import { UserProfile, StoredDocument, DocumentType } from './types';
import { api } from './services/api';
import { Scale } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('legalease_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [documents, setDocuments] = useState<StoredDocument[]>([]);

  // Navigation payload states
  const [chatInitialMessage, setChatInitialMessage] = useState<string>('');
  const [generatorDocType, setGeneratorDocType] = useState<DocumentType | undefined>(undefined);
  const [explainInitialText, setExplainInitialText] = useState<string>('');
  const [checkInitialText, setCheckInitialText] = useState<string>('');
  const [checkInitialType, setCheckInitialType] = useState<DocumentType | undefined>(undefined);

  // Load documents on initial mount
  const fetchDocuments = async () => {
    try {
      const docs = await api.getDocuments();
      if (Array.isArray(docs)) {
        setDocuments(docs);
      }
    } catch (err) {
      console.warn('Could not load documents from server:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    try {
      localStorage.setItem('legalease_user', JSON.stringify(loggedUser));
    } catch (e) {
      // ignore
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('legalease_user');
    } catch (e) {
      // ignore
    }
  };

  const handleNavigate = (tab: string, meta?: any) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentTab(tab);

    if (meta) {
      if (meta.initialMessage) {
        setChatInitialMessage(meta.initialMessage);
      }
      if (meta.documentType) {
        setGeneratorDocType(meta.documentType);
      }
      if (meta.prefill) {
        if (tab === 'explain') {
          setExplainInitialText(meta.prefill);
        } else if (tab === 'check') {
          setCheckInitialText(meta.prefill);
        }
      }
    }
  };

  const handleStartGeneratorWithDoc = (type: DocumentType) => {
    setGeneratorDocType(type);
    setCurrentTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToAudit = (text: string, type: DocumentType) => {
    setCheckInitialText(text);
    setCheckInitialType(type);
    setCurrentTab('check');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToExplain = (text: string) => {
    setExplainInitialText(text);
    setCurrentTab('explain');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] text-[#1F2937] font-sans selection:bg-[#67E8F9]/30 selection:text-[#1F2937]">
      {/* Top Quiet Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        documentCount={documents.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            onNavigate={handleNavigate}
            onStartGeneratorWithDoc={handleStartGeneratorWithDoc}
          />
        )}

        {currentTab === 'chat' && (
          <AIChatView
            initialMessage={chatInitialMessage}
            onNavigateToGenerator={(docType) => {
              if (docType) setGeneratorDocType(docType);
              setCurrentTab('generator');
            }}
          />
        )}

        {currentTab === 'generator' && (
          <DocumentGeneratorView
            initialDocType={generatorDocType}
            onSaveSuccess={(newDoc) => {
              setDocuments((prev) => [newDoc, ...prev]);
            }}
            onAuditDoc={handleSendToAudit}
            onExplainDoc={handleSendToExplain}
          />
        )}

        {currentTab === 'explain' && (
          <ExplainDocumentView initialText={explainInitialText} />
        )}

        {currentTab === 'check' && (
          <DocumentCheckView
            initialText={checkInitialText}
            initialType={checkInitialType}
            onSendToGenerator={() => setCurrentTab('generator')}
          />
        )}

        {currentTab === 'my-docs' && (
          <MyDocumentsView
            documents={documents}
            onRefreshDocs={fetchDocuments}
            onNavigateToGenerator={(type) => {
              if (type) setGeneratorDocType(type);
              setCurrentTab('generator');
            }}
            onAuditDoc={handleSendToAudit}
            onExplainDoc={handleSendToExplain}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Compact Efficient Footer */}
      <footer className="bg-[#FFFFFF] border-t border-slate-200 mt-auto shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#1F2937] text-white flex items-center justify-center">
              <Scale className="w-3 h-3 text-[#06B6D4]" />
            </div>
            <span className="font-semibold text-[#1F2937]">LegalEase</span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px]">AI Legal Assistant & Document Suite</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => handleNavigate('home')} className="hover:text-[#06B6D4] transition-colors">
              Overview
            </button>
            <button onClick={() => handleNavigate('chat')} className="hover:text-[#06B6D4] transition-colors">
              AI Chat
            </button>
            <button onClick={() => handleNavigate('generator')} className="hover:text-[#06B6D4] transition-colors">
              Draft
            </button>
            <button onClick={() => handleNavigate('explain')} className="hover:text-[#06B6D4] transition-colors">
              Explain
            </button>
            <button onClick={() => handleNavigate('check')} className="hover:text-[#06B6D4] transition-colors">
              Audit
            </button>
            <button onClick={() => handleNavigate('my-docs')} className="hover:text-[#06B6D4] transition-colors">
              Documents
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} LegalEase. General information only.
          </p>
        </div>
      </footer>
    </div>
  );
}
