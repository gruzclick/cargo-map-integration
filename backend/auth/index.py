'''
Business: Secure user registration and authentication with bcrypt and JWT
Args: event - dict with httpMethod, body, queryStringParameters, requestContext
      context - object with request_id attribute
Returns: HTTP response with JWT token and user data
'''

import json
import os
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
import psycopg2
import bcrypt
import jwt

# Константы для безопасности
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15
JWT_EXPIRATION_HOURS = 24
ALLOWED_ORIGINS = ['https://gruzclick.online', 'https://www.gruzclick.online', 'http://localhost:5173', 'http://localhost:3000']

def get_client_ip(event: Dict[str, Any]) -> str:
    """Извлекает IP-адрес клиента из события"""
    request_context = event.get('requestContext', {})
    identity = request_context.get('identity', {})
    return identity.get('sourceIp', 'unknown')

def get_user_agent(event: Dict[str, Any]) -> str:
    """Извлекает User-Agent из заголовков"""
    headers = event.get('headers', {})
    return headers.get('user-agent', headers.get('User-Agent', 'unknown'))

def validate_email(email: str) -> bool:
    """Валидация email адреса"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) and len(email) <= 255

def validate_phone(phone: str) -> bool:
    """Валидация номера телефона (российский формат)"""
    pattern = r'^\+?7\d{10}$'
    return bool(re.match(pattern, phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')))

def validate_password(password: str) -> Tuple[bool, Optional[str]]:
    """Валидация пароля"""
    if len(password) < 8:
        return False, 'Пароль должен содержать минимум 8 символов'
    if len(password) > 128:
        return False, 'Пароль слишком длинный'
    if not re.search(r'[A-Za-z]', password):
        return False, 'Пароль должен содержать хотя бы одну букву'
    if not re.search(r'\d', password):
        return False, 'Пароль должен содержать хотя бы одну цифру'
    return True, None

def validate_inn(inn: str) -> bool:
    """Валидация ИНН (10 или 12 цифр)"""
    return inn.isdigit() and len(inn) in [10, 12]

def sanitize_string(value: str, max_length: int = 255) -> str:
    """Очистка строки от опасных символов"""
    if not value:
        return ''
    # Убираем опасные символы для SQL-инъекций
    sanitized = value.replace('\x00', '').strip()
    return sanitized[:max_length]

def log_login_attempt(conn, user_id: Optional[str], email: str, ip: str, user_agent: str, 
                      success: bool, failure_reason: Optional[str] = None):
    """Логирование попытки входа"""
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO t_p93479485_cargo_map_integratio.login_logs 
            (user_id, email, ip_address, user_agent, success, failure_reason)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, email, ip, user_agent, success, failure_reason))
        conn.commit()
    except Exception as e:
        print(f"Error logging login attempt: {e}")
    finally:
        cur.close()

def check_rate_limit(conn, email: str, ip: str) -> Tuple[bool, Optional[str]]:
    """Проверка rate limiting для IP и email"""
    cur = conn.cursor()
    
    # Проверяем блокировку учётной записи
    cur.execute("""
        SELECT login_attempts, locked_until 
        FROM t_p93479485_cargo_map_integratio.users 
        WHERE email = %s
    """, (email,))
    
    result = cur.fetchone()
    if result:
        attempts, locked_until = result
        
        # Проверяем, не заблокирован ли аккаунт
        if locked_until and locked_until > datetime.utcnow():
            cur.close()
            minutes_left = int((locked_until - datetime.utcnow()).total_seconds() / 60)
            return False, f'Аккаунт заблокирован. Попробуйте через {minutes_left} минут'
    
    # Проверяем количество попыток с IP за последние 15 минут
    cur.execute("""
        SELECT COUNT(*) 
        FROM t_p93479485_cargo_map_integratio.login_logs 
        WHERE ip_address = %s 
        AND success = FALSE 
        AND created_at > NOW() - INTERVAL '15 minutes'
    """, (ip,))
    
    ip_attempts = cur.fetchone()[0]
    cur.close()
    
    if ip_attempts >= MAX_LOGIN_ATTEMPTS * 2:  # С одного IP можно попробовать больше раз
        return False, 'Слишком много попыток входа с вашего IP. Попробуйте позже'
    
    return True, None

def update_login_attempts(conn, email: str, success: bool, ip: str):
    """Обновление счётчика попыток входа"""
    cur = conn.cursor()
    
    if success:
        # Сброс счётчика при успешном входе
        cur.execute("""
            UPDATE t_p93479485_cargo_map_integratio.users 
            SET login_attempts = 0, 
                locked_until = NULL,
                last_login_attempt = NOW(),
                last_login_ip = %s
            WHERE email = %s
        """, (ip, email))
    else:
        # Увеличение счётчика при неудачной попытке
        cur.execute("""
            UPDATE t_p93479485_cargo_map_integratio.users 
            SET login_attempts = login_attempts + 1,
                last_login_attempt = NOW()
            WHERE email = %s
            RETURNING login_attempts
        """, (email,))
        
        result = cur.fetchone()
        if result and result[0] >= MAX_LOGIN_ATTEMPTS:
            # Блокировка аккаунта
            lockout_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            cur.execute("""
                UPDATE t_p93479485_cargo_map_integratio.users 
                SET locked_until = %s
                WHERE email = %s
            """, (lockout_until, email))
    
    conn.commit()
    cur.close()

def get_cors_headers(origin: str = '*') -> Dict[str, str]:
    """Получение CORS заголовков с проверкой origin"""
    allowed_origin = '*'
    
    # Если origin в белом списке, используем его
    if origin in ALLOWED_ORIGINS:
        allowed_origin = origin
    
    return {
        'Access-Control-Allow-Origin': allowed_origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, Authorization',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true'
    }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    origin = event.get('headers', {}).get('origin', event.get('headers', {}).get('Origin', '*'))
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': get_cors_headers(origin),
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Database configuration error'}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            client_ip = get_client_ip(event)
            user_agent = get_user_agent(event)
            
            if action == 'register':
                return register_user(body_data, database_url, jwt_secret, client_ip, user_agent, origin)
            elif action == 'login':
                return login_user(body_data, database_url, jwt_secret, client_ip, user_agent, origin)
            else:
                return {
                    'statusCode': 400,
                    'headers': get_cors_headers(origin),
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': 'Invalid JSON'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            print(f"Error: {e}")
            return {
                'statusCode': 500,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': 'Internal server error'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': get_cors_headers(origin),
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def register_user(data: Dict[str, Any], database_url: str, jwt_secret: str, 
                 client_ip: str, user_agent: str, origin: str) -> Dict[str, Any]:
    email = sanitize_string(data.get('email', ''), 255)
    password = data.get('password', '')
    full_name = sanitize_string(data.get('full_name', ''), 255)
    user_type = data.get('user_type', '')
    entity_type = data.get('entity_type', '')
    inn = sanitize_string(data.get('inn', ''), 12)
    organization_name = sanitize_string(data.get('organization_name', ''), 255)
    phone = sanitize_string(data.get('phone', ''), 20)
    
    # Валидация обязательных полей
    if not all([email, password, full_name, user_type, entity_type, phone]):
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Все обязательные поля должны быть заполнены'}),
            'isBase64Encoded': False
        }
    
    # Валидация email
    if not validate_email(email):
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Некорректный email адрес'}),
            'isBase64Encoded': False
        }
    
    # Валидация телефона
    if not validate_phone(phone):
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Некорректный номер телефона. Используйте формат +7XXXXXXXXXX'}),
            'isBase64Encoded': False
        }
    
    # Валидация пароля
    is_valid, error_message = validate_password(password)
    if not is_valid:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': error_message}),
            'isBase64Encoded': False
        }
    
    # Валидация типов пользователя и юр. лица
    if user_type not in ['client', 'carrier']:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Некорректный тип пользователя'}),
            'isBase64Encoded': False
        }
    
    if entity_type not in ['individual', 'legal']:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Некорректный тип лица'}),
            'isBase64Encoded': False
        }
    
    # Валидация ИНН для юр. лиц
    if entity_type == 'legal' and inn and not validate_inn(inn):
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Некорректный ИНН. Должен содержать 10 или 12 цифр'}),
            'isBase64Encoded': False
        }
    
    # Хеширование пароля с bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        # Проверка существования email
        cur.execute("SELECT user_id FROM t_p93479485_cargo_map_integratio.users WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': 'Email уже зарегистрирован'}),
                'isBase64Encoded': False
            }
        
        # Проверка существования телефона
        cur.execute("SELECT user_id FROM t_p93479485_cargo_map_integratio.users WHERE phone = %s", (phone,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': 'Телефон уже зарегистрирован'}),
                'isBase64Encoded': False
            }
        
        # Создание пользователя
        cur.execute("""
            INSERT INTO t_p93479485_cargo_map_integratio.users 
            (email, password_hash, full_name, user_type, entity_type, 
             inn, organization_name, phone, phone_verified, last_login_ip)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE, %s)
            RETURNING user_id
        """, (email, password_hash, full_name, user_type, entity_type, 
              inn if inn else None, organization_name if organization_name else None, 
              phone, client_ip))
        
        user_id = cur.fetchone()[0]
        
        # Создание записи для перевозчика
        if user_type == 'carrier':
            vehicle_type = data.get('vehicle_type', 'car_small')
            capacity = data.get('capacity', 0)
            
            # Валидация capacity
            try:
                capacity = float(capacity) if capacity else 0
                if capacity < 0 or capacity > 100000:
                    raise ValueError('Грузоподъёмность вне допустимого диапазона')
            except (ValueError, TypeError):
                capacity = 0
            
            cur.execute("""
                INSERT INTO t_p93479485_cargo_map_integratio.carriers 
                (user_id, vehicle_type, capacity, vehicle_status)
                VALUES (%s, %s, %s, 'free')
            """, (user_id, vehicle_type, capacity))
        
        conn.commit()
        
        # Логирование успешной регистрации
        log_login_attempt(conn, str(user_id), email, client_ip, user_agent, True)
        
        cur.close()
        conn.close()
        
        # Генерация JWT токена
        token = jwt.encode({
            'user_id': str(user_id),
            'email': email,
            'user_type': user_type,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }, jwt_secret, algorithm='HS256')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                **get_cors_headers(origin)
            },
            'body': json.dumps({
                'message': 'Регистрация успешна',
                'token': token,
                'user': {
                    'user_id': str(user_id),
                    'email': email,
                    'full_name': full_name,
                    'user_type': user_type,
                    'phone': phone
                }
            }),
            'isBase64Encoded': False
        }
    
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Ошибка базы данных'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'}),
            'isBase64Encoded': False
        }

def login_user(data: Dict[str, Any], database_url: str, jwt_secret: str, 
              client_ip: str, user_agent: str, origin: str) -> Dict[str, Any]:
    # Используем phone вместо email для входа
    phone = sanitize_string(data.get('phone', ''), 20)
    password = data.get('password', '')
    
    if not phone or not password:
        return {
            'statusCode': 400,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Укажите телефон и пароль'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(database_url)
        
        # Проверка rate limiting
        # Используем телефон для проверки, но ищем email в базе
        cur = conn.cursor()
        cur.execute("SELECT email FROM t_p93479485_cargo_map_integratio.users WHERE phone = %s", (phone,))
        result = cur.fetchone()
        cur.close()
        
        email_for_check = result[0] if result else phone
        
        is_allowed, error_msg = check_rate_limit(conn, email_for_check, client_ip)
        if not is_allowed:
            log_login_attempt(conn, None, email_for_check, client_ip, user_agent, False, error_msg)
            conn.close()
            return {
                'statusCode': 429,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': error_msg}),
                'isBase64Encoded': False
            }
        
        # Поиск пользователя по телефону
        cur = conn.cursor()
        cur.execute("""
            SELECT user_id, email, password_hash, full_name, user_type, phone
            FROM t_p93479485_cargo_map_integratio.users 
            WHERE phone = %s
        """, (phone,))
        
        result = cur.fetchone()
        cur.close()
        
        if not result:
            log_login_attempt(conn, None, phone, client_ip, user_agent, False, 'User not found')
            update_login_attempts(conn, email_for_check, False, client_ip)
            conn.close()
            return {
                'statusCode': 401,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': 'Неверный телефон или пароль'}),
                'isBase64Encoded': False
            }
        
        user_id, email, password_hash, full_name, user_type, user_phone = result
        
        # Проверка пароля с bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8')):
            log_login_attempt(conn, str(user_id), email, client_ip, user_agent, False, 'Invalid password')
            update_login_attempts(conn, email, False, client_ip)
            conn.close()
            return {
                'statusCode': 401,
                'headers': get_cors_headers(origin),
                'body': json.dumps({'error': 'Неверный телефон или пароль'}),
                'isBase64Encoded': False
            }
        
        # Успешный вход
        update_login_attempts(conn, email, True, client_ip)
        log_login_attempt(conn, str(user_id), email, client_ip, user_agent, True)
        conn.close()
        
        # Генерация JWT токена
        token = jwt.encode({
            'user_id': str(user_id),
            'email': email,
            'user_type': user_type,
            'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }, jwt_secret, algorithm='HS256')
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                **get_cors_headers(origin)
            },
            'body': json.dumps({
                'token': token,
                'user': {
                    'user_id': str(user_id),
                    'email': email,
                    'full_name': full_name,
                    'user_type': user_type,
                    'phone': user_phone
                }
            }),
            'isBase64Encoded': False
        }
    
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Ошибка базы данных'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({'error': 'Внутренняя ошибка сервера'}),
            'isBase64Encoded': False
        }
