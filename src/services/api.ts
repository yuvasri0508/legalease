import { DocumentType, StoredDocument, AuditResult } from '../types';

export const api = {
  // AI Legal Chat
  async sendChatMessage(message: string, history: { role: string; content: string }[] = []): Promise<string> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });
      if (!res.ok) {
        throw new Error(`Chat error (${res.status})`);
      }
      const data = await res.json();
      return data.reply;
    } catch (err: any) {
      console.warn('Backend chat API failed, using client fallback:', err);
      return `I understand you have a question regarding legal contracts and rights. While reviewing your inquiry:
- **Core Recommendation**: Ensure all critical terms, deadlines, and liabilities are explicitly drafted in writing.
- **Next Step**: You can draft a tailored agreement using our **Smart Document Generator** or paste any contract into **Document Check** for an instant clause audit.
*(LegalEase provides general legal information, not formal attorney legal advice).*`;
    }
  },

  // Smart Document Generator
  async generateDocument(payload: {
    type: DocumentType;
    title?: string;
    jurisdiction?: string;
    answers: Record<string, any>;
  }): Promise<{ content: string; title: string; type: string }> {
    const res = await fetch('/api/generate-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Document generation failed (${res.status})`);
    }
    return res.json();
  },

  // Explain Document (Plain English breakdown)
  async explainDocument(text: string, focusArea?: string): Promise<string> {
    const res = await fetch('/api/explain-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, focusArea }),
    });
    if (!res.ok) {
      throw new Error(`Explain document failed (${res.status})`);
    }
    const data = await res.json();
    return data.explanation;
  },

  // Document Check / Audit
  async checkDocument(text: string, documentType?: string): Promise<AuditResult> {
    const res = await fetch('/api/check-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, documentType }),
    });
    if (!res.ok) {
      throw new Error(`Document audit failed (${res.status})`);
    }
    return res.json();
  },

  // My Documents CRUD
  async getDocuments(): Promise<StoredDocument[]> {
    try {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Fetch documents failed');
      return res.json();
    } catch (err) {
      console.warn('Using local fallback for documents list');
      return [];
    }
  },

  async saveDocument(doc: {
    title: string;
    type: DocumentType;
    content: string;
    status?: 'Draft' | 'Finalized' | 'Under Review';
    summary?: string;
  }): Promise<StoredDocument> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error('Save document failed');
    return res.json();
  },

  async updateDocument(id: string, updates: Partial<StoredDocument>): Promise<StoredDocument> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Update document failed');
    return res.json();
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  },

  // Auth
  async login(email: string): Promise<any> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async signup(name: string, email: string): Promise<any> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    return res.json();
  },
};
