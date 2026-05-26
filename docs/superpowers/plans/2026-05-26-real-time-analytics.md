# Real-time Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static mock data in the Reports component with real-time aggregated data from the database.

**Architecture:** Add a new report-specific schema and a backend endpoint that aggregates document data over 7d, 30d, and 1y ranges. Update the frontend Reports component to fetch this data and allow range switching.

**Tech Stack:** FastAPI, SQLAlchemy, React (TypeScript), Recharts.

---

### Task 1: Backend Schemas and Models Preparation

**Files:**
- Modify: `app/schemas.py`

- [ ] **Step 1: Add Report Schemas to `app/schemas.py`**

```python
class ReportChartData(BaseModel):
    name: str # Date or Month name
    pz: int
    wz: int

class ReportCards(BaseModel):
    total_ops: int
    top_product: str
    total_stock: int

class ReportResponse(BaseModel):
    chart_data: List[ReportChartData]
    cards: ReportCards
```

- [ ] **Step 2: Commit changes**

```bash
git add app/schemas.py
git commit -m "feat(backend): add report schemas"
```

### Task 2: Backend CRUD Implementation

**Files:**
- Modify: `app/crud.py`

- [ ] **Step 1: Implement `get_report_stats` in `app/crud.py`**
Include logic for date ranges and aggregation by day/month.

```python
from sqlalchemy import func
from datetime import timedelta, date

def get_report_stats(db: Session, date_range: str = "7d"):
    today = datetime.now()
    if date_range == "30d":
        start_date = today - timedelta(days=30)
        group_by = func.date(models.Document.created_at)
    elif date_range == "1y":
        start_date = today - timedelta(days=365)
        group_by = func.strftime('%Y-%m', models.Document.created_at)
    else: # 7d
        start_date = today - timedelta(days=7)
        group_by = func.date(models.Document.created_at)

    # 1. Chart Data
    # Separate inflow (PZ, PW, ZW) and outflow (WZ, RW)
    docs = db.query(
        group_by.label("label"),
        func.count(models.Document.id).filter(models.Document.type.in_([models.DocType.PZ, models.DocType.PW, models.DocType.ZW])).label("pz"),
        func.count(models.Document.id).filter(models.Document.type.in_([models.DocType.WZ, models.DocType.RW])).label("wz")
    ).filter(models.Document.created_at >= start_date).group_by("label").order_by("label").all()

    chart_data = [{"name": d.label, "pz": d.pz, "wz": d.wz} for d in docs]

    # 2. Cards
    total_ops = db.query(models.Document).filter(models.Document.created_at >= start_date).count()
    
    # Top Product (by quantity in document_items)
    top_product_row = db.query(
        models.Product.name,
        func.sum(models.DocumentItem.quantity).label("total_qty")
    ).join(models.DocumentItem).join(models.Document).filter(models.Document.created_at >= start_date).group_by(models.Product.id).order_by(func.sum(models.DocumentItem.quantity).desc()).first()
    
    top_product = top_product_row.name if top_product_row else "Brak"
    
    # Total Stock Value (sum of all stock_quantity)
    total_stock = db.query(func.sum(models.Product.stock_quantity)).scalar() or 0

    return {
        "chart_data": chart_data,
        "cards": {
            "total_ops": total_ops,
            "top_product": top_product,
            "total_stock": total_stock
        }
    }
```

- [ ] **Step 2: Commit changes**

```bash
git add app/crud.py
git commit -m "feat(backend): add get_report_stats crud logic"
```

### Task 3: Backend API Endpoint

**Files:**
- Modify: `app/routers/api.py`

- [ ] **Step 1: Add `GET /api/reports/stats` endpoint**

```python
@router.get("/reports/stats", response_model=schemas.ReportResponse)
async def read_report_stats(range: str = "7d", db: Session = Depends(get_db)):
    if range not in ["7d", "30d", "1y"]:
        raise HTTPException(status_code=400, detail="Nieprawidłowy zakres")
    return crud.get_report_stats(db, date_range=range)
```

- [ ] **Step 2: Commit changes**

```bash
git add app/routers/api.py
git commit -m "feat(backend): add reports/stats endpoint"
```

### Task 4: Backend Verification (Tests)

**Files:**
- Create: `tests/test_api_reports.py`

- [ ] **Step 1: Write tests for reports API**
Mock some documents with different dates and verify aggregation.

- [ ] **Step 2: Run tests**
Run: `$env:PYTHONPATH="."; pytest tests/test_api_reports.py`
Expected: PASS

- [ ] **Step 3: Commit tests**

```bash
git add tests/test_api_reports.py
git commit -m "test(backend): add tests for reports API"
```

### Task 5: Frontend Reports Integration

**Files:**
- Modify: `react-front/src/components/Reports.tsx`

- [ ] **Step 1: Add state for range and data, implementation fetch**
Add a selection UI (Tabs or Select) for 7d/30d/1y.

- [ ] **Step 2: Update charts and cards to use fetched data**
Map `chart_data` to Recharts and `cards` to the indicator section.

- [ ] **Step 3: Handle loading and empty states**
Show "Loading..." and ensure the layout doesn't jump.

- [ ] **Step 4: Commit changes**

```bash
git add react-front/src/components/Reports.tsx
git commit -m "feat(frontend): integrate real data in Reports component"
```
