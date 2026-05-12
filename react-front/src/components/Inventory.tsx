import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Box, MapPin, Package, Plus, Check } from 'lucide-react';
import { Modal } from './ui/Modal';

// Typ określający budowę produktu z API
interface Product {
  id: number;
  sku: string;
  name: string;
  type: string;
  unit: string;
  stock_quantity: number;
}

export const Inventory = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pobieranie produktów z API
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania produktów:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Wysyłanie nowego produktu do API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: formData.get('sku'),
          name: formData.get('name'),
          type: 'PRODUKT', // lub POLPRODUKT
          unit: formData.get('unit'),
        })
      });

      if (res.ok) {
        await fetchProducts(); // Odśwież listę po dodaniu
        setIsModalOpen(false);
      } else {
        alert("Błąd podczas zapisywania produktu.");
      }
    } catch (err) {
      console.error(err);
    }
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

      {/* Tabela produktów */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-bright/50">
          <h3 className="font-bold text-on-surface">Lista towarów</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/60">
              <tr>
                <th className="px-6 py-4">ID / SKU</th>
                <th className="px-6 py-4">Nazwa Towaru</th>
                <th className="px-6 py-4">Ilość na stanie</th>
                <th className="px-6 py-4">Typ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high transition-all">
              {items.map((item, idx) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-surface-bright transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">
                    [{item.id}] {item.sku}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-on-surface">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-on-surface">
                    {item.stock_quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 text-xs text-on-surface-variant uppercase">
                    {item.type}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal dodawania */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Dodaj nowy produkt do inwentarza"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Nazwa produktu</label>
            <input name="name" type="text" required placeholder="np. Paleta Euro" className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">SKU / Kod</label>
            <input name="sku" type="text" required placeholder="SKU-001" className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Jednostka</label>
            <select name="unit" className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              <option value="szt">Sztuki (szt)</option>
              <option value="kg">Kilogramy (kg)</option>
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm">Anuluj</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Check size={16} /> Dodaj produkt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};