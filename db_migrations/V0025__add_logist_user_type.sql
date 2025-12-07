-- Расширяем допустимые значения user_type, добавляем 'logist'
ALTER TABLE t_p93479485_cargo_map_integratio.users 
DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE t_p93479485_cargo_map_integratio.users 
ADD CONSTRAINT users_user_type_check 
CHECK (user_type IN ('client', 'carrier', 'logist'));