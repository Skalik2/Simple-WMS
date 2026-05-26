# Design Spec: Contractor Deletion with Relation Check

Implement the ability to delete contractors from the WMS while ensuring data integrity by blocking the deletion of contractors who are linked to existing documents.

## Problem Statement
Users currently cannot delete contractors who were added by mistake or are no longer needed. However, simply deleting a contractor who has history in the system (PZ/WZ documents) would lead to orphan records or loss of historical data.

## Proposed Solution

### Backend (FastAPI)

#### 1. CRUD (`app/crud.py`)
Add `delete_contractor(db, contractor_id)`:
- Check if contractor exists.
- Check if any documents are linked to this contractor.
- If documents exist, raise `HTTPException(400, "...")`.
- Else, delete the contractor.

#### 2. API Router (`app/routers/api.py`)
Add `DELETE /api/contractors/{contractor_id}` endpoint.

### Frontend (React)

#### 1. UI Update (`react-front/src/components/Contractors.tsx`)
- Add a "Delete" option to the `MoreVertical` menu.
- Style it with `text-error` (red).

#### 2. Interaction Flow
- User clicks "Delete".
- `window.confirm` asks for confirmation.
- If confirmed, send DELETE request to API.
- If successful, refresh the list.
- If failed (400), show an `alert` with the error message from the backend.

## Success Criteria
- Contractors with NO documents can be deleted.
- Contractors WITH documents cannot be deleted, and a clear error message is shown.
- UI remains responsive and provides immediate feedback.
