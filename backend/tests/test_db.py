import os
import tempfile
import pytest
from pathlib import Path

import db
from agent import Assistant


@pytest.fixture
def temp_db():
    """Create a temporary SQLite database for testing."""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = Path(f.name)
    db.init_db(db_path)
    yield db_path
    import gc

    gc.collect()
    try:
        if db_path.exists():
            os.remove(db_path)
    except PermissionError:
        pass



def test_init_db(temp_db):
    """Verify database schema is properly created."""
    conn = db.get_connection(temp_db)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='callers'")
    table = cursor.fetchone()
    conn.close()
    assert table is not None
    assert table["name"] == "callers"


def test_save_and_get_caller(temp_db):
    """Test saving caller with Disaster Response track facts and searching by user_id and name."""
    user_id = "USR-1001"
    name = "Ramesh Kumar"
    lang = "Hindi"
    facts = {
        "location": "Sector 4, Patna",
        "household_size": "5 family members",
        "mobility_needs": "Wheelchair required for grandmother",
        "last_check_in": "Central High School Shelter",
    }
    notes = "Requested clean drinking water and blanket."

    # Save record
    saved = db.save_caller(
        user_id=user_id,
        name=name,
        language_preference=lang,
        facts=facts,
        notes=notes,
        db_path=temp_db,
    )

    assert saved["user_id"] == user_id
    assert saved["name"] == name
    assert saved["language_preference"] == lang
    assert saved["facts"]["location"] == "Sector 4, Patna"
    assert saved["facts"]["household_size"] == "5 family members"
    assert saved["facts"]["mobility_needs"] == "Wheelchair required for grandmother"
    assert saved["facts"]["last_check_in"] == "Central High School Shelter"

    # Lookup by exact user_id
    by_id = db.get_caller(user_id, db_path=temp_db)
    assert by_id is not None
    assert by_id["name"] == "Ramesh Kumar"
    assert by_id["facts"]["location"] == "Sector 4, Patna"

    # Lookup by name (case-insensitive)
    by_name = db.get_caller("ramesh kumar", db_path=temp_db)
    assert by_name is not None
    assert by_name["user_id"] == user_id
    assert by_name["facts"]["mobility_needs"] == "Wheelchair required for grandmother"

    # Lookup non-existent caller
    missing = db.get_caller("NonExistentUser", db_path=temp_db)
    assert missing is None


def test_update_existing_caller(temp_db):
    """Test updating existing caller information."""
    user_id = "USR-2002"
    db.save_caller(
        user_id=user_id,
        name="Anita Sharma",
        language_preference="English",
        facts={"location": "Flood Zone A", "last_check_in": "Evacuated"},
        db_path=temp_db,
    )

    # Update location and last check-in
    updated = db.save_caller(
        user_id=user_id,
        name="Anita Sharma",
        language_preference="English",
        facts={"location": "North Community Center", "last_check_in": "Safe in shelter"},
        notes="All family members accounted for",
        db_path=temp_db,
    )

    assert updated["facts"]["location"] == "North Community Center"
    assert updated["facts"]["last_check_in"] == "Safe in shelter"
    assert updated["notes"] == "All family members accounted for"


@pytest.mark.asyncio
async def test_agent_save_caller_permission_enforcement(monkeypatch, temp_db):
    """Test that agent function tool save_caller_data enforces permission_granted check."""
    # Point db.DEFAULT_DB_PATH to temp_db
    monkeypatch.setattr(db, "DEFAULT_DB_PATH", temp_db)

    assistant = Assistant()

    # Case 1: Permission NOT granted
    res_denied = await assistant.save_caller_data(
        context=None,
        user_id="USR-999",
        name="Suresh",
        location="Zone C",
        permission_granted=False,
    )
    assert "PERMISSION DENIED" in res_denied

    # Verify nothing was saved to DB
    check_db = db.get_caller("USR-999", db_path=temp_db)
    assert check_db is None

    # Case 2: Permission IS granted
    res_granted = await assistant.save_caller_data(
        context=None,
        user_id="USR-999",
        name="Suresh",
        location="Zone C",
        household_size="4",
        mobility_needs="None",
        last_check_in="Evacuation center",
        permission_granted=True,
    )
    assert "SUCCESS" in res_granted

    # Verify saved in DB
    check_db_after = db.get_caller("USR-999", db_path=temp_db)
    assert check_db_after is not None
    assert check_db_after["name"] == "Suresh"
    assert check_db_after["facts"]["location"] == "Zone C"


@pytest.mark.asyncio
async def test_agent_lookup_caller_tool(monkeypatch, temp_db):
    """Test that agent function tool lookup_caller returns caller facts."""
    monkeypatch.setattr(db, "DEFAULT_DB_PATH", temp_db)

    db.save_caller(
        user_id="USR-500",
        name="Priya Patel",
        language_preference="Hindi",
        facts={
            "location": "River Bank Colony",
            "household_size": "3",
            "mobility_needs": "None",
            "last_check_in": "Relief camp 2",
        },
        notes="Requires baby food and medicines",
        db_path=temp_db,
    )

    assistant = Assistant()
    lookup_res = await assistant.lookup_caller(context=None, identifier="Priya Patel")

    assert "Found caller record for Priya Patel" in lookup_res
    assert "River Bank Colony" in lookup_res
    assert "Relief camp 2" in lookup_res
    assert "Requires baby food and medicines" in lookup_res
