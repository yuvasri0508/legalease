import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email || 'demo@legalease.io');
        onSuccess(res.user);
      } else {
        const res = await api.signup(name || 'New Member', email || 'member@legalease.io');
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await api.login('jane.doe@legaltech.com');
      onSuccess(res.user);
      onClose();
    } catch (err) {
      onSuccess({
        id: 'user-demo-1',
        name: 'Jane Doe',
        email: 'jane.doe@legaltech.com',
        role: 'Legal Operations Lead',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 pb-2 relative flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1F2937] tracking-tight">
              {mode === 'login' ? 'Sign In to LegalEase' : 'Create Free Account'}
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">
              Access your drafted contracts & saved documents.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-[#475569] hover:text-[#1F2937] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 pt-3 space-y-3.5">
          {/* Quick Demo Sign In */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#F1F5F9] hover:bg-slate-200/80 border border-slate-200 text-[#1F2937] transition-colors group"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#1F2937]">1-Click Demo Sign In</p>
              <p className="text-[10px] text-[#475569]">Sign in as Legal Operations Lead</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#06B6D4] group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="relative flex items-center justify-center py-0.5">
            <div className="border-t border-slate-100 w-full" />
            <span className="bg-white px-2 text-[10px] uppercase tracking-wider text-[#475569] font-medium">
              Or email
            </span>
          </div>

          {error && (
            <div className="p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[#1F2937] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1F2937] mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#67E8F9]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-3 bg-[#06B6D4] hover:bg-[#0891b2] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-xs"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center pt-0.5">
            {mode === 'login' ? (
              <p className="text-[11px] text-[#475569]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-[#06B6D4] hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-[11px] text-[#475569]">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-[#06B6D4] hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
