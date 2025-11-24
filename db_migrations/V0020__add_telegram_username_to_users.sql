-- Добавление поля telegram username
ALTER TABLE t_p93479485_cargo_map_integratio.users ADD COLUMN IF NOT EXISTS telegram VARCHAR(255);