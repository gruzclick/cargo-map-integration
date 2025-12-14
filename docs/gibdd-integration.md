# Интеграция с API ГИБДД для проверки водительских удостоверений

## Текущий статус
✅ Backend функция создана: `/backend/verify-license/index.py`
✅ URL функции: `https://functions.poehali.dev/6e5ce61e-8397-4473-8bbf-5083c0dbfb7c`
⚠️ Сейчас работает только форматная проверка (10 цифр)

## Что нужно для полной интеграции

### Шаг 1: Получить доступ к API ГИБДД
1. Перейти на портал открытых данных ГИБДД: https://гибдд.рф/opendata
2. Зарегистрировать организацию
3. Подать заявку на доступ к API проверки водительских удостоверений
4. Дождаться одобрения (обычно 5-10 рабочих дней)
5. Получить API-ключ

**Альтернатива**: Использовать коммерческие сервисы:
- https://www.nalog.gov.ru/ (ФНС России - проверка ИП/юрлиц)
- https://dadata.ru/ (коммерческий API с проверкой документов)

### Шаг 2: Добавить API-ключ в секреты
После получения ключа:
```bash
# В poehali.dev → Проект → Секреты → Добавить:
GIBDD_API_KEY = "ваш_ключ_от_гибдд"
```

### Шаг 3: Обновить код функции
В файле `/backend/verify-license/index.py` заменить заглушку на реальный запрос:

```python
import os
import requests

def verify_with_gibdd_api(license_number: str, birth_date: str) -> dict:
    """Реальная проверка через API ГИБДД"""
    api_key = os.environ.get('GIBDD_API_KEY')
    
    response = requests.post(
        'https://xn--90adear.xn--p1ai/api/check_driver',
        headers={'Authorization': f'Bearer {api_key}'},
        json={
            'license_number': license_number,
            'birth_date': birth_date
        }
    )
    
    return response.json()
```

### Шаг 4: Добавить зависимость
Создать `backend/verify-license/requirements.txt`:
```
requests==2.31.0
```

### Шаг 5: Повторно задеплоить функцию
```bash
# Функция автоматически подхватит изменения при следующем деплое
```

## Формат данных

### Запрос к функции:
```json
{
  "license_number": "7711123456",  // 10 цифр: серия (4) + номер (6)
  "birth_date": "1990-05-15"       // Дата рождения водителя
}
```

### Ответ от функции:
```json
{
  "valid": true,
  "license_number": "7711123456",
  "message": "ВУ действительно",
  "driver_name": "Иванов Иван Иванович",  // Если API вернет
  "issue_date": "2020-01-15",             // Если API вернет
  "expiry_date": "2030-01-15",            // Если API вернет
  "categories": ["B", "C"],               // Если API вернет
  "request_id": "abc-123"
}
```

## Использование в приложении

### Frontend компонент (CargoCarrierForm.tsx):
```tsx
const verifyLicense = async (licenseNumber: string, birthDate: string) => {
  try {
    const response = await fetch(
      'https://functions.poehali.dev/6e5ce61e-8397-4473-8bbf-5083c0dbfb7c',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_number: licenseNumber,
          birth_date: birthDate
        })
      }
    );
    
    const data = await response.json();
    
    if (data.valid) {
      alert('✅ Водительское удостоверение подтверждено!');
    } else {
      alert('❌ ВУ не прошло проверку: ' + data.error);
    }
  } catch (error) {
    console.error('Ошибка проверки ВУ:', error);
  }
};
```

## Ограничения бесплатного API ГИБДД
- Лимит: до 1000 запросов в день
- Задержка ответа: 1-5 секунд
- Доступны только базовые данные (статус ВУ, действительность)

## Стоимость коммерческих альтернатив
- **DaData**: от 1₽ за проверку (при объеме 1000+ в месяц)
- **ФССП API**: от 3₽ за проверку
- **CheckPerson**: от 5₽ за проверку

## Рекомендация
Для MVP достаточно форматной проверки (уже работает).
Для продакшена рекомендую DaData - надежнее и быстрее официального API.
