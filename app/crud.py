from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas

def create_document(db: Session, doc_data: schemas.DocumentCreate, user_id: str):
    db_document = models.Document(
        type=doc_data.type,
        created_by=user_id
    )
    db.add(db_document)
    db.flush()
    
    for item_data in doc_data.items:
        product = db.query(models.Product).filter(models.Product.id == item_data.product_id).first()
        
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Produkt o ID {item_data.product_id} nie istnieje.")
        
        if doc_data.type in [models.DocType.PZ, models.DocType.PW, models.DocType.ZW]:
            product.stock_quantity += item_data.quantity
        elif doc_data.type in [models.DocType.WZ, models.DocType.RW]:
            if product.stock_quantity < item_data.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=400, 
                    detail=f"Brak towaru dla ID {product.id}. Na stanie: {product.stock_quantity}, próba wydania: {item_data.quantity}"
                )
            product.stock_quantity -= item_data.quantity

        db_item = models.DocumentItem(
            document_id=db_document.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_document)
    
    return db_document

def get_products(db: Session):
    return db.query(models.Product).order_by(models.Product.id).all()

def get_documents(db: Session):
    return db.query(models.Document).order_by(models.Document.created_at.desc()).all()

def create_product(db: Session, product_data: schemas.ProductCreate):
    db_product = models.Product(
        sku=product_data.sku,
        name=product_data.name,
        type=product_data.type,
        stock_quantity=0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product