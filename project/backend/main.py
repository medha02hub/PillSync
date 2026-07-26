"""
PillSync — FastAPI application.

Simple routes for auth, profile, medicines, and history.
Uses plain SQL queries via psycopg2.
"""
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from db import get_db
from auth import create_token, verify_token
from email_sender import send_reminder_email
from datetime import date

app = FastAPI(title="PillSync")

# Allow the Vite dev server (localhost:5173) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Pydantic models (request bodies)
# ---------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "Patient" or "Caregiver"


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileRequest(BaseModel):
    name: str
    email: str
    age: int | None = None
    phone: str | None = None


class MedicineRequest(BaseModel):
    medicine_name: str
    dosage: str
    reminder_time: str


# ---------------------------------------------------------------------------
# Auth dependency — extracts user_id from the Bearer token
# ---------------------------------------------------------------------------
def get_current_user(authorization: str = Header(...)) -> int:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ")[1]
    try:
        return verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# AUTH ROUTES
# ---------------------------------------------------------------------------
@app.post("/register")
def register(req: RegisterRequest):
    """Register a new user. Passwords stored directly (no hashing, per spec)."""
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (req.name, req.email, req.password, req.role),
        )
        conn.commit()
    except psycopg2.IntegrityError as e:
        # Duplicate email or constraint violation
        conn.rollback()
        print(f"[REGISTER] IntegrityError: {e}")
        raise HTTPException(status_code=400, detail="Email already registered")
    except psycopg2.Error as e:
        # Database-level error (connection, missing table, etc.)
        conn.rollback()
        print(f"[REGISTER] Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    except Exception as e:
        conn.rollback()
        print(f"[REGISTER] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {e}")
    finally:
        cur.close()
        conn.close()
    return {"message": "User registered successfully"}


@app.post("/login")
def login(req: LoginRequest):
    """Login — compare password directly, return JWT + user info."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, password, role, age, phone FROM users WHERE email = %s",
        (req.email,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row or row[3] != req.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = {
        "id": row[0], "name": row[1], "email": row[2],
        "role": row[4], "age": row[5], "phone": row[6],
    }
    token = create_token(row[0])
    return {"access_token": token, "user": user}


@app.get("/me")
def get_me(user_id: int = Depends(get_current_user)):
    """Return the current logged-in user's profile."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, role, age, phone FROM users WHERE id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": row[0], "name": row[1], "email": row[2],
        "role": row[3], "age": row[4], "phone": row[5],
    }


# ---------------------------------------------------------------------------
# PROFILE ROUTES
# ---------------------------------------------------------------------------
@app.put("/profile")
def update_profile(req: ProfileRequest, user_id: int = Depends(get_current_user)):
    """Update the logged-in user's profile."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE users SET name = %s, email = %s, age = %s, phone = %s WHERE id = %s",
        (req.name, req.email, req.age, req.phone, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Profile updated successfully"}


# ---------------------------------------------------------------------------
# MEDICINE ROUTES
# ---------------------------------------------------------------------------
@app.get("/medicines")
def list_medicines(user_id: int = Depends(get_current_user)):
    """Return all medicines for the logged-in user."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, medicine_name, dosage, reminder_time FROM medicines WHERE user_id = %s ORDER BY id",
        (user_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id": r[0], "medicine_name": r[1], "dosage": r[2], "reminder_time": r[3]}
        for r in rows
    ]


@app.post("/medicines")
def add_medicine(req: MedicineRequest, user_id: int = Depends(get_current_user)):
    """Add a new medicine for the logged-in user."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO medicines (user_id, medicine_name, dosage, reminder_time) VALUES (%s, %s, %s, %s)",
        (user_id, req.medicine_name, req.dosage, req.reminder_time),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Medicine added successfully"}


@app.put("/medicines/{medicine_id}")
def update_medicine(medicine_id: int, req: MedicineRequest,
                    user_id: int = Depends(get_current_user)):
    """Update a medicine (must belong to the logged-in user)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE medicines SET medicine_name = %s, dosage = %s, reminder_time = %s "
        "WHERE id = %s AND user_id = %s",
        (req.medicine_name, req.dosage, req.reminder_time, medicine_id, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Medicine updated successfully"}


@app.delete("/medicines/{medicine_id}")
def delete_medicine(medicine_id: int, user_id: int = Depends(get_current_user)):
    """Delete a medicine (must belong to the logged-in user)."""
    conn = get_db()
    cur = conn.cursor()
    # Also delete related history rows first
    cur.execute(
        "DELETE FROM history WHERE medicine_id = %s", (medicine_id,)
    )
    cur.execute(
        "DELETE FROM medicines WHERE id = %s AND user_id = %s",
        (medicine_id, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Medicine deleted successfully"}


@app.post("/medicines/{medicine_id}/remind")
def send_reminder(medicine_id: int, user_id: int = Depends(get_current_user)):
    """Send a Gmail SMTP reminder email for a medicine."""
    conn = get_db()
    cur = conn.cursor()
    # Get the medicine
    cur.execute(
        "SELECT medicine_name, dosage, reminder_time FROM medicines WHERE id = %s AND user_id = %s",
        (medicine_id, user_id),
    )
    med = cur.fetchone()
    if not med:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Medicine not found")
    # Get the user's email and name
    cur.execute("SELECT name, email FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    send_reminder_email(user[1], user[0], med[0], med[1], med[2])
    return {"message": "Reminder email sent"}


@app.post("/medicines/{medicine_id}/take")
def take_medicine(medicine_id: int, user_id: int = Depends(get_current_user)):
    """Record that a medicine was taken — inserts into the history table."""
    conn = get_db()
    cur = conn.cursor()
    # Verify the medicine belongs to the user
    cur.execute(
        "SELECT id FROM medicines WHERE id = %s AND user_id = %s",
        (medicine_id, user_id),
    )
    if not cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Medicine not found")
    # Insert history record
    cur.execute(
        "INSERT INTO history (medicine_id, taken_date, status) VALUES (%s, %s, %s)",
        (medicine_id, date.today(), "Taken"),
    )
    conn.commit()
    cur.close()
    conn.close()
    return {"message": "Medicine taken recorded"}


# ---------------------------------------------------------------------------
# HISTORY ROUTES
# ---------------------------------------------------------------------------
@app.get("/history")
def list_history(user_id: int = Depends(get_current_user)):
    """Return all medication history for the logged-in user."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT h.id, m.medicine_name, h.taken_date, h.status
        FROM history h
        JOIN medicines m ON h.medicine_id = m.id
        WHERE m.user_id = %s
        ORDER BY h.id DESC
        """,
        (user_id,),
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id": r[0], "medicine_name": r[1], "taken_date": str(r[2]), "status": r[3]}
        for r in rows
    ]
