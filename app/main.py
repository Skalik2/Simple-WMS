import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .routers import api

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Konfiguracja CORS (pozwala Reactowi z portu 3000 lub 5173 na odpytywanie API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router)

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "react-front", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    # Przechwytuje wszystkie ścieżki i zwraca index.html (konieczne dla React Router w przyszłości)
    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    print("Folder dist nie istnieje. Aplikacja działa tylko w trybie API.")