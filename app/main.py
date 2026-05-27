import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from .database import engine, Base
from .routers import api

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Middleware do logowania zapytań
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Unhandled exception during request: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": f"Wewnętrzny błąd serwera: {str(e)}"}
        )

# Globalny handler dla HTTPException (aby logować błędy 4xx/5xx)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP Error {exc.status_code}: {exc.detail} for path {request.url.path}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Uproszczone dla testów, w produkcji podaj konkretne domeny
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router)

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "react-front", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    # Przechwytuje wszystkie ścieżki i zwraca index.html (SPA routing)
    # Wykluczamy ścieżki zaczynające się od /api, aby nie zwracać HTML dla błędnych zapytań API
    @app.get("/{catchall:path}")
    async def serve_react_app(catchall: str, request: Request):
        if request.url.path.startswith("/api"):
            logger.warning(f"API route not found (fell through to catch-all): {request.url.path}")
            return JSONResponse(
                status_code=404,
                content={"detail": f"Ścieżka API '{request.url.path}' nie istnieje."}
            )

        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            return JSONResponse(status_code=404, content={"detail": "Frontend not found"})
else:
    print("Folder dist nie istnieje. Aplikacja działa tylko w trybie API.")