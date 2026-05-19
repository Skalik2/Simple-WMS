# Design: Pagination for Products, Documents, and Contractors

Implement standard offset-based pagination to improve performance and usability as the database grows.

## Goal
Add server-side pagination to the main data lists:
1. Products (Inventory)
2. Documents
3. Contractors

## Technical Approach

### Backend (FastAPI + SQLAlchemy)

#### 1. Schemas (`app/schemas.py`)
Add a generic pagination wrapper schema:
```python
from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
```

#### 2. CRUD (`app/crud.py`)
Update fetch functions to support `skip` and `limit`:
- `get_products(db, skip: int = 0, limit: int = 10)`
- `get_documents(db, skip: int = 0, limit: int = 10)`
- `get_contractors(db, skip: int = 0, limit: int = 10)`

Each function will now return a tuple: `(List[Model], int)` where the second element is the total count.

#### 3. API Routers (`app/routers/api.py`)
Update GET endpoints to:
- Accept `page: int = 1` and `page_size: int = 10` query parameters.
- Calculate `skip = (page - 1) * page_size`.
- Return `PageResponse`.

### Frontend (React + Tailwind)

#### 1. Types (`react-front/src/types.ts`)
Add `PaginatedResponse<T>` interface:
```typescript
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
```

#### 2. UI Component (`react-front/src/components/ui/Pagination.tsx`)
Create a reusable `Pagination` component that shows:
- Current page info (e.g., "Strona 1 z 5")
- "Previous" and "Next" buttons.
- Page number buttons for direct navigation.

#### 3. View Implementation
Update `Inventory.tsx`, `Documents.tsx`, and `Contractors.tsx`:
- Maintain `currentPage` state.
- Update `fetch` calls to include `?page=X&page_size=10`.
- Update state to handle the paginated response structure.
- Render the `Pagination` component.

## Testing Strategy
- **Manual Verification:** Verify that navigating between pages correctly updates the list and that total counts are accurate.
- **Edge Cases:** Test empty lists, lists with exactly one page, and lists where the last page is partially full.
