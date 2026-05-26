# Fix Pagination Race Condition in Contractors

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent race conditions in the Contractors component when changing pages or performing quick updates by implementing a cancellation pattern in `useEffect`.

**Architecture:** Use a `cancelled` boolean flag within `useEffect` and pass a check function to `fetchContractors` to ensure state updates only occur if the component hasn't re-rendered or unmounted.

**Tech Stack:** React, TypeScript

---

### Task 1: Update fetchContractors and useEffect

**Files:**
- Modify: `react-front/src/components/Contractors.tsx`

- [ ] **Step 1: Update `fetchContractors` signature and implementation**

```typescript
  // Pobieranie kontrahentów
  const fetchContractors = async (page: number = 1, isCancelled?: () => boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contractors?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        if (isCancelled && isCancelled()) return;
        setContractors(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      if (isCancelled && isCancelled()) return;
      console.error('Błąd pobierania kontrahentów:', err);
    } finally {
      if (isCancelled && isCancelled()) return;
      setLoading(false);
    }
  };
```

- [ ] **Step 2: Update `useEffect` to manage cancellation flag**

```typescript
  useEffect(() => {
    let cancelled = false;
    fetchContractors(currentPage, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);
```

- [ ] **Step 3: Verify the changes**

Ensure the code compiles and the logic correctly handles the `isCancelled` check before any `set` state call.

- [ ] **Step 4: Commit**

```bash
git add react-front/src/components/Contractors.tsx
git commit -m "fix(contractors): fix pagination race condition"
```
