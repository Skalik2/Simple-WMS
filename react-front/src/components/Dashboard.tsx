import React from 'react';
import { motion } from 'motion/react';
import { ACTION_CARDS, RECENT_DOCUMENTS } from '../constants';

export const Dashboard = ({ onActionClick }: { onActionClick: (type: string) => void }) => {
  return (
    <div id="dashboard-content" className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Przegląd panelu</h2>
      </header>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {ACTION_CARDS.map((card, idx) => (
          <motion.button
            key={card.id}
            id={`card-${card.id}`}
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onActionClick(card.code)}
            className="group flex flex-col items-start p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:shadow-xl hover:border-primary-fixed-dim transition-all text-left w-full"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
              card.variant === 'primary' 
                ? 'bg-primary-fixed/30 text-primary group-hover:bg-primary-fixed' 
                : 'bg-surface-container-high text-secondary group-hover:bg-surface-variant'
            }`}>
              <card.icon size={24} strokeWidth={2.5} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
              card.variant === 'primary' ? 'text-primary' : 'text-secondary'
            }`}>{card.code}</span>
            <span className="font-bold text-on-surface leading-tight">{card.title}</span>
          </motion.button>
        ))}
      </div>

      {/* Recent Documents Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright/50">
          <h3 className="font-bold text-on-surface">Ostatnie dokumenty</h3>
          <button className="text-xs font-bold text-primary hover:underline uppercase tracking-tighter">
            Zobacz wszystkie
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/60">
              <tr>
                <th className="px-6 py-4">ID Dokumentu</th>
                <th className="px-6 py-4">Typ</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Odpowiedzialny</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high transition-all">
              {RECENT_DOCUMENTS.map((doc, idx) => (
                <motion.tr 
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {doc.responsible.avatar ? (
                        <img 
                          src={doc.responsible.avatar} 
                          alt={doc.responsible.name} 
                          className="w-6 h-6 rounded-full border border-outline-variant"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary-container text-[10px] font-bold text-white flex items-center justify-center">
                          {doc.responsible.initials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-on-surface">{doc.responsible.name}</span>
                    </div>
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
