-- Run only against the disposable urbanpulse_k6 database.
-- Usage: psql -h localhost -U postgres -d urbanpulse_k6 -v target_rows=100000 -f seed-volume.sql
SELECT (current_database() = 'urbanpulse_k6' AND :target_rows BETWEEN 1 AND 1000000) AS safe_to_seed \gset

\if :safe_to_seed
BEGIN;
TRUNCATE TABLE incidents, status_changes, assignments, attachments, urban_contexts CASCADE;

INSERT INTO incidents (id, title, description, category, latitude, longitude, status, created_at)
SELECT gen_random_uuid(),
       'K6 synthetic incident ' || row_number,
       'Synthetic row for reproducible k6 volume experiments.',
       CASE row_number % 4
           WHEN 0 THEN 'STREET'
           WHEN 1 THEN 'WATER'
           WHEN 2 THEN 'LIGHTING'
           ELSE 'CLEANING'
       END,
       36.7201 + ((row_number % 2000) - 1000) / 100000.0,
       -4.4214 + ((row_number % 2000) - 1000) / 100000.0,
       CASE WHEN row_number % 3 = 0 THEN 'VALIDATED' ELSE 'REPORTED' END,
       NOW() - (row_number * INTERVAL '1 second')
FROM generate_series(1, :target_rows) AS row_number;
COMMIT;
ANALYZE incidents;
\echo Seeded :target_rows incidents in urbanpulse_k6.
\else
\echo Refusing to seed: use database urbanpulse_k6 and target_rows between 1 and 1000000.
\quit 3
\endif
