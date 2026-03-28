-- Flyway migration V1: earn_rates table
-- IMMUTABLE once committed. Add new migrations as V2__*.sql, V3__*.sql, etc.
CREATE TABLE IF NOT EXISTS earn_rates (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id       TEXT    NOT NULL,
    category      TEXT    NOT NULL,
    multiplier    REAL    NOT NULL,
    caveats       TEXT,
    last_verified TEXT,    -- ISO-8601 timestamp; NULL = scrape not attempted or failed
    UNIQUE (card_id, category)
);

CREATE INDEX IF NOT EXISTS idx_earn_rates_card_id ON earn_rates(card_id);
