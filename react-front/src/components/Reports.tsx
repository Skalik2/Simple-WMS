import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Box, ClipboardList, Database } from 'lucide-react';

interface ReportData {
  chart_data: {
    name: string;
    pz: number;
    wz: number;
  }[];
  cards: {
    total_ops: number;
    top_product: string;
    total_stock: number;
  };
}

export const Reports = () => {
  const [selectedRange, setSelectedRange] = useState('7d');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (range: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/stats?range=${range}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania raportów:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(selectedRange);
  }, [selectedRange]);

  return (
    <div id="reports-content" className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Analityka i Raporty</h2>
          <p className="text-on-surface-variant">Śledź wydajność magazynu w czasie rzeczywistym.</p>
        </div>
        
        <div className="flex bg-surface-container-high p-1 rounded-xl border border-outline-variant">
          {[
            { id: '7d', label: '7 dni' },
            { id: '30d', label: '30 dni' },
            { id: '1y', label: '1 rok' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedRange(range.id)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedRange === range.id 
                ? 'bg-surface-bright text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-primary font-bold animate-pulse">Ładowanie danych analitycznych...</div>
        </div>
      ) : reportData ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Traffic Chart */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <TrendingUp className="text-primary" size={20} />
                  Przepływ towarów ({selectedRange === '7d' ? 'Tygodniowy' : selectedRange === '30d' ? 'Miesięczny' : 'Roczny'})
                </h3>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={reportData.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Bar dataKey="pz" name="Przyjęcia" fill="#2170e4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wz" name="Wydania" fill="#515f74" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Summary */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-on-surface flex items-center gap-2">
                  <Activity className="text-secondary" size={20} />
                  Wydajność operacyjna
                </h3>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={reportData.chart_data}>
                  <defs>
                    <linearGradient id="colorPz" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2170e4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2170e4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWz" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#515f74" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#515f74" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="pz" stroke="#2170e4" fillOpacity={1} fill="url(#colorPz)" />
                  <Area type="monotone" dataKey="wz" stroke="#515f74" fillOpacity={1} fill="url(#colorWz)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardList size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Suma operacji</p>
                <p className="text-xl font-bold text-on-surface">{reportData.cards.total_ops}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Box size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Top produkt</p>
                <p className="text-xl font-bold text-on-surface">{reportData.cards.top_product || 'Brak'}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Database size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">Wartość zapasów</p>
                <p className="text-xl font-bold text-on-surface">{reportData.cards.total_stock}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-on-surface-variant">
          Brak danych do wyświetlenia raportu.
        </div>
      )}
    </div>
  );
};
