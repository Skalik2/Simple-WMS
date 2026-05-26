# Specyfikacja: Ceny zakupu i sprzedaży produktów

## Cel
Wprowadzenie obsługi cen zakupu i sprzedaży produktów w systemie. Ceny mają być definiowane w kartotece produktu jako wartości domyślne (sugerowane) oraz zapisywane w dokumentach jako ceny transakcyjne z możliwością ręcznej edycji.

## Zmiany w Bazie Danych (app/models.py)

### Model `Product`
Dodanie kolumn:
- `purchase_price`: Float (domyślna cena zakupu)
- `selling_price`: Float (domyślna cena sprzedaży)

### Model `DocumentItem`
Dodanie kolumny:
- `unit_price`: Float (faktyczna cena jednostkowa w momencie transakcji)

## Zmiany w API (app/schemas.py)

### Schematy Produktu
- `ProductCreate`: dodanie `purchase_price` i `selling_price` (opcjonalne, domyślnie 0.0).
- `ProductResponse`: dodanie `purchase_price` i `selling_price`.

### Schematy Dokumentu
- `DocumentItemCreate`: dodanie `unit_price`.
- `DocumentItemResponse`: dodanie `unit_price`.

## Zmiany w Interfejsie (React)

### Inwentarz (Inventory.tsx)
- Formularz dodawania: Dodanie pól "Cena zakupu" i "Cena sprzedaży".
- Tabela: Dodanie kolumn "Cena zakupu" i "Cena sprzedaży".

### Szczegóły Produktu (ProductDetailsModal.tsx)
- Wyświetlanie cen zakupu i sprzedaży w sekcji informacji o produkcie.

### Nowy Dokument (NewDocumentModal.tsx)
- Automatyczne podpowiadanie ceny po wybraniu produktu:
    - Dla dokumentów PZ, PW: podpowiadanie `purchase_price`.
    - Dla dokumentów WZ, RW: podpowiadanie `selling_price`.
    - Dla ZW: podpowiadanie `purchase_price`.
- Możliwość ręcznej zmiany ceny jednostkowej przez użytkownika przed zapisem.

### Szczegóły Dokumentu (DocumentDetailsModal.tsx)
- Dodanie kolumny "Cena" i "Wartość" (cena * ilość) w tabeli pozycji dokumentu.

## Bezpieczeństwo i Walidacja
- Ceny nie mogą być ujemne.
- Jeśli cena nie zostanie podana, domyślnie przyjmowana jest wartość 0.0.
