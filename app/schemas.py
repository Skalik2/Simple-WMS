from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Generic, TypeVar
from .models import DocType, ProductType

T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int

    model_config = ConfigDict(from_attributes=True)

class ContractorResponse(BaseModel):
    id: int
    name: str
    nip: str | None = None

    model_config = ConfigDict(from_attributes=True)

class ProductCreate(BaseModel):
    sku: str
    name: str
    type: ProductType
    unit: str

class DocumentItemCreate(BaseModel):
    product_id: int
    quantity: int

class DocumentCreate(BaseModel):
    type: DocType
    contractor_id: int | None = None
    items: List[DocumentItemCreate]

class ProductResponse(BaseModel):
    id: int
    sku: str | None = None
    name: str | None = None
    type: ProductType
    unit: str
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)

class DocumentItemResponse(BaseModel):
    product_id: int
    quantity: int
    product: ProductResponse

    model_config = ConfigDict(from_attributes=True)

class DocumentResponse(BaseModel):
    id: int
    type: DocType
    created_at: datetime
    created_by: str | None = None
    contractor_name: str | None = None
    items: List[DocumentItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class ContractorCreate(BaseModel):
    name: str
    nip: str | None = None

class ContractorUpdate(BaseModel):
    name: str
    nip: str | None = None

class RecipeItemCreate(BaseModel):
    component_product_id: int
    quantity: int

class RecipeCreate(BaseModel):
    parent_product_id: int
    items: List[RecipeItemCreate]

class ProductAssembly(BaseModel):
    product_id: int
    quantity: int