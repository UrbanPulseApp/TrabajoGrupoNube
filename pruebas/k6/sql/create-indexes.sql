-- Run only against the disposable urbanpulse_k6 database after seeding it.
SELECT current_database() = 'urbanpulse_k6' AS safe_to_index \gset
\if :safe_to_index
CREATE INDEX IF NOT EXISTS idx_incidents_status_lower_category_created_at
    ON incidents (status, lower(category), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at
    ON incidents (created_at DESC);
ANALYZE incidents;
\echo Created k6 comparison indexes in urbanpulse_k6.
\else
\echo Refusing to create benchmark indexes outside urbanpulse_k6.
\quit 3
\endif
