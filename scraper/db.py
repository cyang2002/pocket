"""
SQLite write layer for scraper.
Both Python scraper and Spring Boot read/write the same SQLite file.
WAL mode is set on every connection to allow concurrent access.
"""
from __future__ import annotations
import sqlite3
from pathlib import Path
from datetime import datetime, timezone

# Path relative to project root (parent of scraper/)
DB_PATH = Path(__file__).parent.parent / "data" / "cardoptimizer.db"

_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS earn_rates (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id       TEXT    NOT NULL,
    category      TEXT    NOT NULL,
    multiplier    REAL    NOT NULL,
    caveats       TEXT,
    last_verified TEXT,
    UNIQUE (card_id, category)
);
CREATE INDEX IF NOT EXISTS idx_earn_rates_card_id ON earn_rates(card_id);
"""


def get_conn(db_path: str | Path = DB_PATH) -> sqlite3.Connection:
    """Open a WAL-mode SQLite connection. Caller owns the connection lifecycle."""
    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    return conn


def ensure_schema(db_path: str | Path = DB_PATH) -> None:
    """Create earn_rates table if not exists. Safe to call repeatedly."""
    with get_conn(db_path) as conn:
        conn.executescript(_CREATE_TABLE_SQL)


def upsert_earn_rate(
    card_id: str,
    category: str,
    multiplier: float,
    caveats: str | None,
    db_path: str | Path = DB_PATH,
) -> None:
    """
    Insert or update a single earn rate record.
    Sets last_verified to current UTC timestamp on every call.
    On conflict (card_id, category), updates multiplier, caveats, last_verified.
    """
    now = datetime.now(timezone.utc).isoformat()
    with get_conn(db_path) as conn:
        conn.execute(
            """
            INSERT INTO earn_rates (card_id, category, multiplier, caveats, last_verified)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (card_id, category) DO UPDATE SET
                multiplier    = excluded.multiplier,
                caveats       = excluded.caveats,
                last_verified = excluded.last_verified
            """,
            (card_id, category, multiplier, caveats, now),
        )
