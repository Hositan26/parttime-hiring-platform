-- One-time MySQL 8 upgrade. Local Hibernate update creates these tables automatically.
-- Review and back up before applying. Skip after Hibernate has already created these tables.
CREATE TABLE user_saved_jobs (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_post_id INT NOT NULL,
    UNIQUE KEY uk_saved_user_job (user_id, job_post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
);
CREATE TABLE candidate_profiles (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    summary VARCHAR(2000), skills VARCHAR(2000), experience VARCHAR(5000),
    resume_data LONGBLOB, resume_file_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE user_notifications (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, application_id INT, message VARCHAR(1000) NOT NULL,
    created_at DATETIME(6) NOT NULL, read_at DATETIME(6),
    KEY ix_notification_recipient (user_id, id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE recruitment_interactions (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL, recipient_id INT, application_id INT, job_post_id INT NOT NULL,
    kind ENUM('MESSAGE','INTERVIEW','REPORT') NOT NULL,
    status ENUM('OPEN','ACCEPTED','DECLINED','CANCELLED','RESOLVED') NOT NULL,
    body VARCHAR(2000) NOT NULL, meeting_at DATETIME(6), created_at DATETIME(6) NOT NULL,
    KEY ix_interaction_application (application_id, id),
    KEY ix_interaction_reporter (author_id, kind, id),
    FOREIGN KEY (author_id) REFERENCES users(user_id),
    FOREIGN KEY (recipient_id) REFERENCES users(user_id),
    FOREIGN KEY (application_id) REFERENCES job_applications(application_id),
    FOREIGN KEY (job_post_id) REFERENCES job_posts(job_post_id)
);
