import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0">
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 print:hidden" /* Ukrywamy przyciemnienie tła na wydruku */
          />
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            /* Modal na wydruku staje się absolutny, bez ramki, bez cienia, na białym tle */
            className={`bg-surface-container-lowest w-full ${sizeClasses[size]} rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] border border-outline-variant 
              print:absolute print:inset-0 print:w-full print:max-w-none print:h-auto print:max-h-none print:border-none print:shadow-none print:bg-white print:rounded-none print:z-[99999] print:overflow-visible`}
          >
            {/* Ukrywamy nagłówek modala z przyciskiem X na wydruku */}
            <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between bg-surface-bright flex-shrink-0 print:hidden">
              <h3 className="font-bold text-lg text-on-surface">{title}</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Usuwamy ograniczenia scrollowania dla wydruku */}
            <div className="p-6 overflow-y-auto print:p-0 print:overflow-visible">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};