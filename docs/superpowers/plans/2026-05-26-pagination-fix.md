# Fix Pagination Race Condition in Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the race condition in pagination and add a loading state to the `Inventory` component.

**Architecture:** Use a `cancelled` flag within `useEffect` to ignore stale fetch results and a `loading` state to provide UI feedback and prevent multiple simultaneous requests.

**Tech Stack:** React (TypeScript), Fetch API.

---

### Task 1: Update State and fetchProducts logic

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Step 1: Add loading state**
Add `const [loading, setLoading] = useState(false);` after other state declarations.

- [ ] **Step 2: Update fetchProducts signature and implementation**
Modify `fetchProducts` to accept an `isCancelled` callback and handle `loading` state.

```typescript
  const fetchProducts = async (page: number = 1, isCancelled: () => boolean = () => false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        if (!isCancelled()) {
          setItems(data.items);
          setTotalItems(data.total);
          setCurrentPage(data.page);
        }
      }
    } catch (err) {
      if (!isCancelled()) console.error('Błąd podczas pobierania produktów:', err);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  };
```

- [ ] **Step 3: Update useEffect with cleanup function**
Update `useEffect` to manage the `cancelled` flag.

```typescript
  useEffect(() => {
    let cancelled = false;
    fetchProducts(currentPage, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);
```

- [ ] **Step 4: Update handleSubmit to reset page**
Ensure `handleSubmit` resets `currentPage` to 1.

```typescript
      if (res.ok) {
        if (currentPage === 1) {
          await fetchProducts(1);
        } else {
          setCurrentPage(1);
        }
        setIsModalOpen(false);
      }
```

- [ ] **Step 5: Commit**
```bash
git add react-front/src/components/Inventory.tsx
git commit -m "feat(inventory): add loading state and fix pagination race condition"
```

### Task 2: Update UI for Loading State

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Step 1: Implement loading overlay or skeleton in table body**
Update the `tbody` rendering to show a loading state when `loading` is true.

```tsx
            <tbody className="divide-y divide-surface-container-high transition-all relative">
              {loading && (
                <div className="absolute inset-0 bg-surface-bright/50 backdrop-blur-[1px] flex items-center justify-center z-10">
                  <div className="text-primary font-bold animate-pulse">Ładowanie...</div>
                </div>
              )}
              {items.map((item, idx) => (
                // ... existing row code
              ))}
            </tbody>
```
Note: Ensure the absolute positioning works within the table structure (might need a wrapper div or different approach if table cells don't play nice). Alternatively, replace `items.map` with a loading indicator or disable the pagination during loading.

- [ ] **Step 2: Disable pagination during loading**
Pass the `loading` state to `Pagination` component if it supports it, or wrap it.

- [ ] **Step 3: Commit**
```bash
git add react-front/src/components/Inventory.tsx
git commit -m "feat(inventory): show loading indicator in table"
```
