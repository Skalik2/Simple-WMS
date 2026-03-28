from app.database import SessionLocal
from app.models import Product

def seed_products():
    db = SessionLocal()
    
    try:
        if db.query(Product).count() > 0:
            print("W bazie danych znajdują się już produkty.")
            return

        sample_products = [
            Product(sku="SKU-001", name="Klawiatura Mechaniczna RGB", stock_quantity=50),
            Product(sku="SKU-002", name="Myszka Bezprzewodowa", stock_quantity=120),
            Product(sku="SKU-003", name="Monitor 27 cali IPS", stock_quantity=30),
            Product(sku="SKU-004", name="Kabel HDMI 2m", stock_quantity=200),
            Product(sku="SKU-005", name="Podkładka pod mysz XL", stock_quantity=85),
        ]

        db.add_all(sample_products)
        
        db.commit()
        print("Pomyślnie dodano")

    except Exception as e:
        print(e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()