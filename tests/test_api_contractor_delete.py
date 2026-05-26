import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base
from app.dependencies import get_db
from app import models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api_delete.db"
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

def test_delete_contractor_success():
    # Create test DB
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Add a contractor
    db_contractor = models.Contractor(name="Delete Me", nip="1234567890")
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    contractor_id = db_contractor.id
    db.close()

    # Delete the contractor
    response = client.delete(f"/api/contractors/{contractor_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Kontrahent usunięty pomyślnie"}

    # Verify deletion
    db = TestingSessionLocal()
    deleted_contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    assert deleted_contractor is None
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_delete_contractor_not_found():
    Base.metadata.create_all(bind=engine)
    response = client.delete("/api/contractors/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Kontrahent nie istnieje"
    Base.metadata.drop_all(bind=engine)

def test_delete_contractor_with_documents():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Add a contractor
    db_contractor = models.Contractor(name="Cannot Delete", nip="0987654321")
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    
    # Add a document for this contractor
    db_doc = models.Document(type=models.DocType.PZ, contractor_id=db_contractor.id, created_by="test_user")
    db.add(db_doc)
    db.commit()
    
    contractor_id = db_contractor.id
    db.close()

    # Attempt to delete the contractor
    response = client.delete(f"/api/contractors/{contractor_id}")
    assert response.status_code == 400
    assert "nie można usunąć kontrahenta" in response.json()["detail"].lower()

    # Verify contractor still exists
    db = TestingSessionLocal()
    still_exists = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    assert still_exists is not None
    db.close()
    Base.metadata.drop_all(bind=engine)
