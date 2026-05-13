# Design Spec: Assembly Mechanic

## Goal
Implement a mechanic to assemble finished products or semi-finished products from components (semi-finished products). The assembly process should be documented in the warehouse system using internal documents to maintain full traceability.

## User Flow
1. **Inventory View**: User clicks the "Złóż produkt" (Assemble Product) button at the top of the page.
2. **Assembly Modal**:
    - User selects a product to assemble from a list of products that have recipes.
    - User enters the quantity to assemble.
    - The modal displays the required components and their current stock levels.
    - User confirms the assembly.
3. **Execution**: The system validates stock, performs the changes, and closes the modal with a success message.

## Technical Architecture

### Data Model
- **Product**: Existing model with `type` (PRODUKT, POLPRODUKT).
- **RecipeItem**: Existing model defining which components make up a parent product.
- **Document**: Existing model. Assembly will create two documents:
    - **RW (Internal Issue)**: For components.
    - **PW (Internal Receipt)**: For the assembled product.

### API Changes
- **POST `/api/products/assemble`**:
    - Payload: `{ "product_id": int, "quantity": int }`
    - Logic:
        1. Fetch recipe for `product_id`.
        2. Validate if all `component_product_id` have sufficient `stock_quantity`.
        3. Start transaction.
        4. Create `RW` document and `DocumentItem` entries for components; update their `stock_quantity`.
        5. Create `PW` document and `DocumentItem` entry for the assembled product; update its `stock_quantity`.
        6. Commit transaction.

### UI Changes (React)
- **Inventory.tsx**:
    - Add "Złóż produkt" button.
    - Implement `AssemblyModal.tsx` component.
    - Fetch products with recipes to populate the selection.
    - Implement the assembly request.

### Testing & Data
- **seed_db.py**: Add example products (e.g., "Szafka"), semi-finished products (e.g., "Blat", "Noga"), and recipes to demonstrate the functionality.

## Success Criteria
- User can successfully assemble a product if components are available.
- System prevents assembly if components are missing.
- Two documents (PW and RW) are created for every successful assembly.
- Inventory levels are updated correctly for both components and the final product.
