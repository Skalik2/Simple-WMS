# Backend Reports Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `GET /api/reports/stats` endpoint to provide analytical data for the dashboard.

**Architecture:** Add a new route in `app/routers/api.py` that validates the query parameter and calls the existing CRUD function.

**Tech Stack:** FastAPI, SQLAlchemy, Pydantic.

---

### Task 1: Add Reports API Endpoint

**Files:**
- Modify: `app/routers/api.py`

- [ ] **Step 1: Read `app/routers/api.py`**
Verify current content and imports.

- [ ] **Step 2: Add `GET /api/reports/stats` route**

```python
@router.get("/reports/stats", response_model=schemas.ReportResponse)
async def read_report_stats(range: str = Query("7d"), db: Session = Depends(get_db)):
    if range not in ["7d", "30d", "1y"]:
        raise HTTPException(status_code=400, detail="Nieprawidłowy zakres")
    return crud.get_report_stats(db, date_range=range)
```

- [ ] **Step 3: Verify implementation with a test script**
Create a temporary test script to call the endpoint and verify the response structure.

- [ ] **Step 4: Commit**

```bash
git add app/routers/api.py
git commit -m "feat(backend): add reports/stats endpoint"
```
