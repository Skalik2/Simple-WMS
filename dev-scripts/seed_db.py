from app.database import SessionLocal
from app.models import Product, Contractor, Document, DocumentItem, DocType
from datetime import datetime, timezone

def seed_db():
    db = SessionLocal()
    try:
        if db.query(Contractor).count() == 0:
            c1 = Contractor(name="Logistyka Plus Sp. z o.o.", nip="5210001234")
            c2 = Contractor(name="Hurtownia Tech-Spec", nip="7770005566")
            db.add_all([c1, c2])
            db.commit()
            print("Dodano kontrahentów.")

        if db.query(Product).count() == 0:
            p1 = Product(sku="APP-001", name="iPhone 15 Pro", stock_quantity=10, unit="szt")
            p2 = Product(sku="SAM-099", name="Monitor Samsung 32'", stock_quantity=5, unit="szt")
            db.add_all([p1, p2])
            db.commit()
            print("Dodano produkty.")

        if db.query(Document).count() == 0:
            kontrahent = db.query(Contractor).first()
            produkt = db.query(Product).first()

            doc_pz = Document(
                type=DocType.PZ,
                contractor_id=kontrahent.id,
                created_by="system_seed",
                created_at=datetime.now(timezone.utc)
            )
            db.add(doc_pz)
            db.flush()

            item_pz = DocumentItem(
                document_id=doc_pz.id,
                product_id=produkt.id,
                quantity=5
            )
            db.add(item_pz)

            doc_wz = Document(
                type=DocType.WZ,
                contractor_id=kontrahent.id,
                created_by="system_seed",
                created_at=datetime.now(timezone.utc)
            )
            db.add(doc_wz)
            db.flush()

            item_wz = DocumentItem(
                document_id=doc_wz.id,
                product_id=produkt.id,
                quantity=2
            )
            db.add(item_wz)

            db.commit()
            print("Dodano przykładowe dokumenty PZ/WZ.")

    except Exception as e:
        print(f"Błąd: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()