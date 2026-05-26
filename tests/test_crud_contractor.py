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

def test_delete_contractor_with_documents_fails(db):
    from fastapi import HTTPException
    # 1. Create a contractor
    contractor = crud.create_contractor(db, schemas.ContractorCreate(name="Test Contractor", nip="1234567890"))
    
    # 2. Create a product for the document
    product = crud.create_product(db, schemas.ProductCreate(
        sku="TEST-SKU", name="Test Product", type=models.ProductType.PRODUKT, unit="szt"
    ))
    
    # 3. Create a document linked to this contractor
    doc_data = schemas.DocumentCreate(
        type="PZ",
        contractor_id=contractor.id,
        items=[schemas.DocumentItemCreate(product_id=product.id, quantity=10)]
    )
    crud.create_document(db, doc_data, user_id="test_user")
    
    # 4. Try to delete the contractor
    with pytest.raises(HTTPException) as excinfo:
        crud.delete_contractor(db, contractor.id)
    
    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == "Nie można usunąć kontrahenta, ponieważ posiada on przypisane dokumenty."

def test_delete_contractor_success(db):
    # 1. Create a contractor
    contractor = crud.create_contractor(db, schemas.ContractorCreate(name="Delete Me", nip="0000000000"))
    
    # 2. Delete the contractor
    result = crud.delete_contractor(db, contractor.id)
    
    # 3. Verify
    assert result is True
    deleted_contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor.id).first()
    assert deleted_contractor is None

def test_delete_contractor_not_found(db):
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as excinfo:
        crud.delete_contractor(db, 999)
    assert excinfo.value.status_code == 404
    assert excinfo.value.detail == "Kontrahent nie istnieje"
