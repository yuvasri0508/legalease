export type DocumentType = 
  | 'Rental Agreement'
  | 'NDA'
  | 'Loan Agreement'
  | 'Employment Agreement'
  | 'Affidavit';

export type DocumentStatus = 'Draft' | 'Finalized' | 'Under Review';

export interface StoredDocument {
  id: string;
  userId: string;
  type: DocumentType;
  title: string;
  content: string;
  status: DocumentStatus;
  summary?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'generate' | 'explain' | 'audit';
    label: string;
    payload?: any;
  };
}

export interface AuditIssue {
  severity: 'high' | 'medium' | 'low' | 'safe';
  title: string;
  description: string;
  recommendation: string;
}

export interface AuditResult {
  score: number;
  verdict: string;
  summary: string;
  issues: AuditIssue[];
  missingClauses: string[];
  positiveAspects: string[];
}

export interface DocumentQuestionField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'currency';
  options?: string[];
  helperText?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface DocumentTypeConfig {
  type: DocumentType;
  title: string;
  badge: string;
  description: string;
  iconName: string;
  estimatedTime: string;
  fields: DocumentQuestionField[];
}
