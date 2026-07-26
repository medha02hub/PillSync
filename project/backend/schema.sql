-- ---------------------------------------------------------------------------
-- PillSync database schema
-- Run this once to create the three tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    age INTEGER,
    phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    reminder_time VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id),
    taken_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Taken'
);
