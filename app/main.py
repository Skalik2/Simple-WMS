from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import api, views

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(views.router)
app.include_router(api.router)