# Refactor API URLs in Frontend Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor frontend components to use the `API_URL` constant from `../constants` for all API calls.

**Architecture:** Centralize the API base URL management. Use template literals to prepend `${API_URL}` to existing endpoint paths.

**Tech Stack:** React, TypeScript.

---

### Task 1: Update Dashboard.tsx

**Files:**
- Modify: `react-front/src/components/Dashboard.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { ACTION_CARDS, API_URL } from '../constants';

// Update fetch calls in useEffect
    fetch(`${API_URL}/api/documents?page_size=5`)
      .then(res => res.json())
      .then(data => setRecentDocs(data.items || []));

    Promise.all([
      fetch(`${API_URL}/api/products?page_size=1`).then(res => res.json()),
      fetch(`${API_URL}/api/contractors?page_size=1`).then(res => res.json()),
      fetch(`${API_URL}/api/documents?page_size=1`).then(res => res.json())
    ])
```

- [ ] **Step 2: Verify compilation**

### Task 2: Update Inventory.tsx

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// Update fetch calls
const res = await fetch(`${API_URL}/api/products?page=${page}&page_size=${pageSize}`);

// In handleSubmit
const res = await fetch(`${API_URL}/api/products`, {
```

- [ ] **Step 2: Verify compilation**

### Task 3: Update Documents.tsx

**Files:**
- Modify: `react-front/src/components/Documents.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// Update fetch calls
const res = await fetch(`${API_URL}/api/documents?page=${page}&page_size=${pageSize}`);
```

- [ ] **Step 2: Verify compilation**

### Task 4: Update Contractors.tsx

**Files:**
- Modify: `react-front/src/components/Contractors.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// Update fetch calls
const res = await fetch(`${API_URL}/api/contractors?page=${page}&page_size=${pageSize}`);

// In handleSubmit
const url = editingContractor ? `${API_URL}/api/contractors/${editingContractor.id}` : `${API_URL}/api/contractors`;

// In handleDelete
const res = await fetch(`${API_URL}/api/contractors/${id}`, {
```

- [ ] **Step 2: Verify compilation**

### Task 5: Update Reports.tsx

**Files:**
- Modify: `react-front/src/components/Reports.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// Update fetch calls
const res = await fetch(`${API_URL}/api/reports/stats?range=${range}`);
```

- [ ] **Step 2: Verify compilation**

### Task 6: Update NewDocumentModal.tsx

**Files:**
- Modify: `react-front/src/components/NewDocumentModal.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// In useEffect
fetch(`${API_URL}/api/products?page_size=1000`).then(res => res.json()).then(data => setAvailableProducts(data.items || []));
fetch(`${API_URL}/api/contractors?page_size=1000`).then(res => res.json()).then(data => setAvailableContractors(data.items || []));

// In handleSubmit
const res = await fetch(`${API_URL}/api/documents`, {
```

- [ ] **Step 2: Verify compilation**

### Task 7: Update AssemblyModal.tsx

**Files:**
- Modify: `react-front/src/components/AssemblyModal.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// In useEffect
fetch(`${API_URL}/api/products?page_size=1000`)

// In other useEffect
fetch(`${API_URL}/api/products/${selectedProductId}/recipe`)

// In handleSubmit
const res = await fetch(`${API_URL}/api/products/assemble`, {
```

- [ ] **Step 2: Verify compilation**

### Task 8: Update ProductDetailsModal.tsx

**Files:**
- Modify: `react-front/src/components/ProductDetailsModal.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// In useEffect
fetch(`${API_URL}/api/products/${product.id}/recipe`)

// In RecipeEditModal onSave
fetch(`${API_URL}/api/products/${product.id}/recipe`)
```

- [ ] **Step 2: Verify compilation**

### Task 9: Update RecipeEditModal.tsx

**Files:**
- Modify: `react-front/src/components/RecipeEditModal.tsx`

- [ ] **Step 1: Update imports and prepend API_URL to fetch calls**

```typescript
// Update imports
import { API_URL } from '../constants';

// In useEffect
fetch(`${API_URL}/api/products?page_size=1000`)

// In handleSave
const res = await fetch(`${API_URL}/api/recipes`, {
```

- [ ] **Step 2: Verify compilation**
