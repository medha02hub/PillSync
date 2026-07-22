# PillSync

A simple medication reminder app for a college coursework demonstration.

Users can register, log in with JWT, manage their medicines, send email reminders
via Gmail SMTP, and track medication history.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios
- **Backend:** FastAPI + PostgreSQL + psycopg2 (plain SQL) + JWT + Gmail SMTP

## Project Structure

```
project/
├── src/                    # React frontend
│   ├── api.ts              # Axios instance with JWT interceptor
│   ├── auth.tsx            # Auth context (login/register/logout)
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── Navbar.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── Medicines.tsx
│   │   └── History.tsx
│   ├── App.tsx             # Routes
│   └── main.tsx            # Entry point
└── backend/                # FastAPI backend
    ├── main.py             # All API routes
    ├── db.py               # psycopg2 connection helper
    ├── auth.py             # JWT create/verify
    ├── email_sender.py     # Gmail SMTP sender
    ├── schema.sql          # Database tables
    ├── requirements.txt
    └── .env.example        # Copy to .env
```

## Setup

### 1. Database (PostgreSQL)

Create a database named `pillsync`:

```sql
CREATE DATABASE pillsync;
```

Then create the tables by running the schema file:

```bash
psql -d pillsync -f backend/schema.sql
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # then edit .env with your values
```

Fill in your `.env`:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — any random string
- `SMTP_EMAIL` — your Gmail address
- `SMTP_PASSWORD` — a Gmail **App Password** (not your normal password).
  Enable 2FA on your Google account, then create an App Password at
  https://myaccount.google.com/apppasswords

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend

From the project root (a different terminal than the backend):

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Features

- Register with name, email, password, and role (Patient / Caregiver)
- Login with simple JWT authentication (token stored in localStorage)
- View and edit profile (name, email, age, phone)
- Add, edit, delete, and view medicines
- Click **Send Reminder** on a medicine card to send a Gmail SMTP email
- Click **Take Medicine** on a medicine card to record it in history
- View medication history in a simple table

## Notes

- Passwords are stored in plain text (no hashing) — this is intentional for
  the coursework demo and should not be done in production.
- The JWT is stored in localStorage and sent as `Authorization: Bearer <token>`.
- Email reminders are sent manually via a button click (no background scheduler).
