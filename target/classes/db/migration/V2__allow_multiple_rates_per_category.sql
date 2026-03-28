-- Flyway migration V2: allow multiple earn rates per (card_id, category)
-- Recreates earn_rates without UNIQUE(card_id, category) so we can store
-- e.g. 8x Chase Travel + 4x flights direct + 4x hotels direct as separate rows.
-- IMMUTABLE once committed. Add new changes as V3__*.sql, etc.

CREATE TABLE earn_rates_new (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id       TEXT    NOT NULL,
    category      TEXT    NOT NULL,
    multiplier    REAL    NOT NULL,
    caveats       TEXT,
    last_verified TEXT,
    is_rotating   INTEGER NOT NULL DEFAULT 0
);

INSERT INTO earn_rates_new SELECT id, card_id, category, multiplier, caveats, last_verified, is_rotating FROM earn_rates;

DROP TABLE earn_rates;

ALTER TABLE earn_rates_new RENAME TO earn_rates;

CREATE INDEX IF NOT EXISTS idx_earn_rates_card_id ON earn_rates(card_id);
