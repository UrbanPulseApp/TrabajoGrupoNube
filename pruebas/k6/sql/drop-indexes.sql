-- Run only against the disposable urbanpulse_k6 database.
SELECT current_database() = 'urbanpulse_k6' AS safe_to_drop \gset
\if :safe_to_drop
DROP INDEX IF EXISTS idx_incidents_status_lower_category_created_at;
DROP INDEX IF EXISTS idx_incidents_created_at;
ANALYZE incidents;
\echo Removed k6 comparison indexes from urbanpulse_k6.
\else
\echo Refusing to remove indexes outside urbanpulse_k6.
\quit 3
\endif
