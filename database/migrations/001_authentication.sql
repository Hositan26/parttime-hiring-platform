-- One-time upgrade from the pre-authentication application schema.
-- Review against the actual database and back up before applying.
-- Skip columns already created by Hibernate local ddl-auto=update.
ALTER TABLE users
    ADD COLUMN auth_version INT NOT NULL DEFAULT 0,
    ADD COLUMN row_version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE email_verification_otps
    MODIFY COLUMN otp_code VARCHAR(64) NOT NULL,
    ADD COLUMN owner_user_id INT NULL,
    ADD COLUMN attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD CONSTRAINT fk_otp_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id);

CREATE INDEX idx_otp_owner_email_expiry
    ON email_verification_otps(owner_user_id, email, expiration_time);

CREATE TABLE auth_refresh_sessions (
    token_hash VARCHAR(64) PRIMARY KEY,
    family VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_refresh_family (family),
    INDEX idx_refresh_user (user_id),
    INDEX idx_refresh_expiry (expires_at)
);

CREATE TABLE auth_revoked_access_tokens (
    id VARCHAR(255) PRIMARY KEY,
    expires_at TIMESTAMP(6) NOT NULL,
    INDEX idx_revoked_expiry (expires_at)
);

CREATE TABLE auth_password_resets (
    token_hash VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_reset_user (user_id),
    INDEX idx_reset_expiry (expires_at)
);

INSERT IGNORE INTO role(role_name, description) VALUES
    ('USER', 'Default User Role'),
    ('EMPLOYER', 'Employer Role'),
    ('ADMIN', 'Administrator Role');
