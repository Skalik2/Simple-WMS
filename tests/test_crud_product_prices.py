import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app import models, crud, schemas

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_crud_prices.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_create_product_with_prices(db):
    product_in = schemas.ProductCreate(
        sku="TEST-PRICE", 
        name="Test Product", 
        type=models.ProductType.PRODUKT, 
        unit="szt.",
        purchase_price=10.5, 
        selling_price=20.0
    )
    product = crud.create_product(db, product_in)
    assert product.purchase_price == 10.5
    assert product.selling_price == 20.0
    
    # Verify in DB
    db_check = db.query(models.Product).filter(models.Product.id == product.id).first()
    assert db_check.purchase_price == 10.5
    assert db_check.selling_price == 20.0

def test_create_document_with_item_prices(db):
    # 1. Create a product
    product = crud.create_product(db, schemas.ProductCreate(
        sku="P1", name="Product 1", type=models.ProductType.PRODUKT, unit="szt.",
        purchase_price=5.0, selling_price=10.0
    ))
    
    # 2. Create a document with item price
    doc_data = schemas.DocumentCreate(
        type=models.DocType.PZ,
        items=[
            schemas.DocumentItemCreate(product_id=product.id, quantity=10, unit_price=15.5)
        ]
    )
    doc = crud.create_document(db, doc_data, user_id="test_user")
    
    # 3. Verify
    assert len(doc.items) == 1
    assert doc.items[0].unit_price == 15.5
    
    # Verify in DB
    db_item = db.query(models.DocumentItem).filter(models.DocumentItem.document_id == doc.id).first()
    assert db_item.unit_price == 15.5

def test_create_document_multiple_items_with_prices(db):
    # 1. Create products
    p1 = crud.create_product(db, schemas.ProductCreate(
        sku="P1", name="Product 1", type=models.ProductType.PRODUKT, unit="szt.",
        purchase_price=5.0, selling_price=10.0
    ))
    p2 = crud.create_product(db, schemas.ProductCreate(
        sku="P2", name="Product 2", type=models.ProductType.PRODUKT, unit="szt.",
        purchase_price=8.0, selling_price=15.0
    ))
    
    # 2. Create a document with multiple items and prices
    doc_data = schemas.DocumentCreate(
        type=models.DocType.PZ,
        items=[
            schemas.DocumentItemCreate(product_id=p1.id, quantity=10, unit_price=6.0),
            schemas.DocumentItemCreate(product_id=p2.id, quantity=5, unit_price=9.5)
        ]
    )
    doc = crud.create_document(db, doc_data, user_id="test_user")
    
    # 3. Verify
    assert len(doc.items) == 2
    item1 = next(item for item in doc.items if item.product_id == p1.id)
    item2 = next(item for item in doc.items if item.product_id == p2.id)
    
    assert item1.unit_price == 6.0
    assert item2.unit_price == 9.5
    
    # Verify in DB
    db_items = db.query(models.DocumentItem).filter(models.DocumentItem.document_id == doc.id).all()
    assert len(db_items) == 2
    db_item1 = next(item for item in db_items if item.product_id == p1.id)
    db_item2 = next(item for item in db_items if item.product_id == p2.id)
    assert db_item1.unit_price == 6.0
    assert db_item2.unit_price == 9.5
