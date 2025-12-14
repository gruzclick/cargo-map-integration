import json
import re
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Проверка водительского удостоверения через базу ГИБДД
    Args: event - dict с httpMethod, body (license_number, birth_date)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с результатом проверки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    license_number = body_data.get('license_number', '').strip()
    birth_date = body_data.get('birth_date', '').strip()
    
    if not license_number or not birth_date:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'valid': False,
                'error': 'Требуются поля: license_number и birth_date'
            }),
            'isBase64Encoded': False
        }
    
    # Валидация формата ВУ (10 цифр: серия 4 цифры + номер 6 цифр)
    license_pattern = r'^\d{10}$'
    if not re.match(license_pattern, license_number):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'valid': False,
                'error': 'Неверный формат ВУ. Должно быть 10 цифр (например: 7711123456)'
            }),
            'isBase64Encoded': False
        }
    
    # ВАЖНО: Реальный API ГИБДД требует регистрации на https://гибдд.рф/opendata
    # Для продакшена необходимо:
    # 1. Зарегистрироваться на портале opendata ГИБДД
    # 2. Получить API ключ
    # 3. Добавить секрет GIBDD_API_KEY через put_secret
    # 4. Использовать реальный endpoint: https://xn--90adear.xn--p1ai/api/check_driver
    
    # Пример заглушки (для демонстрации логики):
    # В продакшене замените на реальный запрос к API ГИБДД
    is_valid = check_license_format_valid(license_number)
    
    result = {
        'valid': is_valid,
        'license_number': license_number,
        'message': 'ВУ прошло форматную проверку' if is_valid else 'ВУ не прошло проверку',
        'note': 'Для полной проверки требуется API-ключ ГИБДД',
        'request_id': context.request_id
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(result),
        'isBase64Encoded': False
    }

def check_license_format_valid(license_number: str) -> bool:
    """Базовая проверка формата ВУ"""
    if len(license_number) != 10:
        return False
    if not license_number.isdigit():
        return False
    # Дополнительные проверки контрольной суммы могут быть добавлены
    return True
