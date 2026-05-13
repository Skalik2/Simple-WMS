import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useAuth } from '@clerk/clerk-react';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewDocumentModal = ({ isOpen, onClose, onSuccess }: NewDocumentModalProps) => {
  const { getToken } = useAuth();
  
  const [type, setType] = useState<'PZ' | 'WZ' | 'ZW' | 'RW'>('PZ');
  const [contractorId, setContractorId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [availableContractors, setAvailableContractors] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/products').then(res => res.json()).then(setAvailableProducts);
      fetch('/api/contractors').then(res => res.json()).then(setAvailableContractors);
    }
  }, [isOpen]);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = await getToken();
    
    const payload = {
      type,
      contractor_id: (type === 'PZ' || type === 'WZ') ? parseInt(contractorId) : null,
      items: items.map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseFloat(item.quantity.toString())
      }))
    };

    try {
      const res = await fetch('/api/documents', {
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
        setItems([{ product_id: '', quantity: 1 }]);
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
              onChange={(e) => setType(e.target.value as 'PZ' | 'WZ' | 'ZW' | 'RW')}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
            >
              <option value="PZ">PZ - Przyjęcie</option>
              <option value="WZ">WZ - Wydanie</option>
              <option value="ZW">ZW - Zbiór Wewnętrzny</option>
              <option value="RW">RW - Rozchód Wewnętrzny</option>
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
                    newItems[index].product_id = e.target.value;
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
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = parseInt(e.target.value);
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