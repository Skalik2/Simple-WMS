import os
import enum
from datetime import datetime
from dotenv import load_dotenv

from fastapi import FastAPI, Request, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from sqlalchemy import create_engine, Column, Integer, String, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DocType(str, enum.Enum):
    PZ = "PZ"
    PW = "PW"
    ZW = "ZW"
    WZ = "WZ"
    RW = "RW"

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    stock_quantity = Column(Integer, default=0)

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True, index=True)
    type = Column(SQLEnum(DocType))
    created_at = Column(DateTime, default=datetime.utcnow)
    items = relationship("DocumentItem", back_populates="document")

class DocumentItem(Base):
    __tablename__ = 'document_items'
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey('documents.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer)
    
    document = relationship("Document", back_populates="items")

Base.metadata.create_all(bind=engine)

app = FastAPI()
templates = Jinja2Templates(directory="templates")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def read_gui(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/api/documents")
async def create_document(data: dict, db: Session = Depends(get_db)):
    print(f"Otrzymano dokument z frontendu: {data}")
    return {"message": "Dane dotarły do backendu!"}