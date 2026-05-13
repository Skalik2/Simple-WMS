import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Modal } from './ui/Modal';

interface Product {
  id: number;
  sku: string;
  name: string;
  stock_quantity: number;
  unit: string;
}

interface RecipeItem {
  component_product_id: number;
  quantity: number;
  name: string;
}

export const AssemblyModal = ({ isOpen, onClose, onAssemblySuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onAssemblySuccess: () => void;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProducts(data));
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProductId) {
      fetch(`/api/products/${selectedProductId}/recipe`)
        .then(res => res.json())
        .then(data => setRecipe(data));
    } else {
      setRecipe([]);
    }
  }, [selectedProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/products/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: selectedProductId, quantity })
      });

      if (res.ok) {
        onAssemblySuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(error.detail || "Błąd podczas składania.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Złóż produkt z półproduktów">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Produkt docelowy</label>
          <select 
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
            onChange={(e) => setSelectedProductId(Number(e.target.value))}
            value={selectedProductId || ''}
            required
          >
            <option value="">Wybierz produkt...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Ilość do złożenia</label>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
            required
          />
        </div>

        {recipe.length > 0 && (
          <div className="p-4 bg-surface-container-high rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Potrzebne półprodukty:</h4>
            <ul className="text-xs space-y-1">
              {recipe.map(item => (
                <li key={item.component_product_id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-bold">{item.quantity * quantity} szt.</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm">Anuluj</button>
          <button 
            type="submit" 
            disabled={loading || !selectedProductId}
            className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Składanie..." : <><Check size={16} /> Złóż produkt</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
