import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ open, onClose, title, children }) => {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-premium w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-lg font-bold text-secondary dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-secondary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-bg transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};
