# Recipe Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a feature to view and edit product assembly recipes by clicking on product rows in the inventory.

**Architecture:** 
- **Frontend:** Row-click trigger in `Inventory.tsx` opens `ProductDetailsModal.tsx`, which leads to `RecipeEditModal.tsx` for recipe management.
- **Backend:** Utilize existing `POST /api/recipes` and `GET /api/products/{id}/recipe` endpoints, adding a self-reference check in `crud.py`.

**Tech Stack:** FastAPI, SQLAlchemy, React, Lucide React (icons), Tailwind CSS (via project conventions).

---

### Task 1: UI Trigger and Product Details Modal

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`
- Create: `react-front/src/components/ProductDetailsModal.tsx`

- [ ] **Step 1: Add row click handler to `Inventory.tsx`**

```tsx
// react-front/src/components/Inventory.tsx
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

// Inside the table row map:
<motion.tr 
  onClick={() => setSelectedProduct(item)}
  // ... existing classes
  className="hover:bg-surface-bright transition-colors cursor-pointer group"
>
```

- [ ] **Step 2: Create `ProductDetailsModal.tsx`**

This modal will show basic info and the current recipe.

```tsx
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
        .then(data => setRecipe(data));
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
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              <Edit2 size={12} /> {recipe.length > 0 ? 'Edytuj' : 'Dodaj'}
            </button>
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
            <p className="text-xs text-on-surface-variant italic">Brak zdefiniowanej receptury.</p>
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
          onUpdate(); // Trigger refresh
        }}
      />
    </Modal>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add react-front/src/components/Inventory.tsx react-front/src/components/ProductDetailsModal.tsx
git commit -m "feat: add ProductDetailsModal and row click trigger"
```

---

### Task 2: Recipe Edit Modal Component

**Files:**
- Create: `react-front/src/components/RecipeEditModal.tsx`

- [ ] **Step 1: Create the Recipe Editor Modal**

This component implements the searchable list UI (Option A).

```tsx
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Plus, Trash2, Save } from 'lucide-react';

export const RecipeEditModal = ({ isOpen, onClose, product, currentRecipe, onSave }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedCompId, setSelectedCompId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setItems(currentRecipe.map((r: any) => ({ ...r })));
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setAllProducts(data.filter((p: any) => p.type === 'POLPRODUKT' && p.id !== product.id)));
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
    try {
      const res = await fetch('/api/recipes', {
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
              <option value="">Wybierz półprodukt...</option>
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
            className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
          >
            <Save size={16} /> Zapisz Recepturę
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add react-front/src/components/RecipeEditModal.tsx
git commit -m "feat: implement RecipeEditModal with component search and list"
```

---

### Task 3: Backend Validation

**Files:**
- Modify: `app/crud.py`

- [ ] **Step 1: Add self-reference check to `create_recipe`**

```python
# app/crud.py -> create_recipe
def create_recipe(db: Session, recipe_data: schemas.RecipeCreate):
    # Check for self-reference
    for item in recipe_data.items:
        if item.component_product_id == recipe_data.parent_product_id:
            raise HTTPException(status_code=400, detail="Produkt nie może być składnikiem samego siebie.")
            
    # Existing logic...
    db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id == recipe_data.parent_product_id).delete()
    # ...
```

- [ ] **Step 2: Commit**

```bash
git add app/crud.py
git commit -m "fix: add self-reference validation to recipe creation"
```

---

### Task 4: Final Integration in Inventory

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Step 1: Mount `ProductDetailsModal` in `Inventory.tsx`**

```tsx
// react-front/src/components/Inventory.tsx
import { ProductDetailsModal } from './ProductDetailsModal';

// ... at the end of the JSX
<ProductDetailsModal 
  isOpen={!!selectedProduct}
  product={selectedProduct}
  onClose={() => setSelectedProduct(null)}
  onUpdate={fetchProducts}
/>
```

- [ ] **Step 2: Commit**

```bash
git add react-front/src/components/Inventory.tsx
git commit -m "feat: integrate ProductDetailsModal in Inventory view"
```
