ALTER TABLE users
    MODIFY password_hash VARCHAR(255) NULL,
    ADD COLUMN google_subject VARCHAR(255) NULL AFTER password_hash,
    ADD CONSTRAINT uk_users_google_subject UNIQUE (google_subject);
