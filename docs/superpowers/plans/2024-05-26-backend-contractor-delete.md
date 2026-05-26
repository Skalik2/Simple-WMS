# Backend CRUD Implementation - Delete Contractor

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `delete_contractor` logic in `app/crud.py` with validation to prevent deleting contractors with linked documents.

**Architecture:** Add a new CRUD function that checks for existence and linked documents before deletion.

**Tech Stack:** Python, SQLAlchemy, FastAPI

---

### Task 1: Backend CRUD Implementation

**Files:**
- Modify: `app/crud.py`
- Test: `tests/test_crud_contractor.py`

- [x] **Step 1: Write the failing test**

```python
import pytest
from sqlalchemy import create_session
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from app import models, crud, schemas
from fastapi import HTTPException

def test_delete_contractor_with_documents_fails(db_session):
    # 1. Create a contractor
    contractor = crud.create_contractor(db_session, schemas.ContractorCreate(name="Test Contractor", nip="1234567890"))
    
    # 2. Create a document linked to this contractor
    # We need a product for the document
    product = crud.create_product(db_session, schemas.ProductCreate(
        sku="TEST-SKU", name="Test Product", type="PRODUKT", unit="szt"
    ))
    
    doc_data = schemas.DocumentCreate(
        type="PZ",
        contractor_id=contractor.id,
        items=[schemas.DocumentItemCreate(product_id=product.id, quantity=10)]
    )
    crud.create_document(db_session, doc_data, user_id="test_user")
    
    # 3. Try to delete the contractor
    with pytest.raises(HTTPException) as excinfo:
        crud.delete_contractor(db_session, contractor.id)
    
    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == "Nie można usunąć kontrahenta, ponieważ posiada on przypisane dokumenty."
```

- [x] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_crud_contractor.py::test_delete_contractor_with_documents_fails -v`
Expected: FAIL with `AttributeError: module 'app.crud' has no attribute 'delete_contractor'`

- [x] **Step 3: Write minimal implementation**

```python
def delete_contractor(db: Session, contractor_id: int):
    contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Kontrahent nie istnieje")
    
    # Check for linked documents
    doc_count = db.query(models.Document).filter(models.Document.contractor_id == contractor_id).count()
    if doc_count > 0:
        raise HTTPException(
            status_code=400, 
            detail="Nie można usunąć kontrahenta, ponieważ posiada on przypisane dokumenty."
        )
    
    db.delete(contractor)
    db.commit()
    return True
```

- [x] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_crud_contractor.py::test_delete_contractor_with_documents_fails -v`
Expected: PASS

- [x] **Step 5: Add test for successful deletion**

```python
def test_delete_contractor_success(db_session):
    # 1. Create a contractor
    contractor = crud.create_contractor(db_session, schemas.ContractorCreate(name="Delete Me", nip="0000000000"))
    
    # 2. Delete the contractor
    result = crud.delete_contractor(db_session, contractor.id)
    
    # 3. Verify
    assert result is True
    deleted_contractor = db_session.query(models.Contractor).filter(models.Contractor.id == contractor.id).first()
    assert deleted_contractor is None
```

- [x] **Step 6: Run all tests in the file**

Run: `pytest tests/test_crud_contractor.py -v`
Expected: PASS

- [x] **Step 7: Commit**

```bash
git add app/crud.py tests/test_crud_contractor.py
git commit -m "feat(backend): add delete_contractor logic with validation"
```
