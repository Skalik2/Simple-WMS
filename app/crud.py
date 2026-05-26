from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, date
from fastapi import HTTPException
from . import models, schemas

def get_report_stats(db: Session, date_range: str = "7d"):
    today = datetime.now()
    if date_range == "30d":
        start_date = today - timedelta(days=30)
        group_by = func.date(models.Document.created_at)
    elif date_range == "1y":
        start_date = today - timedelta(days=365)
        group_by = func.strftime('%Y-%m', models.Document.created_at)
    else: # 7d
        start_date = today - timedelta(days=7)
        group_by = func.date(models.Document.created_at)

    # 1. Chart Data
    docs = db.query(
        group_by.label("label"),
        func.count(models.Document.id).filter(models.Document.type.in_([models.DocType.PZ, models.DocType.PW, models.DocType.ZW])).label("pz"),
        func.count(models.Document.id).filter(models.Document.type.in_([models.DocType.WZ, models.DocType.RW])).label("wz")
    ).filter(models.Document.created_at >= start_date).group_by("label").order_by("label").all()

    chart_data = [{"name": d.label, "pz": d.pz, "wz": d.wz} for d in docs]

    # 2. Cards
    total_ops = db.query(models.Document).filter(models.Document.created_at >= start_date).count()
    
    # Top Product (by quantity in document_items)
    top_product_row = db.query(
        models.Product.name,
        func.sum(models.DocumentItem.quantity).label("total_qty")
    ).join(models.DocumentItem).join(models.Document).filter(models.Document.created_at >= start_date).group_by(models.Product.id).order_by(func.sum(models.DocumentItem.quantity).desc()).first()
    
    top_product = top_product_row.name if top_product_row else "Brak"
    
    # Total Stock Value (sum of all stock_quantity)
    total_stock = db.query(func.sum(models.Product.stock_quantity)).scalar() or 0

    return {
        "chart_data": chart_data,
        "cards": {
            "total_ops": total_ops,
            "top_product": top_product,
            "total_stock": total_stock
        }
    }

def get_contractors(db: Session, skip: int = 0, limit: int = 10) -> tuple[list[models.Contractor], int]:
    query = db.query(models.Contractor).order_by(models.Contractor.name)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total

def create_contractor(db: Session, contractor_data: schemas.ContractorCreate):
    db_contractor = models.Contractor(
        name=contractor_data.name,
        nip=contractor_data.nip
    )
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    return db_contractor

def update_contractor(db: Session, contractor_id: int, data: schemas.ContractorUpdate) -> models.Contractor | None:
    db_contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    if not db_contractor:
        return None
    db_contractor.name = data.name
    db_contractor.nip = data.nip
    db.commit()
    db.refresh(db_contractor)
    return db_contractor

def delete_contractor(db: Session, contractor_id: int):
    contractor = db.query(models.Contractor).filter(models.Contractor.id == contractor_id).first()
    if not contractor:
        raise HTTPException(status_code=404, detail="Kontrahent nie istnieje")
    
    # Check for linked documents
    doc_count = db.query(models.Document).filter(models.Document.contractor_id == contractor_id).count()
    if doc_count > 0:
        raise HTTPException(
            status_code=400, 
            detail="Nie można usunąć kontrahenta, ponieważ posiada on przypisane dokumenty."
        )
    
    db.delete(contractor)
    db.commit()
    return True

def create_document(db: Session, doc_data: schemas.DocumentCreate, user_id: str):
    db_document = models.Document(
        type=doc_data.type,
        created_by=user_id,
        contractor_id=doc_data.contractor_id
    )
    db.add(db_document)
    db.flush()
    
    for item_data in doc_data.items:
        product = db.query(models.Product).filter(models.Product.id == item_data.product_id).first()
        
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Produkt o ID {item_data.product_id} nie istnieje.")
            
        recipe_items = db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id == product.id).all()
        
        if doc_data.type in [models.DocType.PZ, models.DocType.PW, models.DocType.ZW]:
            product.stock_quantity += item_data.quantity
            
            for r_item in recipe_items:
                comp = db.query(models.Product).filter(models.Product.id == r_item.component_product_id).first()
                if comp:
                    comp.stock_quantity += (item_data.quantity * r_item.quantity)
                    
        elif doc_data.type in [models.DocType.WZ, models.DocType.RW]:
            if product.stock_quantity < item_data.quantity:
                db.rollback()
                raise HTTPException(
                    status_code=400, 
                    detail=f"Brak towaru dla ID {product.id}. Na stanie: {product.stock_quantity}, próba wydania: {item_data.quantity}"
                )
            
            product.stock_quantity -= item_data.quantity
            
            for r_item in recipe_items:
                comp = db.query(models.Product).filter(models.Product.id == r_item.component_product_id).first()
                if comp:
                    required_qty = item_data.quantity * r_item.quantity
                    if comp.stock_quantity < required_qty:
                        db.rollback()
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Brak półproduktu '{comp.name}' (SKU: {comp.sku}). Na stanie: {comp.stock_quantity}, potrzeba do wydania całego zestawu: {required_qty}"
                        )
                    comp.stock_quantity -= required_qty

        db_item = models.DocumentItem(
            document_id=db_document.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_document)
    
    return db_document

def get_products(db: Session, skip: int = 0, limit: int = 10) -> tuple[list[models.Product], int]:
    query = db.query(models.Product).order_by(models.Product.id)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total

def get_documents(db: Session, skip: int = 0, limit: int = 10) -> tuple[list[models.Document], int]:
    query = db.query(models.Document).order_by(models.Document.created_at.desc())
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total

def create_product(db: Session, product_data: schemas.ProductCreate):
    db_product = models.Product(
        sku=product_data.sku,
        name=product_data.name,
        type=product_data.type,
        unit=product_data.unit,
        stock_quantity=0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def create_recipe(db: Session, recipe_data: schemas.RecipeCreate):
    # Check if parent is a finished product
    parent = db.query(models.Product).filter(models.Product.id == recipe_data.parent_product_id).first()
    if not parent or parent.type == models.ProductType.POLPRODUKT.value:
        raise HTTPException(status_code=400, detail="Tylko produkty gotowe mogą posiadać receptury.")

    # Check for self-reference
    for item in recipe_data.items:
        if item.component_product_id == recipe_data.parent_product_id:
            raise HTTPException(status_code=400, detail="Produkt nie może być składnikiem samego siebie.")
            
    db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id == recipe_data.parent_product_id).delete()
    
    db_items = []
    for item in recipe_data.items:
        db_item = models.RecipeItem(
            parent_product_id=recipe_data.parent_product_id,
            component_product_id=item.component_product_id,
            quantity=item.quantity
        )
        db.add(db_item)
        db_items.append(db_item)
        
    db.commit()
    return db_items

def get_recipe(db: Session, parent_id: int):
    return db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id == parent_id).all()

def assemble_product(db: Session, assembly_data: schemas.ProductAssembly, user_id: str):
    product = db.query(models.Product).filter(models.Product.id == assembly_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produkt nie istnieje.")

    recipe_items = db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id == product.id).all()
    if not recipe_items:
        raise HTTPException(status_code=400, detail="Produkt nie ma zdefiniowanej receptury.")

    # 1. Validate components stock
    for r_item in recipe_items:
        comp = db.query(models.Product).filter(models.Product.id == r_item.component_product_id).first()
        required_qty = r_item.quantity * assembly_data.quantity
        if not comp or comp.stock_quantity < required_qty:
            raise HTTPException(status_code=400, detail=f"Brak półproduktu: {comp.name if comp else 'Nieznany'}")

    # 2. Create RW (Internal Issue) for components
    rw_doc = models.Document(type=models.DocType.RW, created_by=user_id)
    db.add(rw_doc)
    db.flush()

    for r_item in recipe_items:
        comp = db.query(models.Product).filter(models.Product.id == r_item.component_product_id).first()
        qty_to_issue = r_item.quantity * assembly_data.quantity
        comp.stock_quantity -= qty_to_issue

        db_item = models.DocumentItem(document_id=rw_doc.id, product_id=comp.id, quantity=qty_to_issue)
        db.add(db_item)

    # 3. Create PW (Internal Receipt) for product
    pw_doc = models.Document(type=models.DocType.PW, created_by=user_id)
    db.add(pw_doc)
    db.flush()

    product.stock_quantity += assembly_data.quantity
    db_item = models.DocumentItem(document_id=pw_doc.id, product_id=product.id, quantity=assembly_data.quantity)
    db.add(db_item)

    db.commit()
    return {"message": "Złożono pomyślnie", "product": product.name, "quantity": assembly_data.quantity}