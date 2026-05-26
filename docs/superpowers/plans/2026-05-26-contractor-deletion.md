# Contractor Deletion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DELETE endpoint for contractors in `app/routers/api.py` to allow removing contractors from the system.

**Architecture:** A new DELETE route will be added to the `api` router. It will utilize the existing `crud.delete_contractor` function, which already handles business logic like checking for associated documents.

**Tech Stack:** FastAPI, SQLAlchemy, Python.

---

### Task 1: Add DELETE /api/contractors/{contractor_id} endpoint

**Files:**
- Modify: `app/routers/api.py`
- Test: `tests/test_api_contractor_delete.py`

- [ ] **Step 1: Write a failing test for contractor deletion**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_env
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app import models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api_delete.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_delete_contractor_success():
    # Create test DB
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Add a contractor
    db_contractor = models.Contractor(name="Delete Me", nip="1234567890")
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    contractor_id = db_contractor.id
    db.close()

    # Delete the contractor
    response = client.delete(f"/api/contractors/{contractor_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Kontrahent usunięty pomyślnie"}

    # Verify deletion
    db = TestingSessionLocal()
    deleted_contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    assert deleted_contractor is None
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_delete_contractor_not_found():
    Base.metadata.create_all(bind=engine)
    response = client.delete("/api/contractors/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Kontrahent nie istnieje"
    Base.metadata.drop_all(bind=engine)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_api_contractor_delete.py`
Expected: FAIL (405 Method Not Allowed because endpoint doesn't exist yet)

- [ ] **Step 3: Implement the DELETE endpoint in `app/routers/api.py`**

```python
@router.delete("/contractors/{contractor_id}")
async def delete_contractor(contractor_id: int, db: Session = Depends(get_db)):
    try:
        crud.delete_contractor(db, contractor_id)
        return {"message": "Kontrahent usunięty pomyślnie"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_api_contractor_delete.py`
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add app/routers/api.py tests/test_api_contractor_delete.py
git commit -m "feat(backend): add DELETE /api/contractors/{id} endpoint"
```
