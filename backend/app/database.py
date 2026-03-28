from sqlmodel import Session, SQLModel, create_engine

DATABASE_URL = 'postgresql://neondb_owner:npg_H0uYLZDPFr2m@ep-mute-flower-anxv13jr-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
engine = create_engine(DATABASE_URL, echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session