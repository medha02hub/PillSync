# PillSync Backend

This directory contains the production-ready FastAPI backend for PillSync, a medicine reminder application.

## What is included

- FastAPI application with a root `main.py` entry point
- Modular package layout for API, models, schemas, services, middleware, authentication, utils, core, and database layers
- SQLAlchemy 2.0 session and base model setup
- Alembic migration scaffolding
- Environment variable support via `python-dotenv`

## Run locally

1. Create and activate a virtual environment.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `.env.example` to `.env` and update the values.
4. Start the app with `uvicorn main:app --reload`.
