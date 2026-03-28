import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .database import Base

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
    
    product = relationship("Product")