-- Добавление поля telegram_chat_id в таблицу admins для восстановления пароля через Telegram
ALTER TABLE t_p93479485_cargo_map_integratio.admins 
ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT NULL;

COMMENT ON COLUMN t_p93479485_cargo_map_integratio.admins.telegram_chat_id IS 'Telegram Chat ID администратора для отправки кодов восстановления пароля';