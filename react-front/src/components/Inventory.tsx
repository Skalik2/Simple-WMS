import React from 'react';
import { motion } from 'motion/react';
import { INVENTORY_ITEMS } from '../constants';
import { Box, MapPin, Package, Plus, Send, Check } from 'lucide-react';
import { Modal } from './ui/Modal';

export const Inventory = () => {
  const [items, setItems] = React.useState(INVENTORY_ITEMS);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem = {
      id: formData.get('sku') as string,
      name: formData.get('name') as string,
      quantity: parseInt(formData.get('quantity') as string) || 0,
      unit: formData.get('unit') as string,
      location: formData.get('location') as string,
    };
    setItems([newItem, ...items]);
    setIsModalOpen(false);
  };
  return (
    <div id="inventory-content" className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Inwentarz</h2>
          <p className="text-on-surface-variant">Zarządzaj zapasami i lokalizacjami towarów.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold text-sm">Dodaj produkt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-primary-container/10 p-6 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-4 mb-2">
            <Box className="text-primary" size={24} />
            <span className="text-sm font-bold text-primary uppercase tracking-wider">Produkty</span>
          </div>
          <p className="text-4xl font-bold text-on-surface">{items.length}</p>
        </div>
        <div className="bg-secondary-container/30 p-6 rounded-2xl border border-secondary/20">
          <div className="flex items-center gap-4 mb-2">
            <Package className="text-secondary" size={24} />
            <span className="text-sm font-bold text-secondary uppercase tracking-wider">Całkowita Ilość</span>
          </div>
          <p className="text-4xl font-bold text-on-surface">45,890</p>
        </div>
        <div className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant">
          <div className="flex items-center gap-4 mb-2">
            <MapPin className="text-on-surface-variant" size={24} />
            <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Lokalizacje</span>
          </div>
          <p className="text-4xl font-bold text-on-surface">324</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright/50">
          <h3 className="font-bold text-on-surface">Lista towarów</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/60">
              <tr>
                <th className="px-6 py-4">ID SKU</th>
                <th className="px-6 py-4">Nazwa Towaru</th>
                <th className="px-6 py-4">Ilość</th>
                <th className="px-6 py-4">Jednostka</th>
                <th className="px-6 py-4">Lokalizacja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high transition-all">
              {items.map((item, idx) => (
                <motion.tr 
                  key={`${item.id}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-bright transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant uppercase">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-container-high rounded font-mono text-xs text-on-surface">
                      {item.location}
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
        title="Dodaj nowy produkt do inwentarza"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Nazwa produktu</label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="np. Paleta Euro"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">SKU / ID</label>
              <input 
                name="sku"
                type="text" 
                required
                placeholder="SKU-001"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Lokalizacja</label>
              <input 
                name="location"
                type="text" 
                required
                placeholder="A-01-01"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Ilość początkowa</label>
              <input 
                name="quantity"
                type="number" 
                required
                min="0"
                defaultValue="0"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Jednostka</label>
              <select 
                name="unit"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="szt">Sztuki (szt)</option>
                <option value="rol">Rolka (rol)</option>
                <option value="kg">Kilogramy (kg)</option>
                <option value="m">Metry (m)</option>
              </select>
            </div>
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
              Dodaj produkt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
