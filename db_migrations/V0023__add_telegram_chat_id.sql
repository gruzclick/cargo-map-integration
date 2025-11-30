-- Добавление поля telegram_chat_id в таблицу users для хранения Telegram chat ID
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT;

-- Создание индекса для быстрого поиска по telegram_chat_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_chat_id 
ON t_p93479485_cargo_map_integratio.users(telegram_chat_id);