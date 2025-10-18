-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'carrier')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_order ON chat_messages(order_id, created_at);
CREATE INDEX idx_chat_unread ON chat_messages(order_id, is_read) WHERE is_read = FALSE;

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE,
  client_id UUID NOT NULL,
  carrier_id UUID NOT NULL,
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  carrier_rating INTEGER CHECK (carrier_rating BETWEEN 1 AND 5),
  client_comment TEXT,
  carrier_comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_carrier ON ratings(carrier_id);
CREATE INDEX idx_ratings_client ON ratings(client_id);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  complainant_id UUID NOT NULL,
  accused_id UUID NOT NULL,
  complainant_type TEXT NOT NULL CHECK (complainant_type IN ('client', 'carrier')),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected')),
  admin_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_accused ON complaints(accused_id);

-- Driver status table
CREATE TABLE IF NOT EXISTS driver_status (
  driver_id UUID PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'has_space', 'no_space')),
  current_location_lat DOUBLE PRECISION,
  current_location_lng DOUBLE PRECISION,
  route_start TEXT,
  route_end TEXT,
  available_from DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_status_available ON driver_status(status, available_from) WHERE status IN ('free', 'has_space');

-- Scheduled orders table
CREATE TABLE IF NOT EXISTS scheduled_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  cargo_type TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat DOUBLE PRECISION,
  origin_lng DOUBLE PRECISION,
  destination_lat DOUBLE PRECISION,
  destination_lng DOUBLE PRECISION,
  scheduled_date DATE NOT NULL,
  weight DECIMAL(10, 2),
  volume DECIMAL(10, 2),
  vehicle_type TEXT NOT NULL,
  price DECIMAL(10, 2),
  description TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'cancelled', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduled_orders_date ON scheduled_orders(scheduled_date, status);
CREATE INDEX idx_scheduled_orders_client ON scheduled_orders(client_id);

-- Notifications table for available drivers
CREATE TABLE IF NOT EXISTS driver_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  driver_id UUID NOT NULL,
  order_id UUID,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('driver_available', 'order_match')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_driver_notifications_client ON driver_notifications(client_id, is_read) WHERE is_read = FALSE;