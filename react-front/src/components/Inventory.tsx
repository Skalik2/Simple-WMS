import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Box, MapPin, Package, Plus, Check, Settings2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { AssemblyModal } from './AssemblyModal';
import { ProductDetailsModal } from './ProductDetailsModal';
import { Pagination } from './ui/Pagination';
import { Product } from '../types';
import { API_URL } from '../constants';

export const Inventory = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Pobieranie produktów z API
  const fetchProducts = async (page: number = 1, isCancelled: () => boolean = () => false) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/products?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!isCancelled()) {
            setItems(data.items);
            setTotalItems(data.total);
            setCurrentPage(data.page);
          }
        } catch (parseErr) {
          console.error('Błąd parsowania JSON dla produktów. Otrzymana treść:', text);
          throw parseErr;
        }
      } else {
        const errorText = await res.text();
        console.error(`Błąd API produktów (${res.status}):`, errorText);
      }
    } catch (err) {
      if (!isCancelled()) console.error('Błąd podczas pobierania produktów:', err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchProducts(currentPage, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  // Wysyłanie nowego produktu do API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sku: formData.get('sku'),
          name: formData.get('name'),
          type: formData.get('type'),
          unit: formData.get('unit'),
          purchase_price: parseFloat(formData.get('purchase_price') as string) || 0,
          selling_price: parseFloat(formData.get('selling_price') as string) || 0,
        })
      });

      if (res.ok) {
        if (currentPage === 1) {
          await fetchProducts(1);
        } else {
          setCurrentPage(1);
        }
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
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAssemblyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl shadow-lg hover:shadow-secondary/20 hover:scale-105 transition-all"
          >
            <Settings2 size={20} />
            <span className="font-bold text-sm">Złóż produkt</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus size={20} />
            <span className="font-bold text-sm">Dodaj produkt</span>
          </button>
        </div>
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
                <th className="px-4 lg:px-6 py-4 hidden md:table-cell">ID / SKU</th>
                <th className="px-4 lg:px-6 py-4">Nazwa Towaru</th>
                <th className="px-4 lg:px-6 py-4">Ilość</th>
                <th className="px-4 lg:px-6 py-4 hidden lg:table-cell">Typ</th>
                <th className="px-4 lg:px-6 py-4 text-right hidden sm:table-cell">Zakup</th>
                <th className="px-4 lg:px-6 py-4 text-right">Sprzedaż</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high transition-all relative min-h-[200px]">
              {loading && (
                <tr className="absolute inset-0 bg-surface-bright/50 backdrop-blur-[1px] flex items-center justify-center z-10 w-full h-full">
                  <td className="border-none flex items-center justify-center w-full">
                    <div className="text-primary font-bold animate-pulse">Ładowanie...</div>
                  </td>
                </tr>
              )}
              {items.map((item, idx) => (
                <motion.tr 
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProduct(item)}
                  className="hover:bg-surface-bright transition-colors cursor-pointer group"
                >
                  <td className="px-4 lg:px-6 py-4 font-mono text-xs font-semibold text-primary hidden md:table-cell">
                    [{item.id}] {item.sku}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm font-medium text-on-surface">
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-on-surface-variant md:hidden">SKU: {item.sku}</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm font-bold text-on-surface whitespace-nowrap">
                    {item.stock_quantity} {item.unit}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-xs text-on-surface-variant uppercase hidden lg:table-cell">
                    {item.type}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-on-surface text-right font-mono hidden sm:table-cell">
                    {item.purchase_price?.toFixed(2)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm font-bold text-on-surface text-right font-mono">
                    {item.selling_price?.toFixed(2)} <span className="text-[10px] font-normal text-on-surface-variant">zł</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
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
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Typ produktu</label>
            <select name="type" className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              <option value="PRODUKT">Produkt (Gotowy)</option>
              <option value="POLPRODUKT">Półprodukt / Składnik</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Jednostka</label>
            <select name="unit" className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none">
              <option value="szt">Sztuki (szt)</option>
              <option value="kg">Kilogramy (kg)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Cena zakupu (zł)</label>
              <input name="purchase_price" type="number" step="0.01" min="0" defaultValue="0" required className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Cena sprzedaży (zł)</label>
              <input name="selling_price" type="number" step="0.01" min="0" defaultValue="0" required className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm">Anuluj</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
              <Check size={16} /> Dodaj produkt
            </button>
          </div>
        </form>
      </Modal>

      <AssemblyModal 
        isOpen={isAssemblyModalOpen} 
        onClose={() => setIsAssemblyModalOpen(false)} 
        onAssemblySuccess={fetchProducts} 
      />

      <ProductDetailsModal 
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdate={fetchProducts}
      />
    </div>
  );
};