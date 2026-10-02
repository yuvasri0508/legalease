import React, { useState } from 'react';
import {
  Scale,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, meta?: any) => void;
  user: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  documentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  documentCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview' },
    { id: 'chat', label: 'AI Chat' },
    { id: 'generator', label: 'Draft Document' },
    { id: 'explain', label: 'Explain' },
    { id: 'check', label: 'Audit' },
    { id: 'my-docs', label: 'My Documents', count: documentCount },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#F1F5F9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 cursor-pointer text-left focus:outline-none"
          >
            <div className="w-7 h-7 rounded-md bg-[#1F2937] flex items-center justify-center text-white shadow-xs">
              <Scale className="w-4 h-4 text-[#06B6D4]" />
            </div>
            <span className="font-bold text-base tracking-tight text-[#1F2937]">
              Legal<span className="text-[#06B6D4]">Ease</span>
            </span>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-[#1F2937] font-semibold'
                      : 'text-[#475569] hover:text-[#1F2937]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1 text-[11px] text-[#06B6D4] font-semibold">
                      ({item.count})
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-[#06B6D4] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-[#F1F5F9] bg-[#FFFFFF] hover:bg-[#F1F5F9] text-[#1F2937] text-xs font-medium transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#06B6D4]/15 text-[#06B6D4] flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[110px] truncate">{user.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#475569]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-75">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-[#1F2937]">{user.name}</p>
                      <p className="text-[10px] text-[#475569] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleNav('my-docs');
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1F2937] flex items-center justify-between"
                    >
                      <span>Saved Documents</span>
                      <span className="text-[#06B6D4] font-mono text-[10px]">({documentCount})</span>
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 py-1 text-xs font-medium text-[#475569] hover:text-[#1F2937] transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1 text-xs font-medium text-white bg-[#06B6D4] hover:bg-[#0891b2] rounded-md transition-colors shadow-xs"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-[#475569] hover:text-[#1F2937]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs transition-colors ${
                  isActive ? 'bg-[#F1F5F9] font-semibold text-[#1F2937]' : 'text-[#475569] hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-xs text-[#06B6D4]">({item.count})</span>
                )}
              </button>
            );
          })}

          <div className="border-t border-slate-100 pt-2 mt-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-rose-600"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-1.5 text-xs font-medium border border-slate-200 rounded-md text-[#475569]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="py-1.5 text-xs font-medium bg-[#06B6D4] text-white rounded-md"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
