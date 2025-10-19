-- Добавление полей для безопасности и rate limiting
ALTER TABLE t_p93479485_cargo_map_integratio.users
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_attempt TIMESTAMP,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(50);

-- Создание таблицы для логирования попыток входа
CREATE TABLE IF NOT EXISTS t_p93479485_cargo_map_integratio.login_logs (
    log_id SERIAL PRIMARY KEY,
    user_id UUID,
    email VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON t_p93479485_cargo_map_integratio.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip ON t_p93479485_cargo_map_integratio.login_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON t_p93479485_cargo_map_integratio.login_logs(created_at);
