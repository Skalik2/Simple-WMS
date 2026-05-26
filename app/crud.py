from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import func, case
from datetime import datetime, timedelta, date, timezone
from fastapi import HTTPException
from . import models, schemas

def get_report_stats(db: Session, date_range: str = "7d"):
    today = datetime.now(timezone.utc)
    
    # Determine dialect to use correct SQL functions
    is_sqlite = db.bind.dialect.name == "sqlite"

    if date_range == "30d":
        start_date = today - timedelta(days=30)
        group_by = func.date(models.Document.created_at)
    elif date_range == "1y":
        start_date = today - timedelta(days=365)
        if is_sqlite:
            group_by = func.strftime('%Y-%m', models.Document.created_at)
        else:
            # PostgreSQL compatible
            group_by = func.to_char(models.Document.created_at, 'YYYY-MM')
    else: # 7d
        start_date = today - timedelta(days=7)
        group_by = func.date(models.Document.created_at)

    # 1. Chart Data
    docs = db.query(
        group_by.label("label"),
        func.sum(case((models.Document.type.in_([models.DocType.PZ, models.DocType.PW, models.DocType.ZW]), 1), else_=0)).label("pz"),
        func.sum(case((models.Document.type.in_([models.DocType.WZ, models.DocType.RW]), 1), else_=0)).label("wz")
    ).filter(models.Document.created_at >= start_date).group_by(group_by).order_by("label").all()

    chart_data = [{"name": str(d.label), "pz": int(d.pz or 0), "wz": int(d.wz or 0)} for d in docs]

    # 2. Cards
    total_ops = db.query(models.Document).filter(models.Document.created_at >= start_date).count()
    
    # Top Product (by quantity in document_items)
    top_product_row = db.query(
        models.Product.name,
        func.sum(models.DocumentItem.quantity).label("total_qty")
    ).join(models.DocumentItem).join(models.Document).filter(models.Document.created_at >= start_date).group_by(models.Product.id, models.Product.name).order_by(func.sum(models.DocumentItem.quantity).desc()).first()
    
    top_product = top_product_row.name if top_product_row else "Brak"
    
    # Total Stock Value (sum of stock_quantity * purchase_price)
    total_stock_value = db.query(func.sum(models.Product.stock_quantity * models.Product.purchase_price)).scalar() or 0.0

    return {
        "chart_data": chart_data,
        "cards": {
            "total_ops": total_ops,
            "top_product": top_product,
            "total_stock_value": float(total_stock_value)
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
    
    # OPTYMALIZACJA: Pobranie wszystkich potrzebnych produktów i półproduktów w 2 zapytaniach
    product_ids = [item.product_id for item in doc_data.items]
    
    # Pobieramy receptury dla żądanych produktów
    all_recipes = db.query(models.RecipeItem).filter(models.RecipeItem.parent_product_id.in_(product_ids)).all()
    
    # Zbieramy ID wszystkich składników z receptur
    component_ids = [r.component_product_id for r in all_recipes]
    
    # Pobieramy wszystkie produkty (główne i składniki) JEDNYM zapytaniem
    all_needed_product_ids = set(product_ids + component_ids)
    products = db.query(models.Product).filter(models.Product.id.in_(all_needed_product_ids)).all()
    
    # Słownik dla błyskawicznego dostępu O(1) zamiast zapytań w pętli
    products_map = {p.id: p for p in products}
    
    # Grupowanie receptur po ID rodzica
    recipes_map = {}
    for r in all_recipes:
        recipes_map.setdefault(r.parent_product_id, []).append(r)

    # Przetwarzanie pozycji dokumentu (działa całkowicie na danych w pamięci, bez zapytań SQL!)
    for item_data in doc_data.items:
        product = products_map.get(item_data.product_id)
        
        if not product:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Produkt o ID {item_data.product_id} nie istnieje.")
            
        recipe_items = recipes_map.get(product.id, [])
        
        if doc_data.type in [models.DocType.PZ, models.DocType.PW, models.DocType.ZW]:
            product.stock_quantity += item_data.quantity
            
            for r_item in recipe_items:
                comp = products_map.get(r_item.component_product_id)
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
                comp = products_map.get(r_item.component_product_id)
                if comp:
                    required_qty = item_data.quantity * r_item.quantity
                    if comp.stock_quantity < required_qty:
                        db.rollback()
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Brak półproduktu '{comp.name}' (SKU: {comp.sku}). Na stanie: {comp.stock_quantity}, potrzeba do wydania: {required_qty}"
                        )
                    comp.stock_quantity -= required_qty

        db_item = models.DocumentItem(
            document_id=db_document.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price
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
    query = db.query(models.Document).options(
        joinedload(models.Document.contractor),
        selectinload(models.Document.items)
    ).order_by(models.Document.created_at.desc())
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total

def create_product(db: Session, product_data: schemas.ProductCreate):
    db_product = models.Product(
        sku=product_data.sku,
        name=product_data.name,
        type=product_data.type,
        unit=product_data.unit,
        purchase_price=product_data.purchase_price,
        selling_price=product_data.selling_price,
        stock_quantity=0
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def create_recipe(db: Session, recipe_data: schemas.RecipeCreate):
    parent = db.query(models.Product).filter(models.Product.id == recipe_data.parent_product_id).first()
    if not parent or parent.type == models.ProductType.POLPRODUKT.value:
        raise HTTPException(status_code=400, detail="Tylko produkty gotowe mogą posiadać receptury.")

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

    # OPTYMALIZACJA: Pobieramy wszystkie składniki jednym zapytaniem
    component_ids = [r.component_product_id for r in recipe_items]
    components = db.query(models.Product).filter(models.Product.id.in_(component_ids)).all()
    components_map = {c.id: c for c in components}

    # 1. Walidacja stanów (teraz korzysta ze słownika)
    for r_item in recipe_items:
        comp = components_map.get(r_item.component_product_id)
        required_qty = r_item.quantity * assembly_data.quantity
        if not comp or comp.stock_quantity < required_qty:
            raise HTTPException(status_code=400, detail=f"Brak półproduktu: {comp.name if comp else 'Nieznany'}")

    # 2. Tworzenie dokumentu RW
    rw_doc = models.Document(type=models.DocType.RW, created_by=user_id)
    db.add(rw_doc)
    db.flush()

    for r_item in recipe_items:
        comp = components_map.get(r_item.component_product_id)
        qty_to_issue = r_item.quantity * assembly_data.quantity
        comp.stock_quantity -= qty_to_issue

        db_item = models.DocumentItem(document_id=rw_doc.id, product_id=comp.id, quantity=qty_to_issue)
        db.add(db_item)

    # 3. Tworzenie dokumentu PW dla gotowego produktu
    pw_doc = models.Document(type=models.DocType.PW, created_by=user_id)
    db.add(pw_doc)
    db.flush()

    product.stock_quantity += assembly_data.quantity
    db_item = models.DocumentItem(document_id=pw_doc.id, product_id=product.id, quantity=assembly_data.quantity)
    db.add(db_item)

    db.commit()
    return {"message": "Złożono pomyślnie", "product": product.name, "quantity": assembly_data.quantity}