import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useAuth } from '@clerk/clerk-react';
import { Product, Contractor } from '../types';
import { API_URL } from '../constants';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'PZ' | 'WZ' | 'ZW' | 'RW' | 'PW';
}

export const NewDocumentModal = ({ isOpen, onClose, onSuccess, initialType = 'PZ' }: NewDocumentModalProps) => {
  const { getToken } = useAuth();
  
  const [type, setType] = useState<'PZ' | 'WZ' | 'ZW' | 'RW' | 'PW'>(initialType);
  const [contractorId, setContractorId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: 0 }]);
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [availableContractors, setAvailableContractors] = useState<Contractor[]>([]);

  // Recalculate prices when type changes
  useEffect(() => {
    if (items.length > 0 && availableProducts.length > 0) {
      setItems(prevItems => prevItems.map(item => {
        if (!item.product_id) return item;
        const product = availableProducts.find(p => p.id === parseInt(item.product_id));
        if (!product) return item;

        let newPrice = item.unit_price;
        if (['PZ', 'PW', 'ZW'].includes(type)) {
          newPrice = product.purchase_price;
        } else if (['WZ', 'RW'].includes(type)) {
          newPrice = product.selling_price;
        }
        return { ...item, unit_price: newPrice };
      }));
    }
  }, [type, availableProducts]);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      // Fetch products (first 1000 for dropdown)
      fetch(`${API_URL}/api/products?page_size=1000`).then(res => res.json()).then(data => setAvailableProducts(data.items || []));
      // Fetch contractors (first 1000 for dropdown)
      fetch(`${API_URL}/api/contractors?page_size=1000`).then(res => res.json()).then(data => setAvailableContractors(data.items || []));
    }
  }, [isOpen, initialType]);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = await getToken();
    
    const payload = {
      type,
      contractor_id: (type === 'PZ' || type === 'WZ') ? parseInt(contractorId) : null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity.toString()),
        unit_price: parseFloat(item.unit_price.toString())
      }))
    };

    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setContractorId('');
        setItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
      } else {
        const errorData = await res.json();
        alert(`Błąd: ${JSON.stringify(errorData.detail || errorData)}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nowy dokument magazynowy">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wybór typu i kontrahenta */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Typ</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as 'PZ' | 'WZ' | 'ZW' | 'RW' | 'PW')}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
            >
              <option value="PZ">PZ - Przyjęcie</option>
              <option value="WZ">WZ - Wydanie</option>
              <option value="PW">PW - Przyjęcie Wewnętrzne</option>
              <option value="RW">RW - Rozchód Wewnętrzny</option>
              <option value="ZW">ZW - Zwrot Wewnętrzny</option>
            </select>
          </div>
          {(type === 'PZ' || type === 'WZ') && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Kontrahent</label>
              <select 
                required
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
              >
                <option value="">Wybierz...</option>
                {availableContractors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pozycje dokumentu */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Pozycje</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1">
                <select 
                  required
                  value={item.product_id}
                  onChange={(e) => {
                    const newItems = [...items];
                    const prodId = parseInt(e.target.value);
                    newItems[index].product_id = e.target.value;
                    
                    const product = availableProducts.find(p => p.id === prodId);
                    if (product) {
                      if (['PZ', 'PW', 'ZW'].includes(type)) {
                        newItems[index].unit_price = product.purchase_price;
                      } else if (['WZ', 'RW'].includes(type)) {
                        newItems[index].unit_price = product.selling_price;
                      }
                    }
                    
                    setItems(newItems);
                  }}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
                >
                  <option value="">Produkt...</option>
                  {availableProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stan: {p.stock_quantity})</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <input 
                  type="number" 
                  min="1"
                  title="Ilość"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = parseInt(e.target.value);
                    setItems(newItems);
                  }}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
                />
              </div>
              <div className="w-32">
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  title="Cena jednostkowa"
                  placeholder="Cena"
                  value={item.unit_price}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].unit_price = parseFloat(e.target.value);
                    setItems(newItems);
                  }}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
                />
              </div>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="p-2 text-error hover:bg-error/10 rounded-lg">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={addItem}
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <Plus size={14} /> Dodaj kolejną pozycję
          </button>
        </div>

        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm">Anuluj</button>
          <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
            <Check size={16} /> Wystaw dokument
          </button>
        </div>
      </form>
    </Modal>
  );
};