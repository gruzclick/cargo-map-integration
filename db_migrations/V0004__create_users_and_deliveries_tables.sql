-- Таблица пользователей (клиенты и водители)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'carrier')),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('individual', 'legal')),
    inn VARCHAR(12),
    organization_name VARCHAR(255),
    phone VARCHAR(20),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Таблица перевозчиков (дополнительная информация для водителей)
CREATE TABLE IF NOT EXISTS carriers (
    carrier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(user_id),
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('car', 'truck', 'semi')),
    vehicle_status VARCHAR(20) DEFAULT 'free' CHECK (vehicle_status IN ('free', 'has_space', 'full')),
    capacity DECIMAL(10, 2),
    current_lat DECIMAL(10, 7),
    current_lng DECIMAL(10, 7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carriers_user_id ON carriers(user_id);
CREATE INDEX IF NOT EXISTS idx_carriers_status ON carriers(vehicle_status);

-- Таблица поставок
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES users(user_id),
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    warehouse_address TEXT NOT NULL,
    cargo_quantity INTEGER NOT NULL,
    cargo_unit VARCHAR(20) NOT NULL CHECK (cargo_unit IN ('boxes', 'pallets')),
    weight DECIMAL(10, 2) NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_price DECIMAL(10, 2) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    carrier_id UUID REFERENCES carriers(carrier_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deliveries_client_id ON deliveries(client_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_carrier_id ON deliveries(carrier_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(delivery_date);