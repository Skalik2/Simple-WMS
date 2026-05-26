import React, { useEffect, useState } from 'react';
import { Package, Users, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { ACTION_CARDS } from '../constants';
import { DocumentDetailsModal } from './DocumentDetailsModal';
import { Document } from '../types';

interface DashboardProps {
  onActionClick?: (type: string) => void;
}

export const Dashboard = ({ onActionClick }: DashboardProps) => {
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [stats, setStats] = useState({ products: 0, contractors: 0, documents: 0 });
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/documents?page_size=5')
      .then(res => res.json())
      .then(data => setRecentDocs(data.items || []));

    Promise.all([
      fetch('/api/products?page_size=1').then(res => res.json()),
      fetch('/api/contractors?page_size=1').then(res => res.json()),
      fetch('/api/documents?page_size=1').then(res => res.json())
    ]).then(([p, c, d]) => {
      setStats({ 
        products: p.total || 0, 
        contractors: c.total || 0, 
        documents: d.total || 0 
      });
    });
  }, []);

  const handleDocClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-on-surface mb-8 tracking-tight">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Produkty" value={stats.products} icon={<Package size={24} />} color="bg-primary" />
        <StatCard title="Kontrahenci" value={stats.contractors} icon={<Users size={24} />} color="bg-secondary" />
        <StatCard title="Dokumenty" value={stats.documents} icon={<FileText size={24} />} color="bg-tertiary" />
      </div>

      {/* Szybkie akcje */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Szybkie akcje</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACTION_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => onActionClick?.(card.code)}
              className="flex flex-col items-center gap-3 p-6 bg-surface-container-lowest border border-outline-variant rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group text-center"
            >
              <div className={`p-4 rounded-xl ${
                card.variant === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
              } group-hover:scale-110 transition-transform`}>
                <card.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-primary mb-1">{card.code}</p>
                <p className="text-sm font-medium text-on-surface leading-tight">{card.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabela ostatnich dokumentów */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant">
          <h3 className="font-bold text-on-surface">Ostatnie dokumenty</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4">Typ</th>
                <th className="px-6 py-4">Numer/ID</th>
                <th className="px-6 py-4">Kontrahent</th>
                <th className="px-6 py-4">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high">
              {recentDocs.map((doc, idx) => (
                <tr 
                  key={doc.id} 
                  onClick={() => handleDocClick(doc)}
                  className="hover:bg-surface-bright transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-xs font-bold ${
                      (doc.type === 'PZ' || doc.type === 'ZW') ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {(doc.type === 'PZ' || doc.type === 'ZW') ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">#{doc.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{doc.contractor_name || 'Wewnętrzny'}</td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">
                    {new Date(doc.created_at).toLocaleString('pl-PL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DocumentDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        document={selectedDoc}
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-5">
    <div className={`p-4 rounded-xl text-white ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-on-surface">{value}</p>
    </div>
  </div>
);