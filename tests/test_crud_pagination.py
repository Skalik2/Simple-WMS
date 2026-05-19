import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app import models, crud

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
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

def test_get_contractors_pagination(db):
    # Setup: add 15 contractors
    for i in range(15):
        db_contractor = models.Contractor(name=f"Contractor {i:02d}", nip=f"12345678{i:02d}")
        db.add(db_contractor)
    db.commit()

    # Test pagination: first page
    items, total = crud.get_contractors(db, skip=0, limit=10)
    assert len(items) == 10
    assert total == 15
    assert items[0].name == "Contractor 00"

    # Test pagination: second page
    items, total = crud.get_contractors(db, skip=10, limit=10)
    assert len(items) == 5
    assert total == 15
    assert items[0].name == "Contractor 10"

def test_get_products_pagination(db):
    # Setup: add 15 products
    for i in range(15):
        db_product = models.Product(sku=f"SKU{i:02d}", name=f"Product {i:02d}")
        db.add(db_product)
    db.commit()

    # Test pagination: first page
    items, total = crud.get_products(db, skip=0, limit=10)
    assert len(items) == 10
    assert total == 15

    # Test pagination: second page
    items, total = crud.get_products(db, skip=10, limit=10)
    assert len(items) == 5
    assert total == 15

def test_get_documents_pagination(db):
    # Setup: add 15 documents
    for i in range(15):
        db_doc = models.Document(type=models.DocType.PZ)
        db.add(db_doc)
    db.commit()

    # Test pagination: first page
    items, total = crud.get_documents(db, skip=0, limit=10)
    assert len(items) == 10
    assert total == 15

    # Test pagination: second page
    items, total = crud.get_documents(db, skip=10, limit=10)
    assert len(items) == 5
    assert total == 15
