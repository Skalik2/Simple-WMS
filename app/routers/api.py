from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..dependencies import get_db
from .. import schemas, crud

router = APIRouter(prefix="/api")

@router.post("/documents")
async def create_document(data: schemas.DocumentCreate, db: Session = Depends(get_db)):
    
    try:
        document = crud.create_document(db=db, doc_data=data)
        return {
            "message": "Dokument zapisany pomyślnie", 
            "document_id": document.id,
            "type": document.type.value
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Wewnętrzny błąd serwera: {str(e)}")