import React from 'react';
import { motion } from 'motion/react';
import { CONTRACTORS } from '../constants';
import { Users, Plus, Check, Search, MapPin, Building2 } from 'lucide-react';
import { Modal } from './ui/Modal';

export const Contractors = () => {
  const [contractors, setContractors] = React.useState(CONTRACTORS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newContractor = {
      id: `K-00${contractors.length + 1}`,
      name: formData.get('name') as string,
      nip: formData.get('nip') as string,
      city: formData.get('city') as string,
      type: formData.get('type') as string,
    };
    setContractors([newContractor, ...contractors]);
    setIsModalOpen(false);
  };

  return (
    <div id="contractors-content" className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Kontrahenci</h2>
          <p className="text-on-surface-variant">Baza dostawców, odbiorców i partnerów logistycznych.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Dodaj kontrahenta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-container/10 p-6 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-4 mb-2">
            <Building2 className="text-primary" size={24} />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Wszystkich</span>
          </div>
          <p className="text-4xl font-bold text-on-surface">{contractors.length}</p>
        </div>
        <div className="bg-secondary-container/30 p-6 rounded-2xl border border-secondary/20">
          <div className="flex items-center gap-4 mb-2">
            <Users className="text-secondary" size={24} />
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">Aktywnych</span>
          </div>
          <p className="text-4xl font-bold text-on-surface">{contractors.length}</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant">
          <div className="flex items-center gap-4 mb-2">
            <MapPin className="text-on-surface-variant" size={24} />
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Miasta</span>
          </div>
          <p className="text-4xl font-bold text-on-surface">12</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright/50 flex justify-between items-center">
          <h3 className="font-bold text-on-surface">Lista kontrahentów</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
            <input 
              type="text" 
              placeholder="Szukaj..."
              className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/60">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nazwa Firmy</th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Miasto</th>
                <th className="px-6 py-4">Typ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high transition-all">
              {contractors.map((contractor, idx) => (
                <motion.tr 
                  key={contractor.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-bright transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-on-surface-variant">
                    {contractor.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">
                    {contractor.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">
                    {contractor.nip}
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface">
                    {contractor.city}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      contractor.type === 'Dostawca' 
                        ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                        : contractor.type === 'Odbiorca'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-surface-container-high text-on-surface'
                    }`}>
                      {contractor.type}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Dodaj kontrahenta"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Pełna nazwa firmy</label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="np. Logistyka Sp. z o.o."
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">NIP</label>
              <input 
                name="nip"
                type="text" 
                required
                placeholder="1234567890"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Miasto</label>
              <input 
                name="city"
                type="text" 
                required
                placeholder="Warszawa"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Typ kontrahenta</label>
            <select 
              name="type"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="Dostawca">Dostawca</option>
              <option value="Odbiorca">Odbiorca</option>
              <option value="Przewoźnik">Przewoźnik</option>
              <option value="Inny">Inny</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm hover:bg-surface-variant transition-colors"
            >
              Anuluj
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check size={16} strokeWidth={3} />
              Dodaj kontrahenta
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
