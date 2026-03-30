from pydantic import BaseModel
from datetime import datetime
from typing import List
from .models import DocType, ProductType

class ProductCreate(BaseModel):
    sku: str
    name: str
    type: ProductType

class DocumentItemCreate(BaseModel):
    product_id: int
    quantity: int

class DocumentCreate(BaseModel):
    type: DocType
    items: List[DocumentItemCreate]

class ProductResponse(BaseModel):
    id: int
    sku: str | None = None
    name: str | None = None
    type: ProductType 
    stock_quantity: int

    class Config:
        from_attributes = True

class DocumentItemResponse(BaseModel):
    product_id: int
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    type: DocType
    created_at: datetime
    created_by: str | None = None
    items: List[DocumentItemResponse] = []

    class Config:
        from_attributes = True