# Design Spec: Real-time Analytics and Reports

Replace static mock data in the Reports component with real-time data aggregated from the database.

## Problem Statement
The current reports page displays hardcoded constants (`REPORT_DATA`), making it useless for monitoring actual warehouse operations.

## Proposed Solution

### 1. Backend (FastAPI)

#### API Endpoint: `GET /api/reports/stats`
- **Parameters:** `range` (enum: `7d`, `30d`, `1y`, default: `7d`).
- **Logic:**
  - Calculate start date based on `range`.
  - Query `documents` and `document_items`.
  - Group documents by date/month (Daily for 7d/30d, Monthly for 1y).
  - Aggregate types:
    - **Przyjęcia (Inflow):** `PZ`, `PW`, `ZW`.
    - **Wydania (Outflow):** `WZ`, `RW`.
  - Calculate card metrics:
    - `total_ops`: Count of documents in range.
    - `top_product`: Product with highest total quantity in `document_items`.
    - `total_stock`: SUM of `stock_quantity` for all products.

- **Response Schema:**
```json
{
  "chart_data": [
    { "name": "2024-05-20", "pz": 10, "wz": 5 },
    ...
  ],
  "cards": {
    "total_ops": 150,
    "top_product": "Paleta Euro",
    "total_stock": 4500
  }
}
```

### 2. Frontend (React)

#### Component: `Reports.tsx`
- **State:** `selectedRange` ('7d', '30d', '1y'), `data` (from API), `loading`.
- **UI Updates:**
  - Add a toggle/select for the time range (7d / 30d / 1y).
  - Update `BarChart` and `AreaChart` to use `data.chart_data`.
  - Replace static indicator cards with `data.cards`.
  - Handle loading and empty states.

## Testing Strategy
- **Backend:** Test aggregation logic with various document dates.
- **Frontend:** Verify that switching ranges updates charts and cards correctly.
