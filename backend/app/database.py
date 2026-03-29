from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import text

DATABASE_URL = 'postgresql://neondb_owner:npg_H0uYLZDPFr2m@ep-mute-flower-anxv13jr-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def run_migrations() -> None:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE listing ADD COLUMN IF NOT EXISTS price_per_hour FLOAT"))
        conn.execute(text("ALTER TABLE booking ADD COLUMN IF NOT EXISTS booking_type TEXT NOT NULL DEFAULT 'daily'"))
        conn.execute(text("ALTER TABLE booking ADD COLUMN IF NOT EXISTS start_time TEXT"))
        conn.execute(text("ALTER TABLE booking ADD COLUMN IF NOT EXISTS end_time TEXT"))
        conn.commit()


def get_session():
    with Session(engine) as session:
        yield session