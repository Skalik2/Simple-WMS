import React, { useEffect, useState } from 'react';
import { Package, Users, FileText, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface RecentDocument {
  id: number;
  document_number?: string; // Jeśli masz logikę numeracji, lub użyj ID
  type: string;
  contractor_name: string;
  created_at: string;
}

export const Dashboard = () => {
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [stats, setStats] = useState({ products: 0, contractors: 0, documents: 0 });

  useEffect(() => {
    // Pobieranie dokumentów do tabeli
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => setRecentDocs(data.slice(0, 5))); // Tylko 5 ostatnich

    // Pobieranie statystyk (uproszczone pobranie długości list)
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/contractors').then(res => res.json()),
      fetch('/api/documents').then(res => res.json())
    ]).then(([p, c, d]) => {
      setStats({ products: p.length, contractors: c.length, documents: d.length });
    });
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <h2 className="text-3xl font-bold text-on-surface mb-8 tracking-tight">Dashboard</h2>
      
      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard title="Produkty" value={stats.products} icon={<Package />} color="bg-primary" />
        <StatCard title="Kontrahenci" value={stats.contractors} icon={<Users />} color="bg-secondary" />
        <StatCard title="Dokumenty" value={stats.documents} icon={<FileText />} color="bg-tertiary" />
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
                <tr key={doc.id} className="hover:bg-surface-bright transition-colors">
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 text-xs font-bold ${doc.type === 'PZ' ? 'text-green-600' : 'text-blue-600'}`}>
                      {doc.type === 'PZ' ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">#{doc.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{doc.contractor_name || 'Brak'}</td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant">
                    {new Date(doc.created_at).toLocaleString('pl-PL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-5">
    <div className={`p-4 rounded-xl text-white ${color}`}>{icon}</div>
    <div>
      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-on-surface">{value}</p>
    </div>
  </div>
);