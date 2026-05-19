# Design: Contractor Editing Functionality

Add the ability to edit contractor names and NIPs through a modal interface accessible via the "three dots" menu on contractor cards.

## Goal
Implement a full-stack update flow for contractors:
1. Backend: PUT endpoint and CRUD update logic.
2. Frontend: UI for selecting a contractor to edit and a modal for submitting changes.

## Technical Approach

### Backend (FastAPI + SQLAlchemy)

#### 1. Schemas (`app/schemas.py`)
No new schema needed if we reuse `ContractorCreate` or create a specific `ContractorUpdate`. I will create `ContractorUpdate` for clarity.

```python
class ContractorUpdate(BaseModel):
    name: str
    nip: str | None = None
```

#### 2. CRUD (`app/crud.py`)
Add `update_contractor` function:
```python
def update_contractor(db: Session, contractor_id: int, data: schemas.ContractorUpdate):
    db_contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    if not db_contractor:
        return None
    db_contractor.name = data.name
    db_contractor.nip = data.nip
    db.commit()
    db.refresh(db_contractor)
    return db_contractor
```

#### 3. API Routers (`app/routers/api.py`)
Add PUT endpoint:
```python
@router.put("/contractors/{contractor_id}", response_model=schemas.ContractorResponse)
async def update_contractor(contractor_id: int, data: schemas.ContractorUpdate, db: Session = Depends(get_db)):
    contractor = crud.update_contractor(db, contractor_id, data)
    if not contractor:
        raise HTTPException(status_code=404, detail="Kontrahent nie istnieje")
    return contractor
```

### Frontend (React)

#### 1. View Implementation (`react-front/src/components/Contractors.tsx`)
- **Dropdown Menu**: Use a simple state-controlled dropdown for the "three dots" button on each card.
- **Smart Modal**: Modify the existing "New Contractor" modal logic to handle editing if a `selectedContractor` is set.
- **State Management**:
    - `isModalOpen`: boolean
    - `editingContractor`: `Contractor | null`
- **Actions**:
    - Clicking "Add": `setEditingContractor(null)`, `setIsModalOpen(true)`
    - Clicking "Edit": `setEditingContractor(contractor)`, `setIsModalOpen(true)`

## Testing Strategy
- **Manual Verification**:
    - Add a contractor, then edit it and verify changes persist.
    - Verify that NIP can be updated to null/empty.
    - Verify that the list refreshes correctly after editing.
