from typing import List
from app.schemas import PageResponse, ProductResponse
from app.models import ProductType

def test_page_response_schema():
    items = [
        ProductResponse(id=1, sku="SKU1", name="Product 1", type=ProductType.PRODUKT, unit="pcs", stock_quantity=10),
        ProductResponse(id=2, sku="SKU2", name="Product 2", type=ProductType.PRODUKT, unit="pcs", stock_quantity=20)
    ]
    page_data = {
        "items": items,
        "total": 10,
        "page": 1,
        "page_size": 2
    }
    response = PageResponse[ProductResponse](**page_data)
    assert response.items == items
    assert response.total == 10
    assert response.page == 1
    assert response.page_size == 2
