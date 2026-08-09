import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

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

    # Override static dummy IDs (e.g. "usr-999", "string", "user") with caller's actual name ID
    dummy_ids = ("user", "string", "default", "none", "usr-999", "usr_999", "suresh")
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


# Automatically initialize DB schema on module import
init_db()
