-- Run only against the disposable urbanpulse_k6 database after loading a dataset.
SELECT current_database() = 'urbanpulse_k6' AS safe_to_explain \gset
\if :safe_to_explain
EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM incidents
WHERE status = 'REPORTED' AND lower(category) = 'street'
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM incidents
ORDER BY created_at DESC
LIMIT 20 OFFSET 1000;

-- Spring Data runs an extra count query for every Page<T> response.
EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*)
FROM incidents
WHERE status = 'REPORTED' AND lower(category) = 'street';

EXPLAIN (ANALYZE, BUFFERS)
SELECT count(*)
FROM incidents;
\else
\echo Refusing to run benchmark queries outside urbanpulse_k6.
\quit 3
\endif
