-- Добавление полей для водителей
ALTER TABLE t_p93479485_cargo_map_integratio.drivers 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS free_space NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS destination_warehouse VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Добавление полей для грузов (клиентов)
ALTER TABLE t_p93479485_cargo_map_integratio.cargo
ADD COLUMN IF NOT EXISTS ready_status VARCHAR(50) DEFAULT 'ready',
ADD COLUMN IF NOT EXISTS ready_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS quantity INTEGER,
ADD COLUMN IF NOT EXISTS destination_warehouse VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS client_rating NUMERIC(3,2) DEFAULT 5.00 CHECK (client_rating >= 0 AND client_rating <= 5);

-- Обновление существующих записей водителей
UPDATE t_p93479485_cargo_map_integratio.drivers 
SET 
  rating = 4.5 + (RANDOM() * 0.5),
  free_space = capacity * (0.5 + RANDOM() * 0.5),
  destination_warehouse = CASE 
    WHEN id % 3 = 0 THEN 'Склад А (ул. Промышленная, 15)'
    WHEN id % 3 = 1 THEN 'Склад Б (ул. Складская, 8)'
    ELSE 'Склад В (ул. Логистическая, 22)'
  END,
  phone = '+7 (' || (900 + FLOOR(RANDOM() * 100)::INT) || ') ' || 
          LPAD((100 + FLOOR(RANDOM() * 900)::INT)::TEXT, 3, '0') || '-' ||
          LPAD((10 + FLOOR(RANDOM() * 90)::INT)::TEXT, 2, '0') || '-' ||
          LPAD((10 + FLOOR(RANDOM() * 90)::INT)::TEXT, 2, '0')
WHERE rating IS NULL;

-- Обновление существующих записей грузов
UPDATE t_p93479485_cargo_map_integratio.cargo
SET
  ready_status = CASE 
    WHEN id % 3 = 0 THEN 'ready'
    ELSE 'scheduled'
  END,
  ready_time = CASE
    WHEN id % 3 = 0 THEN NOW()
    ELSE NOW() + (INTERVAL '1 hour' * (1 + FLOOR(RANDOM() * 8)::INT))
  END,
  quantity = 1 + FLOOR(RANDOM() * 10)::INT,
  destination_warehouse = CASE 
    WHEN id % 3 = 0 THEN 'Склад А (ул. Промышленная, 15)'
    WHEN id % 3 = 1 THEN 'Склад Б (ул. Складская, 8)'
    ELSE 'Склад В (ул. Логистическая, 22)'
  END,
  client_address = CASE 
    WHEN id % 5 = 0 THEN 'ул. Ленина, д. 15, офис 301'
    WHEN id % 5 = 1 THEN 'ул. Советская, д. 28'
    WHEN id % 5 = 2 THEN 'пр-т Победы, д. 45, корп. 2'
    WHEN id % 5 = 3 THEN 'ул. Гагарина, д. 12А'
    ELSE 'ул. Мира, д. 67, склад 5'
  END,
  client_rating = 4.0 + (RANDOM() * 1.0)
WHERE ready_status IS NULL;