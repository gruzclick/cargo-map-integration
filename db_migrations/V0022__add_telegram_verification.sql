CREATE TABLE IF NOT EXISTS telegram_verification_codes (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    telegram_username VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_verification_user ON telegram_verification_codes(user_id);
CREATE INDEX idx_telegram_verification_expires ON telegram_verification_codes(expires_at);

ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_verified BOOLEAN DEFAULT FALSE;
