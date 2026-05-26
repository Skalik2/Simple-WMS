# Documents Pagination Race Condition Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent race conditions when fetching documents during pagination by introducing a cancellation check.

**Architecture:** Update `fetchDocuments` to accept an `isCancelled` callback and wrap the data-fetching logic to check this callback before updating state. Manage a `cancelled` flag within a `useEffect` cleanup function.

**Tech Stack:** React (TypeScript)

---

### Task 1: Update fetchDocuments and useEffect in Documents.tsx

**Files:**
- Modify: `react-front/src/components/Documents.tsx`

- [ ] **Step 1: Update fetchDocuments to accept isCancelled parameter**

Modify the `fetchDocuments` function signature and logic to check `isCancelled()` before calling state setters.

```typescript
  const fetchDocuments = async (page: number = 1, isCancelled: () => boolean = () => false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?page=${page}&page_size=${pageSize}`);
      if (res.ok) {
        const data = await res.json();
        if (isCancelled()) return; // Don't update state if component unmounted or effect re-ran
        setDocuments(data.items);
        setTotalItems(data.total);
        setCurrentPage(data.page);
      }
    } catch (err) {
      if (!isCancelled()) {
        console.error('Błąd pobierania dokumentów:', err);
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  };
```

- [ ] **Step 2: Update useEffect to manage cancellation**

Update the `useEffect` hook to use a local `cancelled` flag and provide a cleanup function.

```typescript
  useEffect(() => {
    let cancelled = false;
    fetchDocuments(currentPage, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [currentPage]);
```

- [ ] **Step 3: Update NewDocumentModal onSuccess callback**

Ensure `onSuccess` also passes the cancellation check (though it's less critical here, it maintains consistency).

```typescript
      <NewDocumentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchDocuments(currentPage, () => false)}
      />
```

- [ ] **Step 4: Verify changes**

Since this is a race condition fix, it's hard to test with a simple automated test without mocking network latency. However, we can verify that the code still works as expected (loads documents on page change).

- [ ] **Step 5: Commit**

```bash
git add react-front/src/components/Documents.tsx
git commit -m "fix(documents): fix pagination race condition"
```
