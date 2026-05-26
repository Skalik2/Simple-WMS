# Obsługa cen zakupu i sprzedaży produktów - Plan Implementacji

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dodanie cen zakupu i sprzedaży do kartoteki produktów oraz rejestrowanie cen transakcyjnych na dokumentach PZ/WZ/RW/PW/ZW.

**Architecture:**
- Rozszerzenie modeli SQLAlchemy o pola cenowe.
- Aktualizacja schematów Pydantic.
- Modyfikacja logiki CRUD (backend) i interfejsu React (frontend) w celu obsługi nowych pól.
- Automatyczne podpowiadanie cen w formularzu nowego dokumentu.

**Tech Stack:** Python (FastAPI, SQLAlchemy), React (TypeScript, Tailwind CSS).

---

### Task 1: Backend - Modele Bazy Danych

**Files:**
- Modify: `app/models.py`

- [ ] **Krok 1: Dodanie pól do modelu Product**
Dodać `purchase_price` i `selling_price` (Float, domyślnie 0.0).

```python
class Product(Base):
    # ...
    purchase_price = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
```

- [ ] **Krok 2: Dodanie pola do modelu DocumentItem**
Dodać `unit_price` (Float, domyślnie 0.0).

```python
class DocumentItem(Base):
    # ...
    unit_price = Column(Float, default=0.0)
```

---

### Task 2: Backend - Schematy API

**Files:**
- Modify: `app/schemas.py`

- [ ] **Krok 1: Aktualizacja ProductCreate i ProductResponse**
Dodać nowe pola cenowe.

```python
class ProductCreate(BaseModel):
    # ...
    purchase_price: float = 0.0
    selling_price: float = 0.0

class ProductResponse(BaseModel):
    # ...
    purchase_price: float
    selling_price: float
```

- [ ] **Krok 2: Aktualizacja DocumentItemCreate i DocumentItemResponse**
Dodać pole `unit_price`.

```python
class DocumentItemCreate(BaseModel):
    # ...
    unit_price: float = 0.0

class DocumentItemResponse(BaseModel):
    # ...
    unit_price: float
```

---

### Task 3: Backend - Logika CRUD

**Files:**
- Modify: `app/crud.py`

- [ ] **Krok 1: Aktualizacja create_product**
Zapewnić zapisywanie nowych pól.

```python
def create_product(db: Session, product_data: schemas.ProductCreate):
    db_product = models.Product(
        # ...
        purchase_price=product_data.purchase_price,
        selling_price=product_data.selling_price,
        stock_quantity=0
    )
    # ...
```

- [ ] **Krok 2: Aktualizacja create_document**
Przekazywanie `unit_price` do `DocumentItem`.

```python
def create_document(db: Session, doc_data: schemas.DocumentCreate, user_id: str):
    # ...
    for item_data in doc_data.items:
        # ...
        db_item = models.DocumentItem(
            document_id=db_document.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price # Dodano
        )
        db.add(db_item)
    # ...
```

---

### Task 4: Backend - Testy

**Files:**
- Create: `tests/test_crud_product_prices.py`

- [ ] **Krok 1: Napisanie testów CRUD**
Zweryfikować poprawność zapisu i odczytu cen.

```python
def test_create_product_with_prices(db_session):
    product_in = schemas.ProductCreate(
        sku="TEST-PRICE", name="Test Product", type=models.ProductType.PRODUKT, unit="szt.",
        purchase_price=10.5, selling_price=20.0
    )
    product = crud.create_product(db_session, product_in)
    assert product.purchase_price == 10.5
    assert product.selling_price == 20.0
```

- [ ] **Krok 2: Uruchomienie testów**
`pytest tests/test_crud_product_prices.py`

---

### Task 5: Frontend - Typy TypeScript

**Files:**
- Modify: `react-front/src/types.ts`
- Modify: `react-front/src/components/Inventory.tsx` (interface Product)

- [ ] **Krok 1: Aktualizacja interfejsów**
Dodać `purchase_price`, `selling_price` do produktu oraz `unit_price` do elementu dokumentu.

---

### Task 6: Frontend - Inwentarz (Tabela i Formularz)

**Files:**
- Modify: `react-front/src/components/Inventory.tsx`

- [ ] **Krok 1: Dodanie kolumn do tabeli**
Wyświetlić ceny zakupu i sprzedaży.

- [ ] **Krok 2: Dodanie pól do formularza dodawania produktu**
Dodać inputy dla `purchase_price` i `selling_price`.

---

### Task 7: Frontend - Szczegóły Produktu

**Files:**
- Modify: `react-front/src/components/ProductDetailsModal.tsx`

- [ ] **Krok 1: Wyświetlenie cen**
Dodać sekcję z cenami w widoku szczegółów.

---

### Task 8: Frontend - Nowy Dokument (Sugerowanie Ceny)

**Files:**
- Modify: `react-front/src/components/NewDocumentModal.tsx`

- [ ] **Krok 1: Dodanie pola Cena jednostkowa dla każdej pozycji**
Użytkownik może edytować cenę.

- [ ] **Krok 2: Logika sugerowania ceny**
Po wyborze produktu:
- Jeśli dokument to PZ/PW/ZW -> ustaw `unit_price` na `purchase_price`.
- Jeśli dokument to WZ/RW -> ustaw `unit_price` na `selling_price`.

---

### Task 9: Frontend - Szczegóły Dokumentu

**Files:**
- Modify: `react-front/src/components/DocumentDetailsModal.tsx`

- [ ] **Krok 1: Wyświetlenie ceny i wartości**
W tabeli pozycji dodać kolumny "Cena" i "Wartość" (cena * ilość).
