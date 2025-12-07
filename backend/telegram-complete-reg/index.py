import json
import os
import psycopg2

from typing import Dict, Any
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Завершение регистрации пользователя после Telegram авторизации
    Args: event with httpMethod POST, body with telegram_user_id, full_name, phone, user_type, etc.
          context with request_id attribute
    Returns: HTTP response with created/updated user data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
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
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        telegram_user_id = body_data.get('telegram_user_id')
        telegram_username = body_data.get('telegram_username', '').strip()
        full_name = body_data.get('full_name', '').strip()
        phone = body_data.get('phone', '').strip()
        user_type = body_data.get('user_type', '').strip()
        entity_type = body_data.get('entity_type', 'individual')
        inn = body_data.get('inn')
        organization_name = body_data.get('organization_name')
        photo_url = body_data.get('photo_url')
        
        if not telegram_user_id or not full_name or not phone:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'telegram_user_id, full_name и phone обязательны'}),
                'isBase64Encoded': False
            }
        
        if user_type not in ['client', 'carrier', 'logist']:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный тип пользователя'}),
                'isBase64Encoded': False
            }
        
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        print(f"[DEBUG] Looking for user with telegram_chat_id={telegram_user_id}")
        
        telegram_user_id_int = int(telegram_user_id)
        
        # Проверяем, существует ли пользователь с таким telegram_chat_id
        cur.execute(f"""
            SELECT user_id, telegram, full_name, phone, user_type
            FROM t_p93479485_cargo_map_integratio.users
            WHERE telegram_chat_id = {telegram_user_id_int}
            LIMIT 1
        """)
        
        row = cur.fetchone()
        existing_user = None
        if row:
            existing_user = {
                'user_id': row[0],
                'telegram': row[1],
                'full_name': row[2],
                'phone': row[3],
                'user_type': row[4]
            }
        
        # Экранируем данные
        full_name_escaped = full_name.replace("'", "''")
        phone_escaped = phone.replace("'", "''")
        telegram_username_escaped = telegram_username.replace("'", "''") if telegram_username else ''
        organization_name_escaped = organization_name.replace("'", "''") if organization_name else ''
        photo_url_escaped = photo_url.replace("'", "''") if photo_url else ''
        
        if existing_user:
            # Обновляем существующего пользователя
            user_id = existing_user['user_id']
            
            cur.execute(f"""
                UPDATE t_p93479485_cargo_map_integratio.users
                SET 
                    full_name = '{full_name_escaped}',
                    phone = '{phone_escaped}',
                    user_type = '{user_type}',
                    role = '{user_type}',
                    telegram = {f"'{telegram_username_escaped}'" if telegram_username else 'NULL'},
                    telegram_verified = TRUE,
                    entity_type = '{entity_type}',
                    inn = {f"'{inn}'" if inn else 'NULL'},
                    organization_name = {f"'{organization_name_escaped}'" if organization_name else 'NULL'},
                    avatar = {f"'{photo_url_escaped}'" if photo_url else 'NULL'},
                    role_status_set = TRUE,
                    updated_at = NOW()
                WHERE user_id = '{user_id}'
                RETURNING user_id, telegram, full_name, phone, user_type, role, created_at
            """)
            
            row = cur.fetchone()
            updated_user = {
                'user_id': row[0],
                'telegram': row[1],
                'full_name': row[2],
                'phone': row[3],
                'user_type': row[4],
                'role': row[5],
                'created_at': row[6]
            }
            conn.commit()
            
            print(f"[DEBUG] Updated existing user {user_id} with role {user_type}")
            
            result = {
                'success': True,
                'message': 'Регистрация завершена успешно!',
                'user': {
                    'user_id': updated_user['user_id'],
                    'telegram': updated_user['telegram'],
                    'full_name': updated_user['full_name'],
                    'phone': updated_user['phone'],
                    'role': updated_user['role'],
                    'telegram_verified': True,
                    'role_status_set': True
                }
            }
            
        else:
            # Создаём нового пользователя
            new_user_id = str(uuid.uuid4())
            
            # Генерируем placeholder email и password_hash для Telegram-пользователей
            email_placeholder = f"{new_user_id}@telegram.gruzclick.temp"
            password_hash_placeholder = "TELEGRAM_AUTH"
            
            print(f"[DEBUG] Attempting INSERT with: user_type={user_type}, entity_type={entity_type}, phone={phone}, full_name={full_name}")
            
            cur.execute(f"""
                INSERT INTO t_p93479485_cargo_map_integratio.users 
                (user_id, email, password_hash, telegram, telegram_verified, telegram_chat_id, phone, full_name, user_type, role, 
                 entity_type, inn, organization_name, avatar, role_status_set, email_verified, created_at, updated_at)
                VALUES (
                    '{new_user_id}',
                    '{email_placeholder}',
                    '{password_hash_placeholder}',
                    {f"'{telegram_username_escaped}'" if telegram_username else 'NULL'},
                    TRUE,
                    {telegram_user_id_int},
                    '{phone_escaped}',
                    '{full_name_escaped}',
                    '{user_type}',
                    '{user_type}',
                    '{entity_type}',
                    {f"'{inn}'" if inn else 'NULL'},
                    {f"'{organization_name_escaped}'" if organization_name else 'NULL'},
                    {f"'{photo_url_escaped}'" if photo_url else 'NULL'},
                    TRUE,
                    FALSE,
                    NOW(),
                    NOW()
                )
                RETURNING user_id, telegram, phone, full_name, user_type, role, created_at
            """)
            
            row = cur.fetchone()
            new_user = {
                'user_id': row[0],
                'telegram': row[1],
                'phone': row[2],
                'full_name': row[3],
                'user_type': row[4],
                'role': row[5],
                'created_at': row[6]
            }
            conn.commit()
            
            print(f"[DEBUG] Created new user {new_user_id} with role {user_type}")
            
            result = {
                'success': True,
                'message': 'Регистрация завершена успешно!',
                'user': {
                    'user_id': new_user['user_id'],
                    'telegram': new_user['telegram'],
                    'full_name': new_user['full_name'],
                    'phone': new_user['phone'],
                    'role': new_user['role'],
                    'telegram_verified': True,
                    'role_status_set': True,
                    'created_at': new_user['created_at'].isoformat() if new_user['created_at'] else None
                }
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Complete registration error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }