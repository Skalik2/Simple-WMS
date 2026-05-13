# ZW and RW Document Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate ZW (Zbiór Wewnętrzny) and RW (Rozchód Wewnętrzny) document types into the system, allowing for internal warehouse operations without a required contractor.

**Architecture:** Update the Pydantic schema to make the contractor optional, then modify the React frontend to conditionally hide the contractor field for these internal types and display them with appropriate styling in the document list.

**Tech Stack:** FastAPI (Python), React (TypeScript), Tailwind CSS (for styling).

---

### Task 1: Backend Schema Update

**Files:**
- Modify: `app/schemas.py`

- [ ] **Step 1: Update `DocumentCreate` schema**
Modify `DocumentCreate` to allow `contractor_id` to be `None`.

```python
class DocumentCreate(BaseModel):
    type: DocType
    contractor_id: int | None = None
    items: List[DocumentItemCreate]
```

- [ ] **Step 2: Verify existing CRUD logic**
No changes needed to `app/crud.py` as it already handles `ZW`, `RW`, and `nullable` `contractor_id`.

- [ ] **Step 3: Commit**

```bash
git add app/schemas.py
git commit -m "feat(backend): make contractor_id optional in DocumentCreate schema"
```

---

### Task 2: Frontend Type Definitions and List Updates

**Files:**
- Modify: `react-front/src/components/Documents.tsx`

- [ ] **Step 1: Update `Document` interface**
Expand the `type` field to include `ZW` and `RW`.

```typescript
interface Document {
  id: number;
  type: 'PZ' | 'WZ' | 'ZW' | 'RW'; // Updated
  contractor_name: string;
  created_at: string;
  created_by?: string;
  items: DocumentItem[];
}
```

- [ ] **Step 2: Update document list styling**
Update the rendering logic to handle new types with correct colors and labels.

```tsx
// Inside Documents component mapping
<div className={`p-3 rounded-xl ${
  (doc.type === 'PZ' || doc.type === 'ZW') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
}`}>
  {(doc.type === 'PZ' || doc.type === 'ZW') ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
</div>
<div>
  <div className="flex items-center gap-2">
    <span className="font-mono text-xs font-bold text-primary">{doc.type}/{doc.id}</span>
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
      (doc.type === 'PZ' || doc.type === 'ZW') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {doc.type === 'PZ' ? 'Przyjęcie' : doc.type === 'WZ' ? 'Wydanie' : doc.type === 'ZW' ? 'Zbiór Wew.' : 'Rozchód Wew.'}
    </span>
  </div>
  <h3 className="font-bold text-on-surface">{doc.contractor_name || 'Dokument wewnętrzny'}</h3>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add react-front/src/components/Documents.tsx
git commit -m "feat(frontend): add ZW/RW support to Documents list"
```

---

### Task 3: Frontend New Document Modal

**Files:**
- Modify: `react-front/src/components/NewDocumentModal.tsx`

- [ ] **Step 1: Update `type` state and dropdown**
Change the `type` state type and add options to the select.

```tsx
const [type, setType] = useState<'PZ' | 'WZ' | 'ZW' | 'RW'>('PZ');

// In JSX
<select 
  value={type} 
  onChange={(e) => setType(e.target.value as 'PZ' | 'WZ' | 'ZW' | 'RW')}
  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
>
  <option value="PZ">PZ - Przyjęcie</option>
  <option value="WZ">WZ - Wydanie</option>
  <option value="ZW">ZW - Zbiór Wewnętrzny</option>
  <option value="RW">RW - Rozchód Wewnętrzny</option>
</select>
```

- [ ] **Step 2: Conditionally hide Contractor field**
Wrap the Contractor field in a condition.

```tsx
{/* Wybór typu i kontrahenta */}
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Typ</label>
    <select ... />
  </div>
  {(type === 'PZ' || type === 'WZ') && (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Kontrahent</label>
      <select 
        required
        value={contractorId}
        onChange={(e) => setContractorId(e.target.value)}
        className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm"
      >
        <option value="">Wybierz...</option>
        {availableContractors.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  )}
</div>
```

- [ ] **Step 3: Update handleSubmit payload**
Ensure `contractor_id` is sent correctly.

```tsx
const payload = {
  type,
  contractor_id: (type === 'PZ' || type === 'WZ') ? parseInt(contractorId) : null,
  items: items.map(item => ({
    product_id: parseInt(item.product_id),
    quantity: parseFloat(item.quantity.toString())
  }))
};
```

- [ ] **Step 4: Commit**

```bash
git add react-front/src/components/NewDocumentModal.tsx
git commit -m "feat(frontend): add ZW/RW support to NewDocumentModal"
```

---

### Task 4: Frontend Document Details Modal

**Files:**
- Modify: `react-front/src/components/DocumentDetailsModal.tsx`

- [ ] **Step 1: Update labels and styling**
Ensure internal documents are labeled correctly in the details view.

```tsx
// Example change in labels
const getDocTypeLabel = (type: string) => {
  switch(type) {
    case 'PZ': return 'Przyjęcie Zewnętrzne';
    case 'WZ': return 'Wydanie Zewnętrzne';
    case 'ZW': return 'Zbiór Wewnętrzny';
    case 'RW': return 'Rozchód Wewnętrzny';
    default: return type;
  }
};

// Handle null contractor name
<h3 className="text-xl font-bold">{document.contractor_name || 'Dokument wewnętrzny'}</h3>
```

- [ ] **Step 2: Commit**

```bash
git add react-front/src/components/DocumentDetailsModal.tsx
git commit -m "feat(frontend): add ZW/RW support to DocumentDetailsModal"
```

---

### Task 5: Final Manual Verification

- [ ] **Step 1: Verify ZW document creation**
Create a ZW, verify contractor field is hidden, verify stock increases.
- [ ] **Step 2: Verify RW document creation**
Create an RW, verify contractor field is hidden, verify stock decreases.
- [ ] **Step 3: Verify existing PZ/WZ**
Ensure they still require a contractor.
