-- Activate admin@cargomap.ru account
UPDATE t_p93479485_cargo_map_integratio.admins 
SET is_active = true 
WHERE email = 'admin@cargomap.ru';