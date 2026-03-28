from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from .database import SessionLocal

security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        unverified_claims = jwt.decode(token, options={"verify_signature": False})
        user_id = unverified_claims.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Brak ID użytkownika w tokenie")
        return user_id
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Nieprawidłowy token autoryzacyjny")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()