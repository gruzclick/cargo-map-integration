CREATE TABLE IF NOT EXISTS cargo (
    id SERIAL PRIMARY KEY,
    cargo_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    details TEXT,
    weight DECIMAL(10, 2),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    driver_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(100),
    capacity DECIMAL(10, 2),
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    status VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cargo (cargo_id, name, details, weight, lat, lng, status) VALUES
('КГ-001', 'Груз #КГ-001', 'Стройматериалы', 500, 55.7558, 37.6173, 'waiting'),
('КГ-002', 'Груз #КГ-002', 'Мебель', 300, 55.7522, 37.6156, 'waiting'),
('КГ-003', 'Груз #КГ-003', 'Электроника', 150, 55.7589, 37.6200, 'waiting'),
('КГ-004', 'Груз #КГ-004', 'Продукты питания', 800, 55.7510, 37.6190, 'waiting'),
('КГ-005', 'Груз #КГ-005', 'Одежда', 200, 55.7600, 37.6150, 'waiting');

INSERT INTO drivers (driver_id, name, vehicle_type, capacity, lat, lng, status) VALUES
('DRV-001', 'Иван Петров', 'Газель', 1.5, 55.7540, 37.6180, 'free'),
('DRV-002', 'Сергей Иванов', 'КАМАЗ', 10, 55.7570, 37.6140, 'free'),
('DRV-003', 'Алексей Смирнов', 'Фургон', 3, 55.7530, 37.6210, 'free'),
('DRV-004', 'Дмитрий Козлов', 'Газель', 1.5, 55.7580, 37.6165, 'busy');
