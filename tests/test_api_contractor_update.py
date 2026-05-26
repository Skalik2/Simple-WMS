import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.main import app
from app.dependencies import get_db
from app import models

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api_update.db"
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

def test_update_contractor_success(client, db_session):
    # Setup
    contractor = models.Contractor(name="Original Name", nip="1234567890")
    db_session.add(contractor)
    db_session.commit()
    db_session.refresh(contractor)
    contractor_id = contractor.id

    # Test
    response = client.put(f"/api/contractors/{contractor_id}", json={"name": "Updated Name", "nip": "0987654321"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == contractor_id
    assert data["name"] == "Updated Name"
    assert data["nip"] == "0987654321"

def test_update_contractor_404(client):
    # Test
    response = client.put("/api/contractors/999", json={"name": "Non-existent", "nip": "000"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Kontrahent nie istnieje"

def test_update_contractor_partial(client, db_session):
    # Setup
    contractor = models.Contractor(name="Original Name", nip="1234567890")
    db_session.add(contractor)
    db_session.commit()
    db_session.refresh(contractor)
    contractor_id = contractor.id

    # Test
    response = client.put(f"/api/contractors/{contractor_id}", json={"name": "New Name"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["nip"] is None
