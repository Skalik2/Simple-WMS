from app.schemas import ProductCreate, ProductResponse, DocumentItemCreate, DocumentItemResponse
from app.models import ProductType

def test_product_create_prices():
    data = {
        "sku": "SKU123",
        "name": "Test Product",
        "type": ProductType.PRODUKT,
        "unit": "pcs",
        "purchase_price": 10.5,
        "selling_price": 20.0
    }
    product = ProductCreate(**data)
    assert product.purchase_price == 10.5
    assert product.selling_price == 20.0

def test_product_create_prices_default():
    data = {
        "sku": "SKU123",
        "name": "Test Product",
        "type": ProductType.PRODUKT,
        "unit": "pcs"
    }
    product = ProductCreate(**data)
    assert product.purchase_price == 0.0
    assert product.selling_price == 0.0

def test_product_response_prices():
    data = {
        "id": 1,
        "sku": "SKU123",
        "name": "Test Product",
        "type": ProductType.PRODUKT,
        "unit": "pcs",
        "stock_quantity": 10,
        "purchase_price": 10.5,
        "selling_price": 20.0
    }
    product = ProductResponse(**data)
    assert product.purchase_price == 10.5
    assert product.selling_price == 20.0

def test_document_item_create_price():
    data = {
        "product_id": 1,
        "quantity": 5,
        "unit_price": 15.0
    }
    item = DocumentItemCreate(**data)
    assert item.unit_price == 15.0

def test_document_item_create_price_default():
    data = {
        "product_id": 1,
        "quantity": 5
    }
    item = DocumentItemCreate(**data)
    assert item.unit_price == 0.0

def test_document_item_response_price():
    product_data = {
        "id": 1,
        "sku": "SKU123",
        "name": "Test Product",
        "type": ProductType.PRODUKT,
        "unit": "pcs",
        "stock_quantity": 10,
        "purchase_price": 10.5,
        "selling_price": 20.0
    }
    data = {
        "product_id": 1,
        "quantity": 5,
        "unit_price": 15.0,
        "product": product_data
    }
    item = DocumentItemResponse(**data)
    assert item.unit_price == 15.0
