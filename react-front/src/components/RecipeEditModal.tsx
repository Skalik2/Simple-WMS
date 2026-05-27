import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Plus, Trash2, Save } from 'lucide-react';
import { API_URL } from '../constants';
import { Product } from '../types';

interface RecipeItem {
  component_product_id: number;
  quantity: number;
  name: string;
}

interface RecipeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  currentRecipe: RecipeItem[];
  onSave: () => void;
}

export const RecipeEditModal = ({ isOpen, onClose, product, currentRecipe, onSave }: RecipeEditModalProps) => {
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setItems(currentRecipe.map((r: any) => ({ ...r })));
      fetch(`${API_URL}/api/products?page_size=1000`)
        .then(res => res.json())
        .then(data => {
          // Filter out current product and non-semi-finished products
          const products = data.items || [];
          setAllProducts(products.filter((p: any) => p.id !== product.id));
        })
        .catch(err => console.error(err));
    }
  }, [isOpen, currentRecipe, product]);

  const addItem = () => {
    if (!selectedCompId) return;
    const comp = allProducts.find(p => p.id === Number(selectedCompId));
    if (!comp) return;

    if (items.find(i => i.component_product_id === comp.id)) {
      alert("Ten składnik jest już na liście.");
      return;
    }

    setItems([...items, { component_product_id: comp.id, name: comp.name, quantity }]);
    setSelectedCompId('');
    setQuantity(1);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.component_product_id !== id));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_product_id: product.id,
          items: items.map(i => ({ component_product_id: i.component_product_id, quantity: i.quantity }))
        })
      });

      if (res.ok) {
        onSave();
      } else {
        const err = await res.json();
        alert(err.detail || "Błąd zapisu.");
      }
    } catch (err) {
      console.error(err);
      alert("Wystąpił błąd połączenia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edytuj Recepturę: ${product?.name}`}>
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Dodaj składnik</label>
            <select 
              value={selectedCompId}
              onChange={e => setSelectedCompId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
            >
              <option value="">Wybierz produkt...</option>
              {allProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="w-24 space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Ilość</label>
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
            />
          </div>
          <button onClick={addItem} className="p-2 bg-primary text-white rounded-xl h-[38px] w-[38px] flex items-center justify-center">
            <Plus size={20} />
          </button>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 border-t border-outline-variant pt-4">
          {items.map(item => (
            <div key={item.component_product_id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">{item.quantity} szt.</p>
              </div>
              <button onClick={() => removeItem(item.component_product_id)} className="text-error p-2 hover:bg-error/10 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-center text-xs text-on-surface-variant py-4 italic">Brak składników na liście.</p>}
        </div>

        <div className="pt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm">Anuluj</button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Zapisywanie..." : <><Save size={16} /> Zapisz Recepturę</>}
          </button>
        </div>
      </div>
    </Modal>
  );
};
