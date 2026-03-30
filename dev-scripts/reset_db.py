from sqlalchemy import text
from app.database import engine, Base
from app import models

print("Usuwanie wszystkich tabel (wymuszone kaskadowo)...")
with engine.connect() as conn:
    conn.execute(text("DROP SCHEMA public CASCADE;"))
    conn.execute(text("CREATE SCHEMA public;"))
    conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
    conn.commit()

print("Tworzenie tabel na nowo z aktualnego models.py...")
Base.metadata.create_all(bind=engine)

print("Baza danych została pomyślnie zresetowana!")