-- Таблица для хранения данных автомобилей перевозчиков
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    car_brand VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_number VARCHAR(20) NOT NULL,
    car_number_photo_url TEXT,
    capacity_boxes INTEGER DEFAULT 0,
    capacity_pallets INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_car_number ON vehicles(car_number);

-- Таблица для заявок перевозчиков (на перевозку груза)
CREATE TABLE IF NOT EXISTS orders_carrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    vehicle_id UUID,
    warehouse_marketplace VARCHAR(100) NOT NULL,
    warehouse_city VARCHAR(100) NOT NULL,
    warehouse_address TEXT NOT NULL,
    warehouse_code VARCHAR(50),
    capacity_boxes INTEGER DEFAULT 0,
    capacity_pallets INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_carrier_user_id ON orders_carrier(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_carrier_status ON orders_carrier(status);
CREATE INDEX IF NOT EXISTS idx_orders_carrier_created_at ON orders_carrier(created_at);

-- Таблица для заявок отправителей (на отправку груза)
CREATE TABLE IF NOT EXISTS orders_shipper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    cargo_type VARCHAR(20) NOT NULL CHECK (cargo_type IN ('box', 'pallet')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    warehouse_marketplace VARCHAR(100) NOT NULL,
    warehouse_city VARCHAR(100) NOT NULL,
    warehouse_address TEXT NOT NULL,
    warehouse_code VARCHAR(50),
    pickup_address TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_shipper_user_id ON orders_shipper(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shipper_status ON orders_shipper(status);
CREATE INDEX IF NOT EXISTS idx_orders_shipper_pickup_date ON orders_shipper(pickup_date);