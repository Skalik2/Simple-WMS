from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..dependencies import get_db, get_current_user_id
from .. import schemas, crud

router = APIRouter(prefix="/api")

@router.post("/documents")
async def create_document(
    data: schemas.DocumentCreate, 
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        document = crud.create_document(db=db, doc_data=data, user_id=user_id)
        return {
            "message": "Dokument zapisany pomyślnie", 
            "document_id": document.id,
            "type": document.type.value,
            "created_by": document.created_by
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wewnętrzny błąd serwera: {str(e)}")
    
@router.get("/products", response_model=schemas.PageResponse[schemas.ProductResponse])
async def read_products(
    page: int = Query(1, ge=1), 
    page_size: int = Query(10, ge=1, le=1000), 
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    items, total = crud.get_products(db, skip=skip, limit=page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/documents", response_model=schemas.PageResponse[schemas.DocumentResponse])
async def read_documents(
    page: int = Query(1, ge=1), 
    page_size: int = Query(10, ge=1, le=1000), 
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    items, total = crud.get_documents(db, skip=skip, limit=page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/products", response_model=schemas.ProductResponse)
async def create_new_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_product(db=db, product_data=product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Błąd podczas dodawania produktu: {str(e)}")
    
@router.post("/recipes")
async def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    try:
        crud.create_recipe(db=db, recipe_data=recipe)
        return {"message": "Receptura zapisana pomyślnie"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Błąd podczas zapisu receptury: {str(e)}")
    
@router.get("/products/{product_id}/recipe")
async def get_product_recipe(product_id: int, db: Session = Depends(get_db)):
    recipe_items = crud.get_recipe(db, product_id)
    return [
        {
            "component_product_id": item.component_product_id,
            "quantity": item.quantity,
            "name": item.component_product.name
        } for item in recipe_items
    ]

@router.post("/products/assemble")
async def assemble_product(
    data: schemas.ProductAssembly, 
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    try:
        return crud.assemble_product(db=db, assembly_data=data, user_id=user_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/contractors", response_model=schemas.PageResponse[schemas.ContractorResponse])
async def read_contractors(
    page: int = Query(1, ge=1), 
    page_size: int = Query(10, ge=1, le=1000), 
    db: Session = Depends(get_db)
):
    skip = (page - 1) * page_size
    items, total = crud.get_contractors(db, skip=skip, limit=page_size)
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.post("/contractors", response_model=schemas.ContractorResponse)
async def create_new_contractor(contractor: schemas.ContractorCreate, db: Session = Depends(get_db)):
    return crud.create_contractor(db=db, contractor_data=contractor)

@router.put("/contractors/{contractor_id}", response_model=schemas.ContractorResponse)
async def update_contractor(contractor_id: int, data: schemas.ContractorUpdate, db: Session = Depends(get_db)):
    contractor = crud.update_contractor(db, contractor_id, data)
    if not contractor:
        raise HTTPException(status_code=404, detail="Kontrahent nie istnieje")
    return contractor

@router.delete("/contractors/{contractor_id}")
async def delete_contractor(contractor_id: int, db: Session = Depends(get_db)):
    try:
        crud.delete_contractor(db, contractor_id)
        return {"message": "Kontrahent usunięty pomyślnie"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports/stats", response_model=schemas.ReportResponse)
async def read_report_stats(range: str = Query("7d"), db: Session = Depends(get_db)):
    if range not in ["7d", "30d", "1y"]:
        raise HTTPException(status_code=400, detail="Nieprawidłowy zakres")
    return crud.get_report_stats(db, date_range=range)