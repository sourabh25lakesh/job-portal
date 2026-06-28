-- Adds job skills and admin-approved interview requests.

SET @has_job_skills := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'jobs'
      AND COLUMN_NAME = 'skills'
);

SET @add_job_skills_sql := IF(
    @has_job_skills = 0,
    'ALTER TABLE jobs ADD COLUMN skills TEXT NULL',
    'SELECT 1'
);

PREPARE add_job_skills_stmt FROM @add_job_skills_sql;
EXECUTE add_job_skills_stmt;
DEALLOCATE PREPARE add_job_skills_stmt;

CREATE TABLE IF NOT EXISTS interview_requests (
    id INT NOT NULL AUTO_INCREMENT,
    application_id INT NOT NULL,
    job_id INT NOT NULL,
    recruiter_id INT NOT NULL,
    candidate_id INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_interview_requests_application_id (application_id),
    KEY ix_interview_requests_job_id (job_id),
    KEY ix_interview_requests_recruiter_id (recruiter_id),
    KEY ix_interview_requests_candidate_id (candidate_id),
    KEY ix_interview_requests_status (status),
    CONSTRAINT fk_interview_requests_application_id
        FOREIGN KEY (application_id) REFERENCES applications(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_interview_requests_job_id
        FOREIGN KEY (job_id) REFERENCES jobs(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_interview_requests_recruiter_id
        FOREIGN KEY (recruiter_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_interview_requests_candidate_id
        FOREIGN KEY (candidate_id) REFERENCES users(id)
        ON DELETE CASCADE
);
