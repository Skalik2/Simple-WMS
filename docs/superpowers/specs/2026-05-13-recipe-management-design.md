# Design Spec: Recipe Management

## Goal
Enable users to assign and edit assembly recipes for products. A recipe defines which semi-finished products (`POLPRODUKT`) and in what quantities are required to assemble a finished product.

## User Flow
1. **Inventory Table**: User clicks on a product row.
2. **Product Details Modal**: 
    - Opens a modal showing product details (Name, SKU, Stock).
    - Contains a "Recipe" section.
    - If a recipe exists, it lists the components.
    - Provides an "Edit Recipe" (or "Add Recipe") button.
3. **Recipe Edit Modal**:
    - Opens over the details modal or replaces its content.
    - Features a searchable dropdown (Select) to choose from available `POLPRODUKT` items.
    - Numeric input for quantity.
    - "Add" button to include the component in the local list.
    - List of current components with "Delete" (Trash icon) buttons.
    - "Save" button to persist changes to the backend.

## Technical Architecture

### Data Model
- **Product**: Uses existing `type` (PRODUKT, POLPRODUKT).
- **RecipeItem**: Existing model linking a `parent_product_id` to multiple `component_product_id` with `quantity`.

### API Endpoints
- **GET `/api/products`**: Used to populate the searchable list (filtered by `type=POLPRODUKT` on frontend).
- **GET `/api/products/{id}/recipe`**: Fetches the current recipe for a product.
- **POST `/api/recipes`**:
    - Payload: `{ "parent_product_id": int, "items": [{ "component_product_id": int, "quantity": int }] }`
    - Logic: Overwrites the existing recipe for the parent product (handled by existing `crud.create_recipe`).

### UI Components (React)
- **Inventory.tsx**: Add `onClick` handler to table rows to open `ProductDetailsModal`.
- **ProductDetailsModal.tsx** (New): Displays product info and current recipe. Triggers `RecipeEditModal`.
- **RecipeEditModal.tsx** (New): Implementation of the searchable recipe editor (Option A from brainstorming).

## Validation Rules
- A product cannot be a component of itself (Self-reference check).
- Only products with `type=POLPRODUKT` can be added as components.
- Quantities must be greater than 0.

## Success Criteria
- User can view existing recipes by clicking on product rows.
- User can create or modify recipes for any product.
- Changes are correctly reflected in the database and visible in the assembly process.
