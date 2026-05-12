import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from .database import Base

class ProductType(str, enum.Enum):
    PRODUKT = "PRODUKT"
    POLPRODUKT = "POLPRODUKT"

class DocType(str, enum.Enum):
    PZ = "PZ"
    PW = "PW"
    ZW = "ZW"
    WZ = "WZ"
    RW = "RW"

class Contractor(Base):
    __tablename__ = 'contractors'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    nip = Column(String, nullable=True)

class Product(Base):
    __tablename__ = 'products'
    
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)
    type = Column(String, default=ProductType.PRODUKT.value)
    unit = Column(String, default="szt.")
    stock_quantity = Column(Integer, default=0)

class Document(Base):
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(SQLEnum(DocType))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_by = Column(String, index=True, nullable=True)
    
    contractor_id = Column(Integer, ForeignKey('contractors.id'), nullable=True)
    contractor = relationship("Contractor")
    items = relationship("DocumentItem", back_populates="document")

    @property
    def contractor_name(self):
        return self.contractor.name if self.contractor else None
    

class DocumentItem(Base):
    __tablename__ = 'document_items'
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey('documents.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer)
    
    document = relationship("Document", back_populates="items")
    
    product = relationship("Product")

class RecipeItem(Base):
    __tablename__ = 'recipe_items'
    
    id = Column(Integer, primary_key=True, index=True)
    parent_product_id = Column(Integer, ForeignKey('products.id'))
    component_product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer)
    
    parent_product = relationship("Product", foreign_keys=[parent_product_id])
    component_product = relationship("Product", foreign_keys=[component_product_id])