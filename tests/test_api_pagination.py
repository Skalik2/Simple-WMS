import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.main import app
from app.dependencies import get_db
from app import models

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_read_products_pagination():
    # Setup
    db = TestingSessionLocal()
    for i in range(15):
        db.add(models.Product(sku=f"SKU{i:02d}", name=f"Product {i:02d}", type=models.ProductType.PRODUKT, unit="szt"))
    db.commit()
    db.close()

    # Test
    response = client.get("/api/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10

def test_read_documents_pagination():
    # Setup
    db = TestingSessionLocal()
    for i in range(15):
        db.add(models.Document(type=models.DocType.PZ))
    db.commit()
    db.close()

    # Test
    response = client.get("/api/documents?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10

def test_read_contractors_pagination():
    # Setup
    db = TestingSessionLocal()
    for i in range(15):
        db.add(models.Contractor(name=f"Contractor {i:02d}"))
    db.commit()
    db.close()

    # Test
    response = client.get("/api/contractors?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10
