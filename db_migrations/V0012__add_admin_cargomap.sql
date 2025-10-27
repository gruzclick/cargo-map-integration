-- Add admin@cargomap.ru with password admin123
INSERT INTO admins (email, password_hash, full_name, is_active, created_at) 
VALUES (
  'admin@cargomap.ru', 
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'Главный администратор',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET 
  password_hash = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  is_active = true,
  full_name = 'Главный администратор';