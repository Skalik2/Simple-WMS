from app.database import SessionLocal
from app.models import Product, Contractor, Document, DocumentItem, DocType, ProductType, RecipeItem
from datetime import datetime, timedelta, timezone
import random

def seed_db():
    db = SessionLocal()
    try:
        # Clear existing data for fresh seed if requested
        db.query(RecipeItem).delete()
        db.query(DocumentItem).delete()
        db.query(Document).delete()
        db.query(Product).delete()
        db.query(Contractor).delete()
        db.commit()
        
        # 1. Ensure we have contractors
        contractors_data = [
            ("Logistyka Plus Sp. z o.o.", "5210001234"),
            ("Hurtownia Tech-Spec", "7770005566"),
            ("Ełka Trans S.A.", "9812345678"),
            ("Omega-System", "3627481920"),
            ("Skład IT J. Kowalski", "679112233"),
        ]
        contractors = [Contractor(name=name, nip=nip) for name, nip in contractors_data]
        db.add_all(contractors)
        db.commit()
        contractors = db.query(Contractor).all()

        # 2. Ensure we have products
        # Format: (sku, name, unit, type, purchase_price, selling_price)
        products_data = [
            ("APP-001", "iPhone 15 Pro", "szt", ProductType.PRODUKT.value, 4500.0, 5299.0),
            ("SAM-099", "Monitor Samsung 32'", "szt", ProductType.PRODUKT.value, 850.0, 1199.0),
            ("LAP-200", "Dell XPS 13", "szt", ProductType.PRODUKT.value, 5200.0, 6499.0),
            ("CLV-301", "Klawiatura Logitech", "szt", ProductType.PRODUKT.value, 150.0, 249.0),
            ("MS-050", "Mysz MX Master", "szt", ProductType.PRODUKT.value, 220.0, 349.0),
            ("STOL-DEB", "Stół Dębowy", "szt", ProductType.PRODUKT.value, 1200.0, 2100.0),
            ("NOGA-01", "Noga stołowa", "szt", ProductType.POLPRODUKT.value, 45.0, 0.0),
            ("BLAT-01", "Blat dębowy 160x80", "szt", ProductType.POLPRODUKT.value, 450.0, 0.0),
            ("SRUB-01", "Zestaw śrub montażowych", "kpl", ProductType.POLPRODUKT.value, 5.0, 0.0),
        ]
        products = [
            Product(
                sku=sku, name=name, unit=unit, type=ptype, 
                purchase_price=pp, selling_price=sp, stock_quantity=random.randint(5, 50)
            )
            for sku, name, unit, ptype, pp, sp in products_data
        ]
        db.add_all(products)
        db.commit()
        products = db.query(Product).all()

        # 3. Generate Documents over the last year
        now = datetime.now(timezone.utc)
        doc_count = 0
        
        # Ranges: Last 7 days, Last 30 days, Last 12 months
        # We'll generate about 150 documents total
        for i in range(150):
            # Distribute dates: 30% in last 7 days, 40% in last 30 days, 30% in last year
            rand = random.random()
            if rand < 0.3:
                days_ago = random.randint(0, 6)
            elif rand < 0.7:
                days_ago = random.randint(7, 29)
            else:
                days_ago = random.randint(30, 360)
            
            created_at = now - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            # Weighted doc types: More PZ and WZ
            doc_type = random.choices(
                [DocType.PZ, DocType.WZ, DocType.PW, DocType.RW, DocType.ZW],
                weights=[30, 40, 10, 10, 10]
            )[0]
            
            contractor = random.choice(contractors) if doc_type in [DocType.PZ, DocType.WZ, DocType.ZW] else None
            
            doc = Document(
                type=doc_type,
                contractor_id=contractor.id if contractor else None,
                created_by="seed_bot",
                created_at=created_at
            )
            db.add(doc)
            db.flush() # Get doc ID
            
            # Add 1-3 items per document
            for _ in range(random.randint(1, 3)):
                product = random.choice(products)
                
                # Determine unit price based on document type
                if doc_type in [DocType.PZ, DocType.PW, DocType.ZW]:
                    base_price = product.purchase_price
                else:
                    base_price = product.selling_price
                
                # Add a bit of random fluctuation (+/- 5%) to transactional price
                transactional_price = round(base_price * (1 + random.uniform(-0.05, 0.05)), 2)
                if transactional_price <= 0 and base_price > 0:
                    transactional_price = base_price

                item = DocumentItem(
                    document_id=doc.id,
                    product_id=product.id,
                    quantity=random.randint(1, 10),
                    unit_price=transactional_price
                )
                db.add(item)
            
            doc_count += 1
            if doc_count % 50 == 0:
                db.commit()
                print(f"Dodano {doc_count} dokumentów...")

        db.commit()
        print(f"Seed zakończony pomyślnie. Dodano łącznie {doc_count} dokumentów z cenami transakcyjnymi.")

    except Exception as e:
        print(f"Błąd podczas seedowania: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
