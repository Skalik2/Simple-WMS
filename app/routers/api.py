from fastapi import APIRouter, Depends, HTTPException
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
    
@router.get("/products", response_model=List[schemas.ProductResponse])
async def read_products(db: Session = Depends(get_db)):
    return crud.get_products(db)

@router.get("/documents", response_model=List[schemas.DocumentResponse])
async def read_documents(db: Session = Depends(get_db)):
    return crud.get_documents(db)

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