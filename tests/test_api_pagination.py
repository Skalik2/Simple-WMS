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

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.pop(get_db, None)

def test_read_products_pagination(client, db_session):
    # Setup
    for i in range(15):
        db_session.add(models.Product(sku=f"SKU{i:02d}", name=f"Product {i:02d}", type=models.ProductType.PRODUKT, unit="szt"))
    db_session.commit()

    # Test
    response = client.get("/api/products?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10

def test_read_documents_pagination(client, db_session):
    # Setup
    for i in range(15):
        db_session.add(models.Document(type=models.DocType.PZ))
    db_session.commit()

    # Test
    response = client.get("/api/documents?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10

def test_read_contractors_pagination(client, db_session):
    # Setup
    for i in range(15):
        db_session.add(models.Contractor(name=f"Contractor {i:02d}"))
    db_session.commit()

    # Test
    response = client.get("/api/contractors?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 10
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10
