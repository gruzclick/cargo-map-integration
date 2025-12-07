-- Добавляем поля telegram_id и phone_number для совместимости
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS telegram_id BIGINT,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Копируем данные из существующих полей если они есть
UPDATE t_p93479485_cargo_map_integratio.users 
SET phone_number = phone 
WHERE phone IS NOT NULL AND (phone_number IS NULL OR phone_number = '');

UPDATE t_p93479485_cargo_map_integratio.users 
SET telegram_id = telegram_chat_id 
WHERE telegram_chat_id IS NOT NULL AND telegram_id IS NULL;

-- Создаем индекс для быстрого поиска по telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON t_p93479485_cargo_map_integratio.users(telegram_id);
