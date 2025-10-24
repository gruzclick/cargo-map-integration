-- Добавление полей для хранения версии документов и согласия
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_version INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP;