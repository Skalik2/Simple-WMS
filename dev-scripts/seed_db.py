from app.database import SessionLocal
from app.models import Product, Contractor, Document, DocumentItem, DocType, RecipeItem, ProductType
from datetime import datetime, timezone
import random

def seed_db():
    db = SessionLocal()
    try:
        # 1. Kontrahenci
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

        # 2. Produkty standardowe
        if db.query(Product).filter(Product.type == ProductType.PRODUKT.value).count() == 0:
            products_data = [
                ("APP-001", "iPhone 15 Pro", 10, "szt"),
                ("SAM-099", "Monitor Samsung 32'", 5, "szt"),
                ("LAP-200", "Dell XPS 13", 7, "szt"),
                ("CLV-301", "Klawiatura mechaniczna Logitech", 15, "szt"),
                ("MS-050", "Mysz bezprzewodowa MX Master 3", 20, "szt"),
            ]
            products = [
                Product(sku=sku, name=name, stock_quantity=stock, unit=unit, type=ProductType.PRODUKT.value)
                for sku, name, stock, unit in products_data
            ]
            db.add_all(products)
            db.commit()
            print("Dodano produkty standardowe.")

        # 3. Półprodukty i Receptury (Złożone kombinacje)
        if db.query(RecipeItem).count() == 0:
            # --- Meble ---
            # Półprodukty meblowe
            noga = Product(sku="NOGA-01", name="Noga stołowa (Metal)", type=ProductType.POLPRODUKT.value, stock_quantity=200, unit="szt")
            blat_drewno = Product(sku="BLAT-DRE", name="Blat dębowy 160x80", type=ProductType.POLPRODUKT.value, stock_quantity=40, unit="szt")
            blat_szklo = Product(sku="BLAT-SZK", name="Blat szklany hartowany", type=ProductType.POLPRODUKT.value, stock_quantity=15, unit="szt")
            uchwyt = Product(sku="UCH-01", name="Uchwyt szafki", type=ProductType.POLPRODUKT.value, stock_quantity=500, unit="szt")
            front = Product(sku="FR-MDF", name="Front MDF biały", type=ProductType.POLPRODUKT.value, stock_quantity=100, unit="szt")
            
            db.add_all([noga, blat_drewno, blat_szklo, uchwyt, front])
            db.flush()

            # Produkty gotowe meblowe
            stol_deb = Product(sku="STOL-DEB", name="Stół Dębowy Loft", type=ProductType.PRODUKT.value, stock_quantity=0, unit="szt")
            stol_szklo = Product(sku="STOL-SZK", name="Stół Szklany Modern", type=ProductType.PRODUKT.value, stock_quantity=0, unit="szt")
            szafka = Product(sku="SZAF-01", name="Szafka nocna", type=ProductType.PRODUKT.value, stock_quantity=0, unit="szt")
            
            db.add_all([stol_deb, stol_szklo, szafka])
            db.flush()

            # Receptury meblowe
            db.add_all([
                # Stół Dębowy: 1 blat + 4 nogi
                RecipeItem(parent_product_id=stol_deb.id, component_product_id=blat_drewno.id, quantity=1),
                RecipeItem(parent_product_id=stol_deb.id, component_product_id=noga.id, quantity=4),
                
                # Stół Szklany: 1 blat szklany + 4 nogi
                RecipeItem(parent_product_id=stol_szklo.id, component_product_id=blat_szklo.id, quantity=1),
                RecipeItem(parent_product_id=stol_szklo.id, component_product_id=noga.id, quantity=4),
                
                # Szafka: 2 fronty + 2 uchwyty
                RecipeItem(parent_product_id=szafka.id, component_product_id=front.id, quantity=2),
                RecipeItem(parent_product_id=szafka.id, component_product_id=uchwyt.id, quantity=2),
            ])

            # --- Zestawy Komputerowe ---
            # Półprodukty elektroniczne
            obudowa = Product(sku="CASE-ATX", name="Obudowa ATX", type=ProductType.POLPRODUKT.value, stock_quantity=50, unit="szt")
            zasilacz = Product(sku="PSU-600", name="Zasilacz 600W Gold", type=ProductType.POLPRODUKT.value, stock_quantity=45, unit="szt")
            plyta = Product(sku="MB-B550", name="Płyta główna B550", type=ProductType.POLPRODUKT.value, stock_quantity=30, unit="szt")
            ram = Product(sku="RAM-16GB", name="Pamięć RAM 16GB", type=ProductType.POLPRODUKT.value, stock_quantity=120, unit="szt")
            
            db.add_all([obudowa, zasilacz, plyta, ram])
            db.flush()

            # Produkt gotowy: Komputer Stacjonarny
            pc_office = Product(sku="PC-OFFICE", name="Komputer Biurowy Standard", type=ProductType.PRODUKT.value, stock_quantity=0, unit="szt")
            db.add(pc_office)
            db.flush()

            # Receptura PC: 1 obudowa, 1 zasilacz, 1 płyta, 2x8GB RAM (ilość=2)
            db.add_all([
                RecipeItem(parent_product_id=pc_office.id, component_product_id=obudowa.id, quantity=1),
                RecipeItem(parent_product_id=pc_office.id, component_product_id=zasilacz.id, quantity=1),
                RecipeItem(parent_product_id=pc_office.id, component_product_id=plyta.id, quantity=1),
                RecipeItem(parent_product_id=pc_office.id, component_product_id=ram.id, quantity=2),
            ])

            db.commit()
            print("Dodano różnorodne półprodukty i receptury (Meble, PC).")

        # 4. Dokumenty
        if db.query(Document).count() == 0:
            kontrahenci = db.query(Contractor).all()
            produkty = db.query(Product).filter(Product.type == ProductType.PRODUKT.value).all()

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

                product = random.choice(produkty)
                item = DocumentItem(
                    document_id=doc.id,
                    product_id=product.id,
                    quantity=random.randint(1, 10)
                )
                db.add(item)

            db.commit()
            print("Dodano 10 dokumentów PZ/WZ.")

    except Exception as e:
        print(f"Błąd: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
