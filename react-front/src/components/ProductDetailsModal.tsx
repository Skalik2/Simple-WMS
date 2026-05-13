import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Package, Edit2 } from 'lucide-react';
import { RecipeEditModal } from './RecipeEditModal';

interface RecipeItem {
  component_product_id: number;
  quantity: number;
  name: string;
}

export const ProductDetailsModal = ({ product, isOpen, onClose, onUpdate }: any) => {
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

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Szczegóły: ${product.name}`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">SKU</label>
            <p className="text-sm font-mono">{product.sku}</p>
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Stan</label>
            <p className="text-sm font-bold">{product.stock_quantity} {product.unit}</p>
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
    </Modal>
  );
};
