
import smtplib
from email.mime.text import MIMEText
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_reminder_email(to_email: str, user_name: str, medicine_name: str,
                        dosage: str, reminder_time: str):
    subject = "Medicine Reminder"
    body = (
        f"Hello {user_name},\n\n"
        f"This is your medicine reminder.\n\n"
        f"Medicine:\n{medicine_name}\n\n"
        f"Dosage:\n{dosage}\n\n"
        f"Reminder Time:\n{reminder_time}\n\n"
        f"Take care and stay healthy!"
    )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email

    
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
