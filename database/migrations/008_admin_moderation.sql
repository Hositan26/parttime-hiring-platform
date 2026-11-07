-- Apply once only when Hibernate has not already created this column.
ALTER TABLE job_posts ADD COLUMN moderation_blocked BOOLEAN NOT NULL DEFAULT FALSE;
