-- Adds recruiter-side deleted job recovery support.
-- Existing jobs remain active by default.

SET @column_exists := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'is_deleted'
);

SET @statement := IF(
    @column_exists = 0,
    'ALTER TABLE jobs ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT ''jobs.is_deleted already exists'''
);

PREPARE migration_statement FROM @statement;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

UPDATE jobs
SET is_deleted = FALSE
WHERE is_deleted IS NULL;
