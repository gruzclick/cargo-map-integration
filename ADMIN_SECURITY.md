# Рекомендации по защите админ-панели

## 🔒 Критические меры безопасности

### 1. Аутентификация и авторизация

#### ✅ Обязательные меры:
- **Двухфакторная аутентификация (2FA)** — включена биометрия, добавьте SMS/Email коды
- **Сильные пароли** — минимум 12 символов, буквы, цифры, спецсимволы
- **Ограничение попыток входа** — максимум 5 попыток, потом блокировка на 15 минут
- **JWT токены с коротким временем жизни** — 15 минут для access token, 7 дней для refresh token
- **Принудительный logout** — автоматический выход через 30 минут неактивности

#### 💡 Текущая реализация:
```typescript
// src/utils/security.ts содержит:
- secureLocalStorage — шифрование данных
- Биометрическая аутентификация (WebAuthn API)
- Хранение admin_token в зашифрованном виде
```

#### ⚠️ Нужно добавить:
```typescript
// Middleware для проверки токена перед каждым запросом
const validateToken = async (token: string) => {
  const response = await fetch('backend/auth/validate', {
    headers: { 'X-Auth-Token': token }
  });
  if (!response.ok) {
    // Logout пользователя
    window.location.href = '/admin/login';
  }
};

// Rate limiting для login endpoint
let loginAttempts = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 минут
```

---

### 2. Защита данных

#### ✅ Текущие меры:
- Шифрование в localStorage через `secureLocalStorage`
- HTTPS для всех запросов
- Токены в заголовках, не в URL

#### ⚠️ Критично добавить:
1. **Валидация на бэкенде** — НИКОГДА не доверяйте frontend данным
2. **Sanitization входных данных** — защита от XSS атак
3. **CORS настройки** — только с доверенных доменов
4. **Content Security Policy (CSP)** — запрет выполнения вредоносных скриптов

```typescript
// Пример валидации на frontend (всегда дублировать на backend!)
const sanitizeInput = (input: string) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

---

### 3. Защита от атак

#### SQL Injection
✅ **Используете prepared statements** — в backend/auth используются параметризованные запросы
⚠️ **Всегда используйте параметры**, никогда не вставляйте данные напрямую в SQL

#### XSS (Cross-Site Scripting)
```typescript
// Экранирование данных перед отображением
import DOMPurify from 'dompurify';

const safeHTML = DOMPurify.sanitize(userInput);
```

#### CSRF (Cross-Site Request Forgery)
```typescript
// Добавьте CSRF токен в каждый запрос
const csrfToken = generateToken();
headers: {
  'X-CSRF-Token': csrfToken,
  'X-Auth-Token': adminToken
}
```

#### Brute Force
```typescript
// Rate limiting для всех API endpoints
// В backend/auth/index.ts добавить:
const rateLimitMap = new Map();

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const attempts = rateLimitMap.get(ip) || [];
  const recentAttempts = attempts.filter(t => now - t < 60000); // 1 минута
  
  if (recentAttempts.length >= 10) {
    throw new Error('Too many requests');
  }
  
  rateLimitMap.set(ip, [...recentAttempts, now]);
};
```

---

### 4. Мониторинг и логирование

#### ✅ Что логировать:
- Все попытки входа (успешные и неуспешные)
- Изменения критичных настроек
- Удаление пользователей
- Изменение ролей администраторов
- Экспорт данных

#### 💡 Реализация:
```typescript
// backend/auth/index.ts
const logAdminAction = async (action: string, adminId: string, details: any) => {
  await db.query(
    'INSERT INTO admin_logs (action, admin_id, details, ip, timestamp) VALUES ($1, $2, $3, $4, NOW())',
    [action, adminId, JSON.stringify(details), event.requestContext.identity.sourceIp]
  );
};

// Примеры использования:
await logAdminAction('LOGIN_SUCCESS', adminId, { method: 'biometric' });
await logAdminAction('USER_DELETED', adminId, { userId: deletedUserId });
await logAdminAction('ROLE_CHANGED', adminId, { targetUser: userId, newRole: 'moderator' });
```

#### 📊 Создайте таблицу для логов:
```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  admin_id VARCHAR(255) NOT NULL,
  details JSONB,
  ip VARCHAR(45),
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX idx_admin_id (admin_id),
  INDEX idx_timestamp (timestamp)
);
```

---

### 5. Разделение прав доступа (RBAC)

#### ✅ Уже реализовано:
- Страница управления ролями `/admin/roles`
- Типы ролей: superadmin, moderator, support

#### ⚠️ Нужно добавить на backend:
```typescript
// backend/auth/index.ts
const checkPermission = async (adminId: string, requiredRole: string) => {
  const result = await db.query(
    'SELECT role FROM admins WHERE id = $1',
    [adminId]
  );
  
  const roleHierarchy = {
    'superadmin': 3,
    'moderator': 2,
    'support': 1
  };
  
  const userLevel = roleHierarchy[result.rows[0].role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  if (userLevel < requiredLevel) {
    throw new Error('Insufficient permissions');
  }
};

// Использование:
await checkPermission(adminId, 'moderator'); // Только модераторы и выше
```

---

### 6. Защита файлов и настроек

#### ⚠️ Критично проверить:
1. **.env файлы** — НИКОГДА не коммитьте в Git
2. **API ключи** — только в backend, никогда в frontend коде
3. **Database credentials** — только в защищенных переменных окружения
4. **Backup файлы** — храните зашифрованными в приватном S3 bucket

```bash
# .gitignore должен содержать:
.env
.env.local
.env.production
*.log
admin_logs/
backups/
```

---

### 7. Регулярные проверки безопасности

#### 📅 Еженедельно:
- Проверка логов на подозрительную активность
- Ревью активных admin сессий
- Проверка неудачных попыток входа

#### 📅 Ежемесячно:
- Аудит прав доступа администраторов
- Обновление зависимостей (`npm audit fix`)
- Проверка backup файлов
- Тестирование процедуры восстановления

#### 📅 Ежеквартально:
- Полный security audit кода
- Penetration testing
- Обновление паролей всех администраторов
- Ревью и удаление неиспользуемых API ключей

---

### 8. Checklist перед production

- [ ] Все admin пароли изменены с дефолтных
- [ ] 2FA включена для всех администраторов
- [ ] HTTPS настроен с валидным SSL сертификатом
- [ ] Database credentials в защищенном хранилище
- [ ] Rate limiting настроен для всех endpoints
- [ ] CORS настроен только для production домена
- [ ] Логирование работает и сохраняется в безопасное место
- [ ] Backup автоматизирован и протестирован
- [ ] Отключен debug режим
- [ ] Удалены все тестовые пользователи и данные
- [ ] CSP заголовки настроены
- [ ] Мониторинг и алерты настроены (например, при 10+ неудачных входах)

---

## 🚨 Признаки компрометации

Немедленно проверьте систему если видите:
- Множество неудачных попыток входа с одного IP
- Вход администратора в нестандартное время
- Массовое удаление пользователей
- Изменение критичных настроек без причины
- Экспорт больших объемов данных
- Изменение паролей других администраторов

## 📞 План действий при взломе

1. **Немедленно** — отключите скомпрометированные учетные записи
2. Смените все пароли администраторов
3. Отзовите все активные токены
4. Проверьте логи на предмет утечки данных
5. Восстановите из последнего чистого backup
6. Проведите полный security audit
7. Уведомите пользователей если их данные могли быть скомпрометированы

---

## 🔗 Полезные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — главные уязвимости веб-приложений
- [WebAuthn Guide](https://webauthn.guide/) — биометрическая аутентификация
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725) — безопасная работа с токенами
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html) — защита базы данных
