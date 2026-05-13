# Design Spec: ZW and RW Document Integration

Implementation of internal document types (ZW - Zbiór Wewnętrzny, RW - Rozchód Wewnętrzny) to support internal warehouse operations.

## 1. Backend Changes

### 1.1 Schemas (`app/schemas.py`)
- Modify `DocumentCreate` to allow `contractor_id` to be null.
  ```python
  class DocumentCreate(BaseModel):
      type: DocType
      contractor_id: int | None = None  # Changed from int to int | None
      items: List[DocumentItemCreate]
  ```

### 1.2 CRUD (`app/crud.py`)
- Verified: `create_document` already handles `DocType.ZW` (increases stock) and `DocType.RW` (decreases stock).
- Verified: `Document` model allows `contractor_id` to be `nullable=True`.

## 2. Frontend Changes

### 2.1 New Document Modal (`react-front/src/components/NewDocumentModal.tsx`)
- **Type Selection:** Expand `type` state to include `'PZ' | 'WZ' | 'ZW' | 'RW'`.
- **UI Logic:**
    - Add `ZW` and `RW` options to the type dropdown.
    - Conditionally hide the "Kontrahent" selection if `type` is `ZW` or `RW`.
    - Ensure `contractor_id` is sent as `null` (or omitted) for internal documents.
- **Validation:** Only require `contractor_id` if type is `PZ` or `WZ`.

### 2.2 Documents List (`react-front/src/components/Documents.tsx`)
- **Type Definitions:** Update `Document` interface to include new types.
- **Visuals:**
    - **ZW (Zbiór Wewnętrzny):** Use green styling (same as PZ) but with "ZW" and "Zbiór Wew." labels.
    - **RW (Rozchód Wewnętrzny):** Use blue styling (same as WZ) but with "RW" and "Rozchód Wew." labels.

### 2.3 Document Details Modal (`react-front/src/components/DocumentDetailsModal.tsx`)
- Ensure the modal correctly displays the new type labels and handles cases where `contractor_name` is missing.

## 3. Verification Plan

### 3.1 Automated Tests
- No existing test suite found. Verification will be manual.

### 3.2 Manual Verification
1. Create a **ZW** document:
    - Verify "Kontrahent" field is hidden.
    - Verify stock increases for selected products.
    - Verify it appears in the list with "ZW" label.
2. Create an **RW** document:
    - Verify "Kontrahent" field is hidden.
    - Verify stock decreases for selected products.
    - Verify it appears in the list with "RW" label.
    - Verify it prevents issuing more than available stock.
3. Verify existing **PZ/WZ** functionality remains unchanged (contractor still required).
