from app.database import SessionLocal
from app.models import Product, Contractor, Document, DocumentItem, DocType
from datetime import datetime, timezone
import random

def seed_db():
    db = SessionLocal()
    try:
        if db.query(Contractor).count() == 0:
            contractors_data = [
                ("Logistyka Plus Sp. z o.o.", "5210001234"),
                ("Hurtownia Tech-Spec", "7770005566"),
                ("Ełka Trans S.A.", "9812345678"),
                ("Omega-System", "3627481920"),
                ("Skład IT J. Kowalski", "679112233"),
                ("Digital House s.c.", "5862374812"),
                ("OptiMarket Sp. j.", "7541938462"),
                ("Firma Handlowa Multi-Tech", "8362547291"),
                ("Technika Jądrowa S.A.", "2891037465"),
                ("Serwis24 Sp. z o.o.", "4251893674"),
            ]
            contractors = [
                Contractor(name=name, nip=nip)
                for name, nip in contractors_data
            ]
            db.add_all(contractors)
            db.commit()
            print("Dodano 10 kontrahentów.")

        if db.query(Product).count() == 0:
            products_data = [
                ("APP-001", "iPhone 15 Pro", 10, "szt"),
                ("SAM-099", "Monitor Samsung 32'", 5, "szt"),
                ("LAP-200", "Dell XPS 13", 7, "szt"),
                ("CLV-301", "Klawiatura mechaniczna Logitech", 15, "szt"),
                ("MS-050", "Mysz bezprzewodowa MX Master 3", 20, "szt"),
                ("MON-081", "Stojak pod monitor", 12, "szt"),
                ("PEN-128", "Dysk SSD 1TB Samsung", 8, "szt"),
                ("HDMI-5M", "Kabel HDMI 5m", 30, "szt"),
                ("USB-C", "Hub USB-C 7w1", 18, "szt"),
                ("WEBC-4K", "Kamera internetowa 4K Logitech", 6, "szt"),
            ]
            products = [
                Product(sku=sku, name=name, stock_quantity=stock, unit=unit)
                for sku, name, stock, unit in products_data
            ]
            db.add_all(products)
            db.commit()
            print("Dodano 10 produktów.")

        if db.query(Document).count() == 0:
            kontrahenci = db.query(Contractor).all()
            produkty = db.query(Product).all()

            documents = []
            for i in range(10):
                doc_type = DocType.PZ if i < 5 else DocType.WZ
                contractor = random.choice(kontrahenci)
                doc = Document(
                    type=doc_type,
                    contractor_id=contractor.id,
                    created_by="system_seed",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(doc)
                db.flush()
                documents.append(doc)

                product = random.choice(produkty)
                item = DocumentItem(
                    document_id=doc.id,
                    product_id=product.id,
                    quantity=random.randint(1, 10)
                )
                db.add(item)

            db.commit()
            print("Dodano 10 dokumentów PZ/WZ z pozycjami.")

        # Check if recipes already exist to avoid duplicates
        from app import models
        if db.query(models.RecipeItem).count() == 0:
            # 1. Create semi-finished products
            noga = models.Product(sku="NOGA-01", name="Noga stołowa", type="POLPRODUKT", stock_quantity=100, unit="szt")
            blat = models.Product(sku="BLAT-01", name="Blat dębowy", type="POLPRODUKT", stock_quantity=20, unit="szt")
            db.add_all([noga, blat])
            db.flush()

            # 2. Create a finished product
            stol = models.Product(sku="STOL-01", name="Stół dębowy", type="PRODUKT", stock_quantity=0, unit="szt")
            db.add(stol)
            db.flush()

            # 3. Create recipe: 1 Stół = 4 Nogi + 1 Blat
            recipe = [
                models.RecipeItem(parent_product_id=stol.id, component_product_id=noga.id, quantity=4),
                models.RecipeItem(parent_product_id=stol.id, component_product_id=blat.id, quantity=1)
            ]
            db.add_all(recipe)
            db.commit()
            print("Dodano przykładowe półprodukty i recepturę stołu.")

    except Exception as e:
        print(f"Błąd: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()