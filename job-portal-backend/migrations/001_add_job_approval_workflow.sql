-- Job approval workflow migration for MySQL.
-- Run this once before deploying the backend code that reads jobs.status.

SET @has_approval_status := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'approval_status'
);

SET @has_status := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'status'
);

SET @rename_sql := IF(
    @has_approval_status = 1 AND @has_status = 0,
    'ALTER TABLE jobs RENAME COLUMN approval_status TO status',
    'SELECT 1'
);

PREPARE rename_stmt FROM @rename_sql;
EXECUTE rename_stmt;
DEALLOCATE PREPARE rename_stmt;

SET @has_status := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'status'
);

SET @add_status_sql := IF(
    @has_status = 0,
    'ALTER TABLE jobs ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT ''pending''',
    'SELECT 1'
);

PREPARE add_status_stmt FROM @add_status_sql;
EXECUTE add_status_stmt;
DEALLOCATE PREPARE add_status_stmt;

SET @has_rejection_reason := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'rejection_reason'
);

SET @add_rejection_reason_sql := IF(
    @has_rejection_reason = 0,
    'ALTER TABLE jobs ADD COLUMN rejection_reason TEXT NULL',
    'SELECT 1'
);

PREPARE add_rejection_reason_stmt FROM @add_rejection_reason_sql;
EXECUTE add_rejection_reason_stmt;
DEALLOCATE PREPARE add_rejection_reason_stmt;

SET @has_created_at := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'created_at'
);

SET @add_created_at_sql := IF(
    @has_created_at = 0,
    'ALTER TABLE jobs ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
    'SELECT 1'
);

PREPARE add_created_at_stmt FROM @add_created_at_sql;
EXECUTE add_created_at_stmt;
DEALLOCATE PREPARE add_created_at_stmt;

SET @has_updated_at := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'updated_at'
);

SET @add_updated_at_sql := IF(
    @has_updated_at = 0,
    'ALTER TABLE jobs ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'SELECT 1'
);

PREPARE add_updated_at_stmt FROM @add_updated_at_sql;
EXECUTE add_updated_at_stmt;
DEALLOCATE PREPARE add_updated_at_stmt;

UPDATE jobs
SET status = 'pending'
WHERE status IS NULL
   OR TRIM(status) = '';

UPDATE jobs
SET status = LOWER(TRIM(status))
WHERE status IS NOT NULL;

UPDATE jobs
SET status = 'pending'
WHERE status NOT IN ('pending', 'approved', 'rejected');

SET @has_status_index := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND INDEX_NAME = 'ix_jobs_status'
);

SET @add_status_index_sql := IF(
    @has_status_index = 0,
    'CREATE INDEX ix_jobs_status ON jobs (status)',
    'SELECT 1'
);

PREPARE add_status_index_stmt FROM @add_status_index_sql;
EXECUTE add_status_index_stmt;
DEALLOCATE PREPARE add_status_index_stmt;

SET @has_created_index := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND INDEX_NAME = 'ix_jobs_created_at'
);

SET @add_created_index_sql := IF(
    @has_created_index = 0,
    'CREATE INDEX ix_jobs_created_at ON jobs (created_at)',
    'SELECT 1'
);

PREPARE add_created_index_stmt FROM @add_created_index_sql;
EXECUTE add_created_index_stmt;
DEALLOCATE PREPARE add_created_index_stmt;
