import React from 'react';
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
import { REPORT_DATA } from '../constants';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const Reports = () => {
  return (
    <div id="reports-content" className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-on-surface tracking-tight">Analityka i Raporty</h2>
        <p className="text-on-surface-variant">Śledź wydajność magazynu w czasie rzeczywistym.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Traffic Chart */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-on-surface flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Przepływ towarów (Tygodniowy)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={REPORT_DATA}>
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
            <AreaChart data={REPORT_DATA}>
              <defs>
                <linearGradient id="colorPz" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2170e4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2170e4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip />
              <Area type="monotone" dataKey="pz" stroke="#2170e4" fillOpacity={1} fill="url(#colorPz)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Średni czas przyjęcia</p>
            <p className="text-xl font-bold text-on-surface">12.5 min</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Wskaźnik błędów</p>
            <p className="text-xl font-bold text-on-surface">0.02%</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">Wykorzystanie miejsca</p>
            <p className="text-xl font-bold text-on-surface">82%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
