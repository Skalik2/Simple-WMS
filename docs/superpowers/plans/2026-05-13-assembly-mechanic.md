# Assembly Mechanic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a feature to assemble products from semi-finished components, creating PW/RW documents and updating stock levels correctly.

**Architecture:** 
- **Backend:** A new `/api/products/assemble` endpoint that handles the atomic process of consuming components (RW) and producing the product (PW).
- **Frontend:** An "Assemble" button in the Inventory view that opens a modal for product selection and quantity input, with a preview of component requirements.
- **Data:** Updated seed script with semi-finished products and recipes.

**Tech Stack:** FastAPI, SQLAlchemy, React, Tailwind CSS (via Vanilla CSS/shadcn-like patterns in the project).

---

### Task 1: Update Seed Data

**Files:**
- Modify: `dev-scripts/seed_db.py`

- [ ] **Step 1: Add semi-finished products and recipes to `seed_db.py`**

```python
# Add this to seed_db()
if db.query(models.RecipeItem).count() == 0:
    # 1. Create semi-finished products
    noga = models.Product(sku="NOGA-01", name="Noga stołowa", type="POLPRODUKT", stock_quantity=100, unit="szt")
    blat = models.Product(sku="BLAT-01", name="Blat dębowy", type="POLPRODUKT", stock_quantity=20, unit="szt")
    db.add_all([noga, blat])
    db.flush()

    # 2. Create a finished product
    stol = models.Product(sku="STOL-01", name="Stół dębowy", type="PRODUKT", stock_quantity=0, unit="szt")
    db.add(stol)
    db.flush()

    # 3. Create recipe: 1 Stół = 4 Nogi + 1 Blat
    recipe = [
        models.RecipeItem(parent_product_id=stol.id, component_product_id=noga.id, quantity=4),
        models.RecipeItem(parent_product_id=stol.id, component_product_id=blat.id, quantity=1)
    ]
    db.add_all(recipe)
    db.commit()
    print("Dodano przykładowe półprodukty i recepturę stołu.")
```

- [ ] **Step 2: Run the seed script**

Run: `python dev-scripts/seed_db.py` (Note: You might need to clear the DB first if it fails due to existing data, or use a script that handles it).

- [ ] **Step 3: Commit**

```bash
git add dev-scripts/seed_db.py
git commit -m "test: add semi-finished products and recipe to seed data"
```

---

### Task 2: Backend Schemas and CRUD

**Files:**
- Modify: `app/schemas.py`
- Modify: `app/crud.py`

- [ ] **Step 1: Add `ProductAssembly` schema to `app/schemas.py`**

```python
class ProductAssembly(BaseModel):
    product_id: int
    quantity: int
```

- [ ] **Step 2: Implement `assemble_product` in `app/crud.py`**

This function should:
1. Fetch the recipe for the product.
2. Check component availability.
3. Create RW document for components.
4. Create PW document for the product.
5. Update stock levels manually to avoid side effects from `create_document`'s current "kit" logic.

```python
def assemble_product(db: Session, assembly_data: schemas.ProductAssembly, user_id: str):
    product = db.query(models.Product).filter(models.Product.id == assembly_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nie istnieje.")
    
    recipe_items = db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id == product.id).all()
    if not recipe_items:
        raise HTTPException(status_code=400, detail="Produkt nie ma zdefiniowanej receptury.")
    
    # 1. Validate components stock
    for r_item in recipe_items:
        comp = db.query(models.Product).filter(models.Product.id == r_item.component_product_id).first()
        required_qty = r_item.quantity * assembly_data.quantity
        if not comp or comp.stock_quantity < required_qty:
            raise HTTPException(status_code=400, detail=f"Brak półproduktu: {comp.name if comp else 'Nieznany'}")

    # 2. Create RW (Internal Issue) for components
    rw_doc = models.Document(type=models.DocType.RW, created_by=user_id)
    db.add(rw_doc)
    db.flush()
    
    for r_item in recipe_items:
        comp = db.query(models.Product).filter(models.Product.id == r_item.component_product_id).first()
        qty_to_issue = r_item.quantity * assembly_data.quantity
        comp.stock_quantity -= qty_to_issue
        
        db_item = models.DocumentItem(document_id=rw_doc.id, product_id=comp.id, quantity=qty_to_issue)
        db.add(db_item)
    
    # 3. Create PW (Internal Receipt) for product
    pw_doc = models.Document(type=models.DocType.PW, created_by=user_id)
    db.add(pw_doc)
    db.flush()
    
    product.stock_quantity += assembly_data.quantity
    db_item = models.DocumentItem(document_id=pw_doc.id, product_id=product.id, quantity=assembly_data.quantity)
    db.add(db_item)
    
    db.commit()
    return {"message": "Złożono pomyślnie", "product": product.name, "quantity": assembly_data.quantity}
```

- [ ] **Step 3: Commit**

```bash
git add app/schemas.py app/crud.py
git commit -m "feat: implement assembly logic in CRUD and schemas"
```

---

### Task 3: Backend API Endpoint

**Files:**
- Modify: `app/routers/api.py`

- [ ] **Step 1: Add POST `/products/assemble` endpoint**

```python
@router.post("/products/assemble")
async def assemble_product(
    data: schemas.ProductAssembly, 
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        return crud.assemble_product(db=db, assembly_data=data, user_id=user_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 2: Commit**

```bash
git add app/routers/api.py
git commit -m "feat: add assembly endpoint to API router"
```

---

### Task 4: Frontend Assembly Modal Component

**Files:**
- Create: `react-front/src/components/AssemblyModal.tsx`

- [ ] **Step 1: Create the `AssemblyModal` component**

The component should fetch products, allow selecting one with a recipe, input quantity, and show requirements.

```tsx
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
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
```

- [ ] **Step 2: Commit**

```bash
git add react-front/src/components/AssemblyModal.tsx
git commit -m "feat: add AssemblyModal component"
```

---

### Task 5: Integrate Assembly in Inventory View

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Step 1: Import and add the "Assemble" button and Modal to `Inventory.tsx`**

```tsx
// Add import
import { AssemblyModal } from './AssemblyModal';
import { Settings2 } from 'lucide-react'; // Example icon for assembly

// Inside Inventory component
const [isAssemblyModalOpen, setIsAssemblyModalOpen] = useState(false);

// Add the button next to "Dodaj produkt"
<button 
  onClick={() => setIsAssemblyModalOpen(true)}
  className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl shadow-lg hover:shadow-secondary/20 hover:scale-105 transition-all"
>
  <Settings2 size={20} />
  <span className="font-bold text-sm">Złóż produkt</span>
</button>

// Add the modal component at the end
<AssemblyModal 
  isOpen={isAssemblyModalOpen} 
  onClose={() => setIsAssemblyModalOpen(false)} 
  onAssemblySuccess={fetchProducts} 
/>
```

- [ ] **Step 2: Commit**

```bash
git add react-front/src/components/Inventory.tsx
git commit -m "feat: integrate assembly button and modal in Inventory view"
```
