CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER REFERENCES roles(role_id),
    permission_id INTEGER REFERENCES permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    assigned_by UUID,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

INSERT INTO roles (role_name, display_name, description, is_system) VALUES
('super_admin', 'Супер Администратор', 'Полный доступ ко всем функциям', true),
('admin', 'Администратор', 'Управление сайтом и пользователями', true),
('moderator', 'Модератор', 'Модерация контента и поддержка пользователей', true),
('support', 'Поддержка', 'Консультация пользователей', true),
('analyst', 'Аналитик', 'Просмотр статистики и отчетов', true);

INSERT INTO permissions (permission_key, display_name, description, category) VALUES
('users.view', 'Просмотр пользователей', 'Просмотр списка и профилей пользователей', 'users'),
('users.edit', 'Редактирование пользователей', 'Изменение данных пользователей', 'users'),
('users.ban', 'Блокировка пользователей', 'Блокировка и разблокировка пользователей', 'users'),
('deliveries.view', 'Просмотр доставок', 'Просмотр списка доставок', 'deliveries'),
('deliveries.edit', 'Редактирование доставок', 'Изменение статуса доставок', 'deliveries'),
('notifications.send', 'Отправка уведомлений', 'Массовая рассылка уведомлений', 'notifications'),
('notifications.view', 'Просмотр истории', 'Просмотр истории уведомлений', 'notifications'),
('stats.view', 'Просмотр статистики', 'Доступ к статистике и аналитике', 'stats'),
('stats.export', 'Экспорт данных', 'Экспорт статистики в файлы', 'stats'),
('roles.view', 'Просмотр ролей', 'Просмотр списка ролей и прав', 'roles'),
('roles.assign', 'Назначение ролей', 'Назначение ролей пользователям', 'roles'),
('content.moderate', 'Модерация контента', 'Модерация объявлений и отзывов', 'content'),
('settings.view', 'Просмотр настроек', 'Просмотр настроек системы', 'settings'),
('settings.edit', 'Изменение настроек', 'Изменение настроек системы', 'settings');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'super_admin';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'admin' 
AND p.permission_key NOT IN ('settings.edit');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'moderator' 
AND p.permission_key IN (
    'users.view', 'users.ban',
    'deliveries.view', 'deliveries.edit',
    'content.moderate',
    'stats.view'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'support' 
AND p.permission_key IN (
    'users.view',
    'deliveries.view',
    'stats.view',
    'notifications.send'
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id 
FROM roles r, permissions p 
WHERE r.role_name = 'analyst' 
AND p.permission_key IN (
    'stats.view', 'stats.export',
    'users.view',
    'deliveries.view'
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);