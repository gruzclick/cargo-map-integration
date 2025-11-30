-- Добавление ролей и статусов для пользователей
-- Роль пользователя: перевозчик (carrier), логист (logist), клиент (client)
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) CHECK (role IN ('carrier', 'logist', 'client'));

-- Статус перевозчика: свободен (free), есть места (has_space)
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS carrier_status VARCHAR(20) CHECK (carrier_status IN ('free', 'has_space'));

-- Статус клиента: готов к отгрузке (ready_now), будет готов (ready_later)
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS client_status VARCHAR(20) CHECK (client_status IN ('ready_now', 'ready_later'));

-- Дата и время когда клиент будет готов
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS client_ready_date TIMESTAMP;

-- Флаг, указывающий установлены ли роль и статус (для модального окна при первом входе)
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS role_status_set BOOLEAN DEFAULT FALSE;

-- Текущие координаты для отображения на карте
ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS current_lat DECIMAL(10, 7);

ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD COLUMN IF NOT EXISTS current_lng DECIMAL(10, 7);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_role ON t_p93479485_cargo_map_integratio.users(role);
CREATE INDEX IF NOT EXISTS idx_users_carrier_status ON t_p93479485_cargo_map_integratio.users(carrier_status);
CREATE INDEX IF NOT EXISTS idx_users_client_status ON t_p93479485_cargo_map_integratio.users(client_status);
CREATE INDEX IF NOT EXISTS idx_users_coordinates ON t_p93479485_cargo_map_integratio.users(current_lat, current_lng);