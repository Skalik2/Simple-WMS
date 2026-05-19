# Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement server-side pagination for Products, Documents, and Contractors with a "Classic Pagination" UI.

**Architecture:** Offset-based pagination using `skip` and `limit` in SQLAlchemy. Generic `PageResponse` schema for consistency. React state-driven pagination component.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic, React (TypeScript), Tailwind CSS, Lucide React.

---

### Task 1: Backend - Add Pagination Schemas

**Files:**
- Modify: `app/schemas.py`

- [ ] **Step 1: Add PageResponse schema**
Add `PageResponse` to `app/schemas.py`.

```python
from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int

    class Config:
        from_attributes = True
```

- [ ] **Step 2: Commit**

```bash
git add app/schemas.py
git commit -m "feat(backend): add PageResponse schema for pagination"
```

---

### Task 2: Backend - Update CRUD functions

**Files:**
- Modify: `app/crud.py`

- [ ] **Step 1: Update get_contractors**
Modify `get_contractors` to support `skip` and `limit` and return total count.

```python
def get_contractors(db: Session, skip: int = 0, limit: int = 10):
    query = db.query(models.Contractor).order_by(models.Contractor.name)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total
```

- [ ] **Step 2: Update get_products**
Modify `get_products` to support `skip` and `limit` and return total count.

```python
def get_products(db: Session, skip: int = 0, limit: int = 10):
    query = db.query(models.Product).order_by(models.Product.id)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total
```

- [ ] **Step 3: Update get_documents**
Modify `get_documents` to support `skip` and `limit` and return total count.

```python
def get_documents(db: Session, skip: int = 0, limit: int = 10):
    query = db.query(models.Document).order_by(models.Document.created_at.desc())
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total
```

- [ ] **Step 4: Commit**

```bash
git add app/crud.py
git commit -m "feat(backend): update CRUD functions to support pagination"
```

---

### Task 3: Backend - Update API Endpoints

**Files:**
- Modify: `app/routers/api.py`

- [ ] **Step 1: Update read_products endpoint**
Update the response model and logic for `read_products`.

```python
@router.get("/products", response_model=schemas.PageResponse[schemas.ProductResponse])
async def read_products(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    skip = (page - 1) * page_size
    items, total = crud.get_products(db, skip=skip, limit=page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }
```

- [ ] **Step 2: Update read_documents endpoint**
Update the response model and logic for `read_documents`.

```python
@router.get("/documents", response_model=schemas.PageResponse[schemas.DocumentResponse])
async def read_documents(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    skip = (page - 1) * page_size
    items, total = crud.get_documents(db, skip=skip, limit=page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }
```

- [ ] **Step 3: Update read_contractors endpoint**
Update the response model and logic for `read_contractors`.

```python
@router.get("/contractors", response_model=schemas.PageResponse[schemas.ContractorResponse])
async def read_contractors(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    skip = (page - 1) * page_size
    items, total = crud.get_contractors(db, skip=skip, limit=page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }
```

- [ ] **Step 4: Commit**

```bash
git add app/routers/api.py
git commit -m "feat(backend): update API endpoints to return paginated results"
```

---

### Task 4: Frontend - Types and Pagination Component

**Files:**
- Modify: `react-front/src/types.ts`
- Create: `react-front/src/components/ui/Pagination.tsx`

- [ ] **Step 1: Add PaginatedResponse type**
Add the following to `react-front/src/types.ts`:

```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
```

- [ ] **Step 2: Create Pagination component**
Create `react-front/src/components/ui/Pagination.tsx`.

```tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-outline-variant bg-surface px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50"
        >
          Poprzednia
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-outline-variant bg-surface px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-bright disabled:opacity-50"
        >
          Następna
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-on-surface-variant">
            Pokazywanie od <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> do{' '}
            <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> z{' '}
            <span className="font-medium">{totalItems}</span> wyników
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-on-surface-variant ring-1 ring-inset ring-outline-variant hover:bg-surface-bright focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Poprzednia</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            {pages.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  page === currentPage
                    ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    : 'text-on-surface ring-1 ring-inset ring-outline-variant hover:bg-surface-bright focus:z-20 focus:outline-offset-0'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-on-surface-variant ring-1 ring-inset ring-outline-variant hover:bg-surface-bright focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Następna</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Commit**

```bash
git add react-front/src/types.ts react-front/src/components/ui/Pagination.tsx
git commit -m "feat(frontend): add PaginatedResponse type and Pagination component"
```

---

### Task 5: Frontend - Update Inventory (Products)

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Step 1: Import Pagination and types**
Add imports and update `Product` interface if needed (already exists in file).

- [ ] **Step 2: Update state and fetch logic**
Add `currentPage` and `totalItems` state. Update `fetchProducts`.

```tsx
  const [items, setItems] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchProducts = async (page: number = 1) => {
    try {
      const res = await fetch(`/api/products?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      console.error('Błąd podczas pobierania produktów:', err);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);
```

- [ ] **Step 3: Render Pagination component**
Add `<Pagination ... />` after the table.

- [ ] **Step 4: Commit**

```bash
git add react-front/src/components/Inventory.tsx
git commit -m "feat(frontend): implement pagination in Inventory view"
```

---

### Task 6: Frontend - Update Documents

**Files:**
- Modify: `react-front/src/components/Documents.tsx`

- [ ] **Step 1: Import Pagination and types**
Add imports.

- [ ] **Step 2: Update state and fetch logic**
Add `currentPage` and `totalItems` state. Update `fetchDocuments`.

```tsx
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchDocuments = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      console.error('Błąd pobierania dokumentów:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage]);
```

- [ ] **Step 3: Render Pagination component**
Add `<Pagination ... />` after the documents list.

- [ ] **Step 4: Commit**

```bash
git add react-front/src/components/Documents.tsx
git commit -m "feat(frontend): implement pagination in Documents view"
```

---

### Task 7: Frontend - Update Contractors

**Files:**
- Modify: `react-front/src/components/Contractors.tsx`

- [ ] **Step 1: Import Pagination and types**
Add imports.

- [ ] **Step 2: Update state and fetch logic**
Add `currentPage` and `totalItems` state. Update `fetchContractors`.

```tsx
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchContractors = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contractors?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        setContractors(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      console.error('Błąd pobierania kontrahentów:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors(currentPage);
  }, [currentPage]);
```

- [ ] **Step 3: Render Pagination component**
Add `<Pagination ... />` after the grid.

- [ ] **Step 4: Commit**

```bash
git add react-front/src/components/Contractors.tsx
git commit -m "feat(frontend): implement pagination in Contractors view"
```
