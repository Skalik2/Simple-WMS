from pydantic import BaseModel
from .models import DocType

class DocumentCreate(BaseModel):
    type: DocType
    product_id: int
    quantity: int