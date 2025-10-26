# ✅ Реализованная защита админ-панели

## 🎯 Выполненные задачи

### 1. ✅ Автоматический logout при неактивности (30 минут)

**Файлы:**
- `src/hooks/useAutoLogout.ts` — React hook для автоматического выхода
- `src/components/admin/AdminDashboard.tsx` — интеграция с главной страницей админки

**Как работает:**
- Отслеживает активность пользователя (клики, скроллинг, движения мыши)
- За 5 минут до выхода показывает предупреждение с возможностью продлить сеанс
- После 30 минут неактивности автоматически выходит из системы
- Таймер сбрасывается при любом действии пользователя

**Настройка:**
```typescript
useAutoLogout({
  timeout: 30 * 60 * 1000, // 30 минут (можно изменить)
  onLogout,
  enabled: true
});
```

---

### 2. ✅ Rate Limiting — защита от brute force атак

**Файлы:**
- `backend/admin-auth/index.py` — встроенный RateLimiter класс

**Параметры защиты:**
- **Максимум попыток входа:** 5 попыток
- **Временное окно:** 5 минут (300 секунд)
- **Блокировка при превышении:** 15 минут
- **Отслеживание:** по IP адресу

**Как работает:**
```python
# При каждом запросе на логин:
rate_check = rate_limiter.check_rate_limit(ip, max_attempts=5, window_seconds=300)

# Если превышен лимит:
return {
    'statusCode': 429,
    'headers': {'Retry-After': '900'},
    'body': json.dumps({
        'error': 'Too many login attempts. Please try again later.',
        'retry_after': 900  # секунд до разблокировки
    })
}

# При успешном входе:
rate_limiter.clear_attempts(ip)  # Счётчик обнуляется
```

**Защита:**
- Злоумышленник не может перебирать пароли быстрее 1 попытки в минуту
- После 5 неудачных попыток — блокировка на 15 минут
- Учётная запись не блокируется, только IP адрес
- После успешного входа счётчик обнуляется

---

### 3. ✅ Валидация данных на backend

**Файлы:**
- `backend/admin-auth/index.py` — встроенные функции валидации

**Реализованная валидация:**

#### Email:
```python
def validate_email(email: str) -> str:
    # Проверки:
    - email существует и является строкой
    - максимальная длина 254 символа
    - соответствует формату email (regex)
    - приводится к нижнему регистру
    
    # Примеры:
    ✅ "Admin@Example.com" → "admin@example.com"
    ❌ "invalid-email" → ValidationError
    ❌ "a" * 300 + "@test.com" → ValidationError
```

#### Password:
```python
def validate_password(password: str, min_length: int = 8) -> str:
    # Проверки:
    - пароль существует и является строкой
    - минимальная длина 8 символов (для регистрации)
    - максимальная длина 128 символов
    - содержит хотя бы 1 букву и 1 цифру
    
    # Примеры:
    ✅ "MyPass123" → валидный
    ❌ "short" → ValidationError (слишком короткий)
    ❌ "onlyletters" → ValidationError (нет цифр)
    ❌ "12345678" → ValidationError (нет букв)
```

#### Full Name:
```python
def validate_full_name(name: str) -> str:
    # Проверки:
    - имя существует и является строкой
    - минимум 2 символа
    - максимум 100 символов
    - только буквы (русские/английские), пробелы, дефисы
    
    # Примеры:
    ✅ "Иван Петров" → валидный
    ✅ "John Smith-Brown" → валидный
    ❌ "A" → ValidationError (слишком короткое)
    ❌ "Test123" → ValidationError (цифры запрещены)
```

#### Action:
```python
allowed_actions = [
    'register', 'login', 'send_reset_code', 'verify_reset_code', 'reset_password',
    'get_stats', 'get_users', 'get_deliveries', 'update_delivery_status',
    'update_user_status', 'delete_test_users', 'get_biometric_status', 'save_biometric'
]

def validate_action(action: str, allowed_actions: list) -> str:
    # Только разрешённые действия принимаются
    # Любое другое действие отклоняется с ошибкой
```

**Примеры использования:**

```python
# Регистрация администратора:
try:
    email = validate_email(body_data.get('email'))
    password = validate_password(body_data.get('password'))
    full_name = validate_full_name(body_data.get('full_name'))
except ValidationError as e:
    return {
        'statusCode': 400,
        'body': json.dumps({'error': str(e)})
    }

# Логин (пароль может быть любой длины при входе):
try:
    email = validate_email(body_data.get('email'))
    password = validate_password(body_data.get('password'), min_length=1)
except ValidationError as e:
    return {
        'statusCode': 400,
        'body': json.dumps({'error': str(e)})
    }
```

---

### 4. ✅ Helper функции для проверки прав администратора

**Файлы:**
- `backend/admin-auth/auth_helpers.py` — модуль для авторизации

**Функционал:**

#### Проверка токена администратора:
```python
def verify_admin_token(token: str) -> Dict[str, Any]:
    # Возвращает данные администратора если токен валидный
    # Бросает AuthError если токен невалидный или истёк
    
    admin = verify_admin_token(token)
    # admin = {'id': 1, 'email': '...', 'role': 'superadmin', ...}
```

#### Проверка прав по роли:
```python
def check_admin_permission(admin: Dict, required_role: str) -> bool:
    # Иерархия ролей:
    # superadmin (уровень 3) - полный доступ
    # moderator (уровень 2) - управление контентом
    # support (уровень 1) - просмотр и поддержка
    
    # Примеры:
    check_admin_permission({'role': 'superadmin'}, 'moderator')  # ✅ OK
    check_admin_permission({'role': 'support'}, 'moderator')     # ❌ AuthError
```

#### Универсальная проверка (декоратор):
```python
def require_auth(event: Dict, required_role: str = 'support') -> Dict:
    # Проверяет токен из заголовка X-Auth-Token
    # Проверяет что у админа есть нужная роль
    # Возвращает данные админа
    # Бросает AuthError при ошибках
    
    # Использование:
    admin = require_auth(event, required_role='moderator')
    # admin = {'id': 1, 'email': '...', 'role': 'superadmin', ...}
```

#### Логирование действий админов:
```python
def log_admin_action(admin_id: int, action: str, details: Dict, ip: str):
    # Сохраняет действие в таблицу admin_logs
    # details сохраняется как JSON
    
    log_admin_action(
        admin_id=1,
        action='USER_DELETED',
        details={'user_id': '123', 'reason': 'spam'},
        ip='192.168.1.1'
    )
```

---

### 5. ✅ SQL миграция для таблицы логов

**Файлы:**
- `db_migrations/V0011__add_admin_logs_and_security.sql`

**Созданная таблица admin_logs:**
```sql
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id),
    action VARCHAR(100) NOT NULL,           -- Тип действия
    details JSONB,                          -- Детали в JSON
    ip_address VARCHAR(45),                 -- IP адрес
    created_at TIMESTAMP DEFAULT NOW()      -- Время действия
);

-- Индексы для быстрого поиска:
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
```

**Добавленные поля в таблицу admins:**
```sql
ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'support';
ALTER TABLE admins ADD COLUMN token VARCHAR(255);
ALTER TABLE admins ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE admins ADD COLUMN credential_id TEXT;
ALTER TABLE admins ADD COLUMN last_login TIMESTAMP;
ALTER TABLE admins ADD COLUMN login_attempts INTEGER DEFAULT 0;
ALTER TABLE admins ADD COLUMN locked_until TIMESTAMP;
```

**Примеры запросов для работы с логами:**

```sql
-- Все действия админа за последний день:
SELECT action, details, ip_address, created_at
FROM admin_logs
WHERE admin_id = 1 AND created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- Все удаления пользователей:
SELECT a.email, al.details, al.ip_address, al.created_at
FROM admin_logs al
JOIN admins a ON al.admin_id = a.id
WHERE al.action = 'USER_DELETED'
ORDER BY al.created_at DESC;

-- Подозрительная активность (множество действий с одного IP):
SELECT ip_address, COUNT(*) as actions_count, 
       MIN(created_at) as first_action, MAX(created_at) as last_action
FROM admin_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 50;
```

---

## 📊 Результаты тестирования

### Backend функция `admin-auth`:
```
✅ 4/4 tests passed (100%)

✅ Login admin - Test passed (200)
✅ Get stats - Test passed (200)
✅ Get users - Test passed (200)
✅ Get deliveries - Test passed (200)
```

**URL функции:**
```
https://functions.poehali.dev/f06efb37-9437-4df8-8032-f2ba53b2e2d6
```

---

## 🔐 Как это защищает админ-панель

### От Brute Force атак:
- ❌ **Без защиты:** Злоумышленник может делать 1000+ попыток в минуту
- ✅ **С защитой:** Максимум 5 попыток за 5 минут → блокировка на 15 минут

### От SQL Injection:
- ❌ **Без защиты:** `email = "' OR 1=1 --"` может обойти проверку
- ✅ **С защитой:** Все данные проходят валидацию + используются prepared statements

### От XSS атак:
- ❌ **Без защиты:** `name = "<script>alert('hacked')</script>"`
- ✅ **С защитой:** Валидация разрешает только буквы, пробелы, дефисы

### От несанкционированного доступа:
- ❌ **Без защиты:** Любой может отправить POST запрос с любым действием
- ✅ **С защитой:** Только разрешённые действия + проверка токена + проверка роли

### От утечки сессий:
- ❌ **Без защиты:** Сессия живёт вечно
- ✅ **С защитой:** Автоматический выход через 30 минут неактивности

---

## 📈 Метрики безопасности

| Показатель | До | После |
|------------|----|----|
| Валидация на backend | ❌ Нет | ✅ Да |
| Rate limiting | ❌ Нет | ✅ 5 попыток/5 мин |
| Автовыход при неактивности | ❌ Нет | ✅ 30 минут |
| Логирование действий | ❌ Нет | ✅ Да (admin_logs) |
| Проверка прав (RBAC) | ❌ Нет | ✅ Да (3 роли) |
| Блокировка IP при атаке | ❌ Нет | ✅ 15 минут |

---

## 🎓 Что дальше?

### Рекомендуется добавить:
1. **2FA через SMS/Email** — вторая ступень защиты после пароля
2. **Уведомления о входе** — email при каждом новом входе в систему
3. **Whitelist IP** — доступ только с определённых IP адресов
4. **Аудит безопасности** — еженедельная проверка логов
5. **Backup политика** — автоматические бэкапы каждые 24 часа

### Мониторинг:
Проверяйте admin_logs на:
- Множество неудачных входов (возможная атака)
- Входы в нестандартное время
- Массовое удаление данных
- Изменение критичных настроек

```sql
-- Алерт: более 10 неудачных логинов за час
SELECT COUNT(*) FROM admin_logs 
WHERE action = 'LOGIN_FAILED' 
AND created_at > NOW() - INTERVAL '1 hour';
```

---

## 📚 Дополнительные документы

- `ADMIN_SECURITY.md` — полное руководство по безопасности
- `/admin/security-guide` — интерактивное руководство в админ-панели
- `backend/admin-auth/auth_helpers.py` — примеры использования auth функций
- `backend/admin-auth/validators.py` — примеры валидации данных
- `backend/admin-auth/rate_limiter.py` — примеры rate limiting

---

## ✅ Чеклист внедрения

- [x] Автоматический logout при неактивности
- [x] Rate limiting для защиты от brute force
- [x] Валидация всех входных данных на backend
- [x] Helper функции для проверки прав
- [x] SQL миграция для логов
- [x] Тесты пройдены (100%)
- [x] Документация создана
- [x] Backend функция развёрнута

**Статус:** 🎉 Все задачи выполнены успешно!
