-- Apply once if Hibernate has not already expanded this enum.
ALTER TABLE job_applications MODIFY COLUMN status ENUM('PENDING','ACCEPTED','REJECTED','WITHDRAWN') NOT NULL;
