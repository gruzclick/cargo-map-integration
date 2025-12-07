-- Создаём таблицу для временных сессий Telegram авторизации
CREATE TABLE IF NOT EXISTS t_p93479485_cargo_map_integratio.telegram_auth_sessions (
    session_token VARCHAR(100) PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(100),
    telegram_first_name VARCHAR(100),
    telegram_last_name VARCHAR(100),
    telegram_photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

-- Индекс для быстрой очистки истёкших сессий
CREATE INDEX IF NOT EXISTS idx_telegram_auth_expires ON t_p93479485_cargo_map_integratio.telegram_auth_sessions(expires_at);

-- Индекс для поиска по telegram_user_id
CREATE INDEX IF NOT EXISTS idx_telegram_auth_user_id ON t_p93479485_cargo_map_integratio.telegram_auth_sessions(telegram_user_id);