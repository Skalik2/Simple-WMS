import React from 'react';
import { motion } from 'motion/react';
import { RECENT_DOCUMENTS } from '../constants';
import { Filter, Download, Plus } from 'lucide-react';

export const Documents = ({ onNewClick }: { onNewClick: () => void }) => {
  return (
    <div id="documents-content" className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Dokumenty</h2>
          <p className="text-on-surface-variant">Przeglądaj i filtruj wszystkie dokumenty magazynowe.</p>
        </div>
        <button 
          onClick={onNewClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Nowy dokument</span>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="flex-1 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
          <input 
            type="text" 
            placeholder="Filtruj po ID, typie lub statusie..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="p-2 bg-surface-container-lowest border border-outline-variant rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-all">
          <Download size={20} />
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/60">
              <tr>
                <th className="px-6 py-4">ID Dokumentu</th>
                <th className="px-6 py-4">Typ</th>
                <th className="px-6 py-4">Data Wystawienia</th>
                <th className="px-6 py-4">Odpowiedzialny</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high transition-all">
              {RECENT_DOCUMENTS.map((doc, idx) => (
                <motion.tr 
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-bright transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                    {doc.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      doc.type === 'PZ' || doc.type === 'WZ' 
                        ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                        : 'bg-surface-container-high text-on-surface'
                    }`}>
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {doc.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {doc.responsible.name}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
