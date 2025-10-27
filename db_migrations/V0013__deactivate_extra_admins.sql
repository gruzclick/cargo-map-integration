-- Deactivate all admins except bgs1990st@mail.ru
UPDATE admins 
SET is_active = false 
WHERE email != 'bgs1990st@mail.ru';