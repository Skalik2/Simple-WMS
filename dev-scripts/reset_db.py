from app.database import engine, Base
from app import models

print("Usuwanie wszystkich tabel...")
Base.metadata.drop_all(bind=engine)

print("Tworzenie tabel na nowo...")
Base.metadata.create_all(bind=engine)

print("Baza danych została zresetowana!")