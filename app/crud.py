from sqlalchemy.orm import Session
from . import models, schemas

def create_document(db: Session, doc_data: schemas.DocumentCreate):
    pass