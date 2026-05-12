import React from 'react';
import { Modal } from './ui/Modal';
import { Plus, Trash2, Check } from 'lucide-react';
import { INVENTORY_ITEMS, CONTRACTORS } from '../constants';

interface ProductItem {
  id: string;
  name: string;
  quantity: number;
}

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({ isOpen, onClose, initialType = 'PZ' }) => {
  const [docType, setDocType] = React.useState(initialType);
  const [products, setProducts] = React.useState<ProductItem[]>([
    { id: Math.random().toString(), name: '', quantity: 1 }
  ]);

  React.useEffect(() => {
    if (isOpen) {
      setDocType(initialType);
      setProducts([{ id: Math.random().toString(), name: '', quantity: 1 }]);
    }
  }, [isOpen, initialType]);

  const addProduct = () => {
    setProducts([...products, { id: Math.random().toString(), name: '', quantity: 1 }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string | number) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Dokument ${docType} z ${products.length} produktami został utworzony`);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Nowy dokument: ${docType}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Typ dokumentu</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="PZ">PZ - Przyjęcie</option>
              <option value="WZ">WZ - Wydanie</option>
              <option value="ZW">ZW - Zwrot</option>
              <option value="RW">RW - Rozchód</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Data</label>
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Kontrahent / Cel</label>
          <select 
            className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
            defaultValue=""
            required
          >
            <option value="" disabled>Wybierz kontrahenta...</option>
            {CONTRACTORS.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Produkty</label>
            <button 
              type="button" 
              onClick={addProduct}
              className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {products.map((product, idx) => (
              <div key={product.id} className="flex gap-2 items-end group">
                <div className="flex-[3] space-y-1">
                  <select 
                    value={product.name}
                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none"
                    required
                  >
                    <option value="" disabled>Wybierz produkt...</option>
                    {INVENTORY_ITEMS.map(item => (
                      <option key={item.id} value={item.name}>
                        {item.name} ({item.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <input 
                    type="number" 
                    min="1"
                    value={product.quantity}
                    onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                {products.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all mb-[1px]"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex gap-3 sticky bottom-0 bg-surface-container-lowest">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-xl text-sm hover:bg-surface-variant transition-colors"
          >
            Anuluj
          </button>
          <button 
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={3} />
            Utwórz
          </button>
        </div>
      </form>
    </Modal>
  );
};

