# Contractor Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement contractor editing functionality (name and NIP) with a modal interface.

**Architecture:** Standard RESTful PUT endpoint on the backend and a state-managed modal on the frontend. Reuses existing UI components for consistency.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic, React (TypeScript), Lucide React.

---

### Task 1: Backend - Add Update Schema

**Files:**
- Modify: `app/schemas.py`

- [ ] **Step 1: Add ContractorUpdate schema**
Add `ContractorUpdate` to `app/schemas.py`.

```python
class ContractorUpdate(BaseModel):
    name: str
    nip: str | None = None
```

- [ ] **Step 2: Commit**
```bash
git add app/schemas.py
git commit -m "feat(backend): add ContractorUpdate schema"
```

---

### Task 2: Backend - Add CRUD Logic

**Files:**
- Modify: `app/crud.py`

- [ ] **Step 1: Implement update_contractor**
Add the `update_contractor` function to `app/crud.py`.

```python
def update_contractor(db: Session, contractor_id: int, data: schemas.ContractorUpdate) -> models.Contractor | None:
    db_contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    if not db_contractor:
        return None
    db_contractor.name = data.name
    db_contractor.nip = data.nip
    db.commit()
    db.refresh(db_contractor)
    return db_contractor
```

- [ ] **Step 2: Commit**
```bash
git add app/crud.py
git commit -m "feat(backend): add update_contractor to CRUD"
```

---

### Task 3: Backend - Add API Endpoint

**Files:**
- Modify: `app/routers/api.py`

- [ ] **Step 1: Implement PUT endpoint**
Add the `update_contractor` endpoint to `app/routers/api.py`.

```python
@router.put("/contractors/{contractor_id}", response_model=schemas.ContractorResponse)
async def update_contractor(contractor_id: int, data: schemas.ContractorUpdate, db: Session = Depends(get_db)):
    contractor = crud.update_contractor(db, contractor_id, data)
    if not contractor:
        raise HTTPException(status_code=404, detail="Kontrahent nie istnieje")
    return contractor
```

- [ ] **Step 2: Commit**
```bash
git add app/routers/api.py
git commit -m "feat(backend): add PUT endpoint for contractor update"
```

---

### Task 4: Frontend - Update Contractors View

**Files:**
- Modify: `react-front/src/components/Contractors.tsx`

- [ ] **Step 1: Update state and dropdown logic**
Add `editingContractor` state and logic to toggle a simple dropdown for the "three dots" menu.

- [ ] **Step 2: Update modal to handle both Add and Edit**
Modify the modal to pre-fill values when `editingContractor` is present and switch between POST and PUT requests.

```tsx
// Example of updated handleSubmit logic:
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const data = {
    name: formData.get('name'),
    nip: formData.get('nip') || null,
  };
  
  const url = editingContractor ? `/api/contractors/${editingContractor.id}` : '/api/contractors';
  const method = editingContractor ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      await fetchContractors(currentPage);
      setIsModalOpen(false);
      setEditingContractor(null);
    } else {
      alert("Błąd podczas zapisywania kontrahenta.");
    }
  } catch (err) {
    console.error(err);
  }
};
```

- [ ] **Step 3: Commit**
```bash
git add react-front/src/components/Contractors.tsx
git commit -m "feat(frontend): implement contractor editing UI and modal"
```
