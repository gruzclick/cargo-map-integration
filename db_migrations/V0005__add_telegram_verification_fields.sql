-- Добавление полей для подтверждения через Telegram
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_code_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_telegram_code ON users(telegram_code);