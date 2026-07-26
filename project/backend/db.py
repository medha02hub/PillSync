"""
PillSync — database connection helper.

Opens one psycopg2 connection per request and closes it when done.
Keeps things simple — no connection pooling, no ORM.
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()


def get_db():
    """Return a new psycopg2 connection using the DATABASE_URL env var."""
    return psycopg2.connect(os.getenv("DATABASE_URL"))
