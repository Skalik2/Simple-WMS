from pydantic import BaseModel
from datetime import datetime
from typing import List
from .models import DocType

class DocumentCreate(BaseModel):
    type: DocType
    product_id: int
    quantity: int

class ProductResponse(BaseModel):
    id: int
    sku: str | None = None
    name: str | None = None
    stock_quantity: int

    class Config:
        from_attributes = True

class DocumentItemResponse(BaseModel):
    product_id: int
    quantity: int

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