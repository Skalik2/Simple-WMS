from sqlalchemy.orm import Session
from fastapi import HTTPException
from . import models, schemas

def create_document(db: Session, doc_data: schemas.DocumentCreate):
    product = db.query(models.Product).filter(models.Product.id == doc_data.product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail=f"Produkt o ID {doc_data.product_id} nie istnieje.")

    db_document = models.Document(
        type=doc_data.type
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    db_item = models.DocumentItem(
        document_id=db_document.id,
        product_id=doc_data.product_id,
        quantity=doc_data.quantity
    )
    db.add(db_item)

    if doc_data.type in [models.DocType.PZ, models.DocType.PW, models.DocType.ZW]:
        product.stock_quantity += doc_data.quantity
        
    elif doc_data.type in [models.DocType.WZ, models.DocType.RW]:
        if product.stock_quantity < doc_data.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Brak wystarczającej ilości towaru. Na stanie: {product.stock_quantity}, próba wydania: {doc_data.quantity}"
            )
        product.stock_quantity -= doc_data.quantity

    db.commit()
    db.refresh(db_document)
    
    return db_document