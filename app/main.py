from fastapi import FastAPI
from .database import engine, Base
from .routers import api, views

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(views.router)
app.include_router(api.router)