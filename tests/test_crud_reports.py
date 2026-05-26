import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from datetime import datetime, timedelta
from app import crud, models, schemas

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
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

def test_get_report_stats_empty(db):
    # Test with no data
    stats = crud.get_report_stats(db, date_range="7d")
    assert "chart_data" in stats
    assert "cards" in stats
    assert stats["chart_data"] == []
    assert stats["cards"]["total_ops"] == 0
    assert stats["cards"]["top_product"] == "Brak"
    assert stats["cards"]["total_stock"] == 0

def test_get_report_stats_with_data(db):
    # Create test data
    product = models.Product(
        name="Test Product", 
        sku="TEST-1", 
        stock_quantity=100,
        type=models.ProductType.PRODUKT.value,
        unit="szt"
    )
    db.add(product)
    db.commit()
    
    contractor = models.Contractor(name="Test Contractor", nip="1234567890")
    db.add(contractor)
    db.commit()
    
    doc = models.Document(
        type=models.DocType.PZ, 
        contractor_id=contractor.id, 
        created_at=datetime.now(),
        created_by="test_user"
    )
    db.add(doc)
    db.commit()
    
    item = models.DocumentItem(document_id=doc.id, product_id=product.id, quantity=10)
    db.add(item)
    db.commit()
    
    stats = crud.get_report_stats(db, date_range="7d")
    assert stats["cards"]["total_ops"] == 1
    assert stats["cards"]["top_product"] == "Test Product"
    assert stats["cards"]["total_stock"] == 100
    assert len(stats["chart_data"]) > 0
    assert stats["chart_data"][0]["pz"] == 1
    assert stats["chart_data"][0]["wz"] == 0

def test_get_report_stats_1y_range(db):
    product = models.Product(name="P1", sku="S1", stock_quantity=10, type="PRODUKT", unit="szt")
    db.add(product)
    db.commit()
    
    now = datetime.now()
    # One doc from 10 days ago
    doc1 = models.Document(type=models.DocType.PZ, created_at=now - timedelta(days=10))
    # One doc from 40 days ago
    doc2 = models.Document(type=models.DocType.PZ, created_at=now - timedelta(days=40))
    db.add_all([doc1, doc2])
    db.commit()
    
    # 30d should only see doc1
    stats_30d = crud.get_report_stats(db, date_range="30d")
    assert stats_30d["cards"]["total_ops"] == 1
    
    # 1y should see both
    stats_1y = crud.get_report_stats(db, date_range="1y")
    assert stats_1y["cards"]["total_ops"] == 2
    # And grouping should be by month (YYYY-MM)
    for entry in stats_1y["chart_data"]:
        assert len(entry["name"]) == 7 # YYYY-MM
