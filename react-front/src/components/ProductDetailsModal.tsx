import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Edit2, Tag, ShoppingCart, TrendingUp, Layers } from 'lucide-react';
import { RecipeEditModal } from './RecipeEditModal';
import { Product } from '../types';

interface RecipeItem {
  component_product_id: number;
  quantity: number;
  name: string;
}

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ProductDetailsModal = ({ product, isOpen, onClose, onUpdate }: ProductDetailsModalProps) => {
  const [recipe, setRecipe] = useState<RecipeItem[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      fetch(`/api/products/${product.id}/recipe`)
        .then(res => res.json())
        .then(data => setRecipe(data))
        .catch(err => console.error(err));
    }
  }, [isOpen, product]);

  return (
    <Modal isOpen={isOpen && !!product} onClose={onClose} title={`Szczegóły: ${product?.name || ''}`}>
      {product && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                <Tag size={18} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">SKU</label>
                <p className="text-sm font-mono">{product.sku}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                <Layers size={18} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Stan</label>
                <p className="text-sm font-bold">{product.stock_quantity} {product.unit}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-container-low rounded-lg text-primary">
                <ShoppingCart size={18} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Cena zakupu</label>
                <p className="text-sm font-bold text-primary">{(product.purchase_price || 0).toFixed(2)} zł</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-surface-container-low rounded-lg text-secondary">
                <TrendingUp size={18} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Cena sprzedaży</label>
                <p className="text-sm font-bold text-secondary">{(product.selling_price || 0).toFixed(2)} zł</p>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">Receptura Złożenia</h3>
              {product.type === 'PRODUKT' && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                >
                  <Edit2 size={12} /> {recipe.length > 0 ? 'Edytuj' : 'Dodaj'}
                </button>
              )}
            </div>

            {recipe.length > 0 ? (
              <ul className="space-y-2">
                {recipe.map(item => (
                  <li key={item.component_product_id} className="flex justify-between text-sm p-2 bg-surface-container-low rounded-lg">
                    <span>{item.name}</span>
                    <span className="font-bold">{item.quantity} szt.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-on-surface-variant italic">
                {product.type === 'POLPRODUKT' 
                  ? "Półprodukty nie mogą posiadać własnych receptur." 
                  : "Brak zdefiniowanej receptury."}
              </p>
            )}
          </div>

          <RecipeEditModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            product={product}
            currentRecipe={recipe}
            onSave={() => {
              setIsEditModalOpen(false);
              // Refresh recipe after save
              fetch(`/api/products/${product.id}/recipe`)
                .then(res => res.json())
                .then(data => setRecipe(data));
              onUpdate(); // Trigger refresh in inventory
            }}
          />
        </div>
      )}
    </Modal>
  );
};
