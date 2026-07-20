import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface VerifySearchWidgetProps {
  variant?: 'compact' | 'large';
  placeholder?: string;
}

export const VerifySearchWidget: React.FC<VerifySearchWidgetProps> = ({
  variant = 'compact',
  placeholder = 'Certificate ID (12 characters)',
}) => {
  const [id, setId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      navigate(`/verify/${encodeURIComponent(id.trim().toUpperCase())}`);
      setIsSearching(false);
    }, 400);
  };

  return (
    <div className={`w-full ${variant === 'large' ? 'max-w-2xl' : 'max-w-lg'}`}>
      <form onSubmit={handleSearch} className="relative group">
        <div
          className={`
          relative flex items-center overflow-hidden rounded border bg-white transition-all duration-300
          ${variant === 'large' ? 'h-14 border-slate-200 md:h-16' : 'h-14 border-slate-200'}
          group-focus-within:border-primary group-focus-within:ring-2 group-focus-within:ring-primary/15
        `}
        >
          <div
            className={`flex items-center justify-center ${variant === 'large' ? 'w-16 md:w-18' : 'w-14'} text-primary/40 group-focus-within:text-primary transition-colors`}
          >
            {isSearching ? (
              <Loader2
                className="animate-spin"
                size={variant === 'large' ? 24 : 20}
              />
            ) : (
              <Search size={variant === 'large' ? 24 : 20} />
            )}
          </div>

          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={isSearching}
            placeholder={placeholder}
            className={`
              flex-1 border-none bg-transparent font-medium text-slate-900 outline-none
              ${variant === 'large' ? 'text-base placeholder:text-slate-400 md:text-lg' : 'text-base placeholder:text-slate-400'}
            `}
          />

          <button
            type="submit"
            disabled={isSearching || !id.trim()}
            className={`
              flex h-full items-center justify-center gap-2 font-semibold transition-all
              ${variant === 'large' ? 'px-6 text-sm md:px-8 md:text-base' : 'px-5 text-sm'}
              ${id.trim() ? 'bg-primary text-white hover:bg-primary/90' : 'cursor-not-allowed border-l border-slate-200 bg-slate-50 text-slate-400'}
            `}
          >
            <span
              className={variant === 'large' ? 'hidden md:inline' : 'hidden'}
            >
              Verify
            </span>
            <ArrowRight size={variant === 'large' ? 18 : 16} />
          </button>
        </div>

        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute -bottom-9 left-0 right-0 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
                <ShieldCheck size={15} aria-hidden="true" />
                <span>Looking up credential…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
