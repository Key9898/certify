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
  placeholder = 'Enter Certificate ID (e.g., CERT-12345)',
}) => {
  const [id, setId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;

    setIsSearching(true);
    // Visual delay to feel like a "verification process"
    setTimeout(() => {
      navigate(`/verify/${encodeURIComponent(id.trim().toUpperCase())}`);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className={`w-full ${variant === 'large' ? 'max-w-2xl' : 'max-w-lg'}`}>
      <form onSubmit={handleSearch} className="relative group">
        <div
          className={`
          relative flex items-center transition-all duration-300
          bg-white border-2 rounded shadow-xl overflow-hidden
          ${variant === 'large' ? 'h-16 md:h-20 border-primary/20' : 'h-14 border-base-200'}
          group-focus-within:border-primary group-focus-within:ring-4 group-focus-within:ring-primary/10
        `}
        >
          <div
            className={`flex items-center justify-center ${variant === 'large' ? 'w-16 md:w-20' : 'w-14'} text-primary/40 group-focus-within:text-primary transition-colors`}
          >
            {isSearching ? (
              <Loader2
                className="animate-spin"
                size={variant === 'large' ? 28 : 20}
              />
            ) : (
              <Search size={variant === 'large' ? 28 : 20} />
            )}
          </div>

          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={isSearching}
            placeholder={placeholder}
            className={`
              flex-1 bg-transparent border-none outline-none font-medium text-base-content
              ${variant === 'large' ? 'text-lg md:text-xl placeholder:text-base-content/30' : 'text-base placeholder:text-base-content/40'}
            `}
          />

          <button
            type="submit"
            disabled={isSearching || !id.trim()}
            className={`
              h-full flex items-center justify-center gap-2 font-black uppercase tracking-wider transition-all
              ${variant === 'large' ? 'px-8 md:px-12 text-lg' : 'px-6 text-sm'}
              ${id.trim() ? 'bg-primary text-white hover:bg-primary/90' : 'bg-base-200 text-base-content/30 cursor-not-allowed'}
            `}
          >
            <span
              className={variant === 'large' ? 'hidden md:inline' : 'hidden'}
            >
              Verify
            </span>
            <ArrowRight size={variant === 'large' ? 20 : 16} />
          </button>
        </div>

        {/* Verification Loading Overlay */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-10 left-0 right-0 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                <ShieldCheck size={16} />
                <span>Scanning global authentication registry...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
