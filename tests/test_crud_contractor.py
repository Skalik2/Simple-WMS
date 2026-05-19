import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app import models, crud, schemas

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
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

def test_update_contractor(db):
    # Setup: create a contractor
    db_contractor = models.Contractor(name="Original Name", nip="1234567890")
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    contractor_id = db_contractor.id

    # Update data
    update_data = schemas.ContractorUpdate(name="Updated Name", nip="0987654321")
    
    # Action
    updated_contractor = crud.update_contractor(db, contractor_id, update_data)

    # Assertions
    assert updated_contractor is not None
    assert updated_contractor.name == "Updated Name"
    assert updated_contractor.nip == "0987654321"
    
    # Verify in DB
    db_check = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    assert db_check.name == "Updated Name"
    assert db_check.nip == "0987654321"

def test_update_contractor_not_found(db):
    update_data = schemas.ContractorUpdate(name="Updated Name", nip="0987654321")
    updated_contractor = crud.update_contractor(db, 999, update_data)
    assert updated_contractor is None
