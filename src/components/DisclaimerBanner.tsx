import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside aria-label="Legal Notice" className="bg-[#FFFFFF] border-b border-[#F1F5F9] px-4 py-1.5 text-[11px] text-[#475569] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
          <p className="leading-tight">
            <span className="font-semibold text-[#1F2937]">Notice:</span> LegalEase provides general legal information and draft assistance, not formal attorney legal representation.
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-[#475569] hover:text-[#1F2937] p-0.5 rounded transition-colors shrink-0"
          aria-label="Dismiss notice"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
