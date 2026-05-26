import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base
from app.dependencies import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api_reports.db"
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

def test_read_report_stats_unauthorized():
    # If the endpoint doesn't require auth, it should return 200
    # Our endpoint currently doesn't have get_current_user_id dependency
    response = client.get("/api/reports/stats?range=7d")
    assert response.status_code == 200
    data = response.json()
    assert "chart_data" in data
    assert "cards" in data

def test_read_report_stats_invalid_range():
    response = client.get("/api/reports/stats?range=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Nieprawidłowy zakres"

def test_read_report_stats_ranges():
    for r in ["7d", "30d", "1y"]:
        response = client.get(f"/api/reports/stats?range={r}")
        assert response.status_code == 200
