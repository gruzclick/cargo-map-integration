-- Создаём таблицу для "избранного"
CREATE TABLE IF NOT EXISTS t_p93479485_cargo_map_integratio.favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    target_user_id VARCHAR(255) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Создаём таблицу для сохранённых маршрутов
CREATE TABLE IF NOT EXISTS t_p93479485_cargo_map_integratio.saved_routes (
    route_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    route_name VARCHAR(255) NOT NULL,
    from_address TEXT NOT NULL,
    from_lat DECIMAL(10, 8),
    from_lng DECIMAL(11, 8),
    to_address TEXT NOT NULL,
    to_lat DECIMAL(10, 8),
    to_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP
);

-- Создаём таблицу для истории экспорта
CREATE TABLE IF NOT EXISTS t_p93479485_cargo_map_integratio.export_history (
    export_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    export_type VARCHAR(50) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER,
    records_count INTEGER
);

-- Создаём индексы для производительности
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON t_p93479485_cargo_map_integratio.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON t_p93479485_cargo_map_integratio.saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON t_p93479485_cargo_map_integratio.export_history(user_id);
