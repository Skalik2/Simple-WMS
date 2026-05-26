# Contractor Deletion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Delete" option to the contractor menu in the frontend with a confirmation dialog and backend integration.

**Architecture:** Implement a `handleDelete` function that performs a DELETE request and updates the UI state. Integrate this function into the existing contractor menu.

**Tech Stack:** React (TypeScript), Fetch API, Lucide React (for icons), Motion (for animations).

---

### Task 1: Implement handleDelete Function

**Files:**
- Modify: `react-front/src/components/Contractors.tsx`

- [ ] **Step 1: Add handleDelete function to the Contractors component**

```typescript
  const handleDelete = async (id: number) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego kontrahenta? Tej operacji nie można cofnąć.")) {
      return;
    }

    try {
      const res = await fetch(`/api/contractors/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchContractors(currentPage);
        setOpenMenuId(null);
      } else {
        const data = await res.json();
        alert(data.detail || "Błąd podczas usuwania kontrahenta.");
      }
    } catch (err) {
      console.error(err);
      alert("Wystąpił błąd sieciowy.");
    }
  };
```

- [ ] **Step 2: Commit changes**

```bash
git add react-front/src/components/Contractors.tsx
git commit -m "feat(frontend): implement handleDelete function for contractors"
```

### Task 2: Update UI Menu with Delete Option

**Files:**
- Modify: `react-front/src/components/Contractors.tsx`

- [ ] **Step 1: Add the Delete button to the contractor menu JSX**

```tsx
                  {openMenuId === contractor.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg z-10 py-1">
                      <button 
                        onClick={() => {
                          setEditingContractor(contractor);
                          setIsModalOpen(true);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                      >
                        Edytuj
                      </button>
                      <button 
                        onClick={() => handleDelete(contractor.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-600/10 transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  )}
```

- [ ] **Step 2: Commit changes**

```bash
git add react-front/src/components/Contractors.tsx
git commit -m "feat(frontend): add delete contractor option to menu"
```

### Task 3: Verification

- [ ] **Step 1: Verify the UI changes**
Run the frontend development server and verify that the "Usuń" button appears in the contractor menu and triggers the confirmation dialog.

- [ ] **Step 2: Final commit**

```bash
git commit --allow-empty -m "feat(frontend): add delete contractor option with confirmation"
```
