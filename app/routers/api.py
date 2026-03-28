from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..dependencies import get_db
from .. import schemas

router = APIRouter(prefix="/api")

@router.post("/documents")
async def create_document(data: schemas.DocumentCreate, db: Session = Depends(get_db)):
    print(f"Otrzymano dokument z frontendu: {data}")
    return {"message": "Otrzymano dokument"}