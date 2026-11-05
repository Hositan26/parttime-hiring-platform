-- Preserve legacy unpublished rows as closed listings before dropping DRAFT.
UPDATE job_posts SET status = 'CLOSED' WHERE status = 'DRAFT';

-- The original schema creates an unnamed check that would still reject PAUSED.
SET @legacy_status_check = (
    SELECT tc.CONSTRAINT_NAME
    FROM information_schema.TABLE_CONSTRAINTS tc
    JOIN information_schema.CHECK_CONSTRAINTS cc
      ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
     AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
    WHERE tc.TABLE_SCHEMA = DATABASE()
      AND tc.TABLE_NAME = 'job_posts'
      AND tc.CONSTRAINT_TYPE = 'CHECK'
      AND LOWER(cc.CHECK_CLAUSE) LIKE '%status%draft%'
    LIMIT 1
);

SET @drop_legacy_status_check = IF(
    @legacy_status_check IS NULL,
    'SELECT 1',
    CONCAT('ALTER TABLE job_posts DROP CHECK `', REPLACE(@legacy_status_check, '`', '``'), '`')
);
PREPARE drop_status_check FROM @drop_legacy_status_check;
EXECUTE drop_status_check;
DEALLOCATE PREPARE drop_status_check;

ALTER TABLE job_posts MODIFY COLUMN status ENUM('ACTIVE', 'CLOSED', 'EXPIRED', 'PAUSED') NOT NULL;
