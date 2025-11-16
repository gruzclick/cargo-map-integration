-- Reset admin password to admin123
-- SHA256 hash of 'admin123' = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

UPDATE t_p93479485_cargo_map_integratio.admins 
SET password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@cargomap.ru';