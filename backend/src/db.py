import json
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# Default database file location in the backend directory
DEFAULT_DB_PATH = Path(__file__).parent.parent / "caller_data.db"


def get_connection(db_path: Optional[Path | str] = None) -> sqlite3.Connection:
    """Get SQLite database connection with row factory enabled."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: Optional[Path | str] = None) -> None:
    """Initialize the callers table schema if it does not exist."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS callers (
                user_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                language_preference TEXT DEFAULT 'English',
                location TEXT DEFAULT '',
                household_size TEXT DEFAULT '',
                mobility_needs TEXT DEFAULT '',
                last_check_in TEXT DEFAULT '',
                notes TEXT DEFAULT '',
                last_interaction TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS escalation_requests (
                ticket_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                caller_name TEXT NOT NULL,
                issue_type TEXT NOT NULL,
                summary TEXT NOT NULL,
                urgency_level TEXT NOT NULL,
                location TEXT DEFAULT '',
                preferred_contact TEXT DEFAULT 'Phone Call',
                status TEXT DEFAULT 'OPEN',
                resolution_notes TEXT DEFAULT '',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()


def get_caller(identifier: str, db_path: Optional[Path | str] = None) -> Optional[Dict[str, Any]]:
    """
    Look up a caller by user_id or name (case-insensitive search).
    Returns record dictionary adhering to standard caller record format or None if not found.
    """
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    if not identifier:
        return None

    clean_id = identifier.strip()
    normalized_id = clean_id.lower().replace(" ", "_")

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM callers
            WHERE user_id = ? OR LOWER(user_id) = ? OR LOWER(name) = LOWER(?) OR LOWER(user_id) = LOWER(?)
            """,
            (clean_id, normalized_id, clean_id, clean_id),
        )
        row = cursor.fetchone()
        if not row:
            cursor.execute(
                "SELECT * FROM callers WHERE LOWER(name) LIKE LOWER(?) OR LOWER(user_id) LIKE LOWER(?)",
                (f"%{clean_id}%", f"%{normalized_id}%"),
            )
            row = cursor.fetchone()

        if not row:
            return None

        return {
            "user_id": row["user_id"],
            "name": row["name"],
            "language_preference": row["language_preference"],
            "facts": {
                "location": row["location"] or "",
                "household_size": row["household_size"] or "",
                "mobility_needs": row["mobility_needs"] or "",
                "last_check_in": row["last_check_in"] or "",
            },
            "notes": row["notes"] or "",
            "last_interaction": row["last_interaction"],
        }


def get_latest_caller(db_path: Optional[Path | str] = None) -> Optional[Dict[str, Any]]:
    """Retrieve the most recently saved or updated caller record in the database."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM callers ORDER BY last_interaction DESC LIMIT 1")
        row = cursor.fetchone()
        if not row:
            return None

        return {
            "user_id": row["user_id"],
            "name": row["name"],
            "language_preference": row["language_preference"],
            "facts": {
                "location": row["location"] or "",
                "household_size": row["household_size"] or "",
                "mobility_needs": row["mobility_needs"] or "",
                "last_check_in": row["last_check_in"] or "",
            },
            "notes": row["notes"] or "",
            "last_interaction": row["last_interaction"],
        }


def save_caller(
    user_id: str,
    name: str,
    language_preference: str = "English",
    facts: Optional[Dict[str, str]] = None,
    notes: str = "",
    db_path: Optional[Path | str] = None,
) -> Dict[str, Any]:
    """
    Insert or update a caller record in SQLite database.
    Normalizes generic user_ids to lowercased name so lookups by name are consistent.
    """
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    if facts is None:
        facts = {}

    clean_name = (name or "").strip()
    clean_name_id = clean_name.lower().replace(" ", "_")

    # Override static generic place-holder IDs (e.g. "string", "user", "anonymous") with caller's actual name ID
    dummy_ids = ("user", "string", "default", "none", "anonymous")
    if not user_id or user_id.strip().lower() in dummy_ids or user_id.startswith("voice_assistant_user_"):
        if clean_name_id:
            user_id = clean_name_id
        else:
            user_id = f"caller_{int(datetime.now().timestamp())}"

    location = facts.get("location", "")
    household_size = facts.get("household_size", "")
    mobility_needs = facts.get("mobility_needs", "")
    last_check_in = facts.get("last_check_in", "")
    now_iso = datetime.now(timezone.utc).isoformat()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO callers (
                user_id, name, language_preference, location,
                household_size, mobility_needs, last_check_in, notes, last_interaction
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                name = excluded.name,
                language_preference = excluded.language_preference,
                location = excluded.location,
                household_size = excluded.household_size,
                mobility_needs = excluded.mobility_needs,
                last_check_in = excluded.last_check_in,
                notes = excluded.notes,
                last_interaction = excluded.last_interaction
            """,
            (
                user_id,
                clean_name if clean_name else name,
                language_preference,
                location,
                household_size,
                mobility_needs,
                last_check_in,
                notes,
                now_iso,
            ),
        )
        conn.commit()

    return {
        "user_id": user_id,
        "name": clean_name if clean_name else name,
        "language_preference": language_preference,
        "facts": {
            "location": location,
            "household_size": household_size,
            "mobility_needs": mobility_needs,
            "last_check_in": last_check_in,
        },
        "notes": notes,
        "last_interaction": now_iso,
    }


def delete_caller(identifier: str, db_path: Optional[Path | str] = None) -> bool:
    """Delete a caller record from SQLite database by user_id or name."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    if not identifier:
        return False

    clean_id = identifier.strip()
    normalized_id = clean_id.lower().replace(" ", "_")

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            DELETE FROM callers
            WHERE user_id = ? OR LOWER(user_id) = ? OR LOWER(name) = LOWER(?) OR LOWER(user_id) = LOWER(?)
            """,
            (clean_id, normalized_id, clean_id, clean_id),
        )
        conn.commit()
        return cursor.rowcount > 0


def clear_all_callers(db_path: Optional[Path | str] = None) -> None:
    """Wipe all saved caller records from SQLite database to start fresh."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM callers")
        conn.commit()



def sanitize_summary(text: str) -> str:
    """
    Remove private sensitive details (phone numbers, emails, SSN/Aadhaar/national IDs, credit card numbers, passwords/pins)
    from summary string before storing or broadcasting to human dispatchers.
    """
    if not text:
        return ""
    
    sanitized = text
    # 1. Redact Email addresses
    sanitized = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED_EMAIL]', sanitized)
    
    # 2. Redact Phone numbers (international and 10-digit / hyphenated / parenthesized formats)
    sanitized = re.sub(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED_PHONE]', sanitized)
    sanitized = re.sub(r'\b\d{10}\b', '[REDACTED_PHONE]', sanitized)
    
    # 3. Redact SSN / Aadhaar / 12-digit national IDs
    sanitized = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '[REDACTED_NATIONAL_ID]', sanitized)
    sanitized = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_SSN]', sanitized)
    
    # 4. Redact Credit Card numbers (13-19 digits)
    sanitized = re.sub(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b', '[REDACTED_CARD]', sanitized)
    
    # 5. Redact explicit passwords / PINs keywords
    sanitized = re.sub(r'(?i)\b(pin|password|passcode)\s*[:=]\s*\S+', r'\1: [REDACTED]', sanitized)
    
    return sanitized


def save_escalation_request(
    user_id: str,
    caller_name: str,
    issue_type: str,
    summary: str,
    urgency_level: str,
    location: str = "",
    preferred_contact: str = "Phone Call",
    db_path: Optional[Path | str] = None,
) -> Dict[str, Any]:
    """
    Save an escalation ticket with PII redaction and duplicate prevention.
    If an open or in-progress request already exists for the caller/location, updates it instead of creating a duplicate.
    Urgency priority: EMERGENCY > HIGH > MEDIUM > LOW
    """
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    clean_summary = sanitize_summary(summary)
    norm_urgency = (urgency_level or "MEDIUM").strip().upper()
    valid_urgencies = {"LOW", "MEDIUM", "HIGH", "EMERGENCY"}
    if norm_urgency not in valid_urgencies:
        norm_urgency = "HIGH" if "critical" in norm_urgency.lower() or "emergency" in norm_urgency.lower() else "MEDIUM"

    urgency_weight = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "EMERGENCY": 4}

    clean_name = (caller_name or "Anonymous Caller").strip()
    clean_id = (user_id or clean_name.lower().replace(" ", "_")).strip()

    now_iso = datetime.now(timezone.utc).isoformat()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        
        # Check for existing OPEN or IN_PROGRESS escalation request for this caller or user_id or location
        cursor.execute(
            """
            SELECT * FROM escalation_requests
            WHERE (LOWER(user_id) = LOWER(?) OR LOWER(caller_name) = LOWER(?))
              AND status IN ('OPEN', 'IN_PROGRESS')
            ORDER BY updated_at DESC LIMIT 1
            """,
            (clean_id, clean_name),
        )
        existing = cursor.fetchone()

        if existing:
            # Update duplicate ticket
            ticket_id = existing["ticket_id"]
            old_summary = existing["summary"]
            old_urgency = existing["urgency_level"]
            
            # Combine summaries if new info is present
            if clean_summary not in old_summary:
                updated_summary = f"{old_summary} | UPDATE: {clean_summary}"
            else:
                updated_summary = old_summary

            # Elevate urgency level if higher
            new_weight = urgency_weight.get(norm_urgency, 2)
            old_weight = urgency_weight.get(old_urgency, 2)
            final_urgency = norm_urgency if new_weight > old_weight else old_urgency

            # Update issue_type if more specific
            final_issue = existing["issue_type"] if issue_type in existing["issue_type"] else f"{existing['issue_type']} / {issue_type}"
            final_loc = location if location else existing["location"]

            cursor.execute(
                """
                UPDATE escalation_requests
                SET summary = ?, urgency_level = ?, issue_type = ?, location = ?, updated_at = ?
                WHERE ticket_id = ?
                """,
                (updated_summary, final_urgency, final_issue, final_loc, now_iso, ticket_id),
            )
            conn.commit()

            return {
                "ticket_id": ticket_id,
                "user_id": clean_id,
                "caller_name": clean_name,
                "issue_type": final_issue,
                "summary": updated_summary,
                "urgency_level": final_urgency,
                "location": final_loc,
                "preferred_contact": preferred_contact,
                "status": existing["status"],
                "resolution_notes": existing["resolution_notes"] or "",
                "created_at": existing["created_at"],
                "updated_at": now_iso,
                "is_updated": True,
            }

        else:
            # Create new ticket
            import random
            ticket_id = f"ESC-{random.randint(10000, 99999)}"

            cursor.execute(
                """
                INSERT INTO escalation_requests (
                    ticket_id, user_id, caller_name, issue_type, summary,
                    urgency_level, location, preferred_contact, status,
                    resolution_notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ticket_id,
                    clean_id,
                    clean_name,
                    issue_type,
                    clean_summary,
                    norm_urgency,
                    location,
                    preferred_contact,
                    "OPEN",
                    "",
                    now_iso,
                    now_iso,
                ),
            )
            conn.commit()

            return {
                "ticket_id": ticket_id,
                "user_id": clean_id,
                "caller_name": clean_name,
                "issue_type": issue_type,
                "summary": clean_summary,
                "urgency_level": norm_urgency,
                "location": location,
                "preferred_contact": preferred_contact,
                "status": "OPEN",
                "resolution_notes": "",
                "created_at": now_iso,
                "updated_at": now_iso,
                "is_updated": False,
            }


def get_escalation(identifier: str, db_path: Optional[Path | str] = None) -> Optional[Dict[str, Any]]:
    """Look up an escalation request by ticket_id or caller_name or user_id."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH
    if not identifier:
        return None

    clean_id = identifier.strip()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM escalation_requests
            WHERE UPPER(ticket_id) = UPPER(?) OR LOWER(user_id) = LOWER(?) OR LOWER(caller_name) = LOWER(?)
            ORDER BY updated_at DESC LIMIT 1
            """,
            (clean_id, clean_id, clean_id),
        )
        row = cursor.fetchone()
        if not row:
            cursor.execute(
                "SELECT * FROM escalation_requests WHERE LOWER(caller_name) LIKE LOWER(?) ORDER BY updated_at DESC LIMIT 1",
                (f"%{clean_id}%",),
            )
            row = cursor.fetchone()
        if not row:
            return None

        return dict(row)


def update_escalation_status(
    ticket_id: str,
    new_status: str,
    resolution_notes: str = "",
    db_path: Optional[Path | str] = None,
) -> Optional[Dict[str, Any]]:
    """Update escalation ticket status (OPEN, IN_PROGRESS, RESOLVED) and notes."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    clean_ticket = ticket_id.strip()
    norm_status = new_status.strip().upper()

    now_iso = datetime.now(timezone.utc).isoformat()

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE escalation_requests
            SET status = ?, resolution_notes = ?, updated_at = ?
            WHERE UPPER(ticket_id) = UPPER(?)
            """,
            (norm_status, resolution_notes, now_iso, clean_ticket),
        )
        conn.commit()

    return get_escalation(clean_ticket, db_path=db_path)


def list_all_escalations(status_filter: str = "", db_path: Optional[Path | str] = None) -> List[Dict[str, Any]]:
    """List all escalation tickets in database, optionally filtered by status."""
    if db_path is None:
        db_path = DEFAULT_DB_PATH

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        if status_filter:
            cursor.execute(
                "SELECT * FROM escalation_requests WHERE UPPER(status) = UPPER(?) ORDER BY updated_at DESC",
                (status_filter.strip(),),
            )
        else:
            cursor.execute("SELECT * FROM escalation_requests ORDER BY updated_at DESC")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


# Automatically initialize DB schema on module import
init_db()
