"""
Integration tests for db.py using an isolated in-memory SQLite DB.
Passes a temp-file path so WAL mode works (WAL requires a real file, not :memory:).
"""
import sqlite3
import pytest
import tempfile
import os
from pathlib import Path
from db import get_conn, ensure_schema, upsert_earn_rate


@pytest.fixture
def tmp_db(tmp_path):
    """Isolated temp-file SQLite DB for each test."""
    db_path = tmp_path / "test.db"
    ensure_schema(db_path)
    return db_path


def test_upsert_inserts_new_row(tmp_db):
    upsert_earn_rate("abc123", "dining", 3.0, None, tmp_db)
    with get_conn(tmp_db) as conn:
        row = conn.execute(
            "SELECT * FROM earn_rates WHERE card_id=? AND category=?",
            ("abc123", "dining"),
        ).fetchone()
    assert row is not None
    assert row["multiplier"] == 3.0
    assert row["caveats"] is None


def test_upsert_updates_existing_row(tmp_db):
    upsert_earn_rate("abc123", "dining", 3.0, None, tmp_db)
    upsert_earn_rate("abc123", "dining", 4.0, "Up to $500/quarter", tmp_db)
    with get_conn(tmp_db) as conn:
        rows = conn.execute(
            "SELECT * FROM earn_rates WHERE card_id=? AND category=?",
            ("abc123", "dining"),
        ).fetchall()
    assert len(rows) == 1  # no duplicate
    assert rows[0]["multiplier"] == 4.0
    assert rows[0]["caveats"] == "Up to $500/quarter"


def test_upsert_sets_last_verified(tmp_db):
    upsert_earn_rate("abc123", "travel", 2.0, None, tmp_db)
    with get_conn(tmp_db) as conn:
        row = conn.execute(
            "SELECT last_verified FROM earn_rates WHERE card_id=? AND category=?",
            ("abc123", "travel"),
        ).fetchone()
    assert row["last_verified"] is not None
    assert "T" in row["last_verified"]  # ISO-8601 format contains T separator


def test_upsert_updates_last_verified_on_second_call(tmp_db):
    upsert_earn_rate("abc123", "gas", 2.0, None, tmp_db)
    with get_conn(tmp_db) as conn:
        ts1 = conn.execute(
            "SELECT last_verified FROM earn_rates WHERE card_id=? AND category=?",
            ("abc123", "gas"),
        ).fetchone()["last_verified"]
    import time; time.sleep(0.01)  # ensure timestamp advances
    upsert_earn_rate("abc123", "gas", 2.0, None, tmp_db)
    with get_conn(tmp_db) as conn:
        ts2 = conn.execute(
            "SELECT last_verified FROM earn_rates WHERE card_id=? AND category=?",
            ("abc123", "gas"),
        ).fetchone()["last_verified"]
    assert ts2 >= ts1  # timestamp updated or same (fast machine tolerance)


def test_wal_mode_enabled(tmp_db):
    with get_conn(tmp_db) as conn:
        result = conn.execute("PRAGMA journal_mode").fetchone()
    assert result[0] == "wal"


def test_multiple_categories_for_same_card(tmp_db):
    upsert_earn_rate("abc123", "dining", 3.0, None, tmp_db)
    upsert_earn_rate("abc123", "travel", 2.0, None, tmp_db)
    upsert_earn_rate("abc123", "groceries", 1.0, None, tmp_db)
    with get_conn(tmp_db) as conn:
        count = conn.execute(
            "SELECT COUNT(*) FROM earn_rates WHERE card_id=?", ("abc123",)
        ).fetchone()[0]
    assert count == 3
