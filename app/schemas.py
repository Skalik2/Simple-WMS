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
    purchase_price: float = 0.0
    selling_price: float = 0.0

class DocumentItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float = 0.0

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
    purchase_price: float
    selling_price: float

    model_config = ConfigDict(from_attributes=True)

class DocumentItemResponse(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
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

class ReportChartData(BaseModel):
    name: str
    pz: int
    wz: int

class ReportCards(BaseModel):
    total_ops: int
    top_product: str
    total_stock_value: float

class ReportResponse(BaseModel):
    chart_data: List[ReportChartData]
    cards: ReportCards