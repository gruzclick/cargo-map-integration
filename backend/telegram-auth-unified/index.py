'''
Единая функция авторизации и регистрации через Telegram
Объединяет telegram-verify и telegram-register
'''
import json
import os
import random
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database connection not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'send_code':
            return send_verification_code(conn, cur, body_data)
        elif action == 'verify_code':
            return verify_code(conn, cur, body_data)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action. Use "send_code" or "verify_code"'}),
                'isBase64Encoded': False
            }
            
    except Exception as e:
        print(f"Error in telegram-auth-unified: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def send_verification_code(conn, cur, body_data: Dict[str, Any]) -> Dict[str, Any]:
    '''Отправить код верификации в Telegram'''
    telegram_username = body_data.get('telegram_username', '').strip().lstrip('@')
    phone = body_data.get('phone', '').strip()
    user_id = body_data.get('user_id')
    
    if not telegram_username:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Telegram username is required'}),
            'isBase64Encoded': False
        }
    
    telegram_escaped = telegram_username.replace("'", "''")
    
    cur.execute(f"""
        SELECT user_id, telegram_verified 
        FROM t_p93479485_cargo_map_integratio.users 
        WHERE telegram = '{telegram_escaped}'
    """)
    existing_user = cur.fetchone()
    
    is_login = existing_user is not None and existing_user['telegram_verified']
    is_registration = existing_user is None
    
    if phone and not user_id:
        phone_escaped = phone.replace("'", "''")
        cur.execute(f"""
            SELECT user_id 
            FROM t_p93479485_cargo_map_integratio.users 
            WHERE phone = '{phone_escaped}'
        """)
        result = cur.fetchone()
        if result:
            user_id = str(result['user_id'])
    
    code = str(random.randint(100000, 999999))
    expires_at = (datetime.now() + timedelta(minutes=10)).isoformat()
    
    cur.execute(f"""
        DELETE FROM t_p93479485_cargo_map_integratio.telegram_verification_codes 
        WHERE telegram_username = '{telegram_escaped}'
    """)
    
    user_id_value = user_id if user_id else '0'
    cur.execute(f"""
        INSERT INTO t_p93479485_cargo_map_integratio.telegram_verification_codes 
        (user_id, telegram_username, code, expires_at)
        VALUES ('{user_id_value}', '{telegram_escaped}', '{code}', '{expires_at}')
    """)
    conn.commit()
    
    telegram_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if telegram_bot_token and telegram_bot_token.strip():
        try:
            import requests
            action_text = 'входа' if is_login else 'регистрации'
            message = f"🔐 Ваш код подтверждения для {action_text}: {code}\n\nКод действителен 10 минут."
            
            requests.post(
                f'https://api.telegram.org/bot{telegram_bot_token}/sendMessage',
                json={
                    'chat_id': f'@{telegram_username}',
                    'text': message
                },
                timeout=5
            )
        except Exception as e:
            print(f"Failed to send Telegram message: {e}")
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'message': f'Код отправлен в Telegram @{telegram_username}',
            'is_login': is_login,
            'is_registration': is_registration,
            'code_for_demo': code
        }),
        'isBase64Encoded': False
    }


def verify_code(conn, cur, body_data: Dict[str, Any]) -> Dict[str, Any]:
    '''Проверить код и выполнить вход/регистрацию'''
    telegram_username = body_data.get('telegram_username', '').strip().lstrip('@')
    code = body_data.get('code', '').strip()
    phone = body_data.get('phone', '').strip()
    full_name = body_data.get('full_name', '').strip()
    
    if not code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Code is required'}),
            'isBase64Encoded': False
        }
    
    telegram_escaped = telegram_username.replace("'", "''") if telegram_username else ''
    code_escaped = code.replace("'", "''")
    
    if telegram_username:
        cur.execute(f"""
            SELECT telegram_username, expires_at, user_id
            FROM t_p93479485_cargo_map_integratio.telegram_verification_codes
            WHERE telegram_username = '{telegram_escaped}' AND code = '{code_escaped}'
        """)
    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'telegram_username is required'}),
            'isBase64Encoded': False
        }
    
    verification = cur.fetchone()
    
    if not verification:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный код'}),
            'isBase64Encoded': False
        }
    
    if datetime.fromisoformat(verification['expires_at']) < datetime.now():
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код истёк'}),
            'isBase64Encoded': False
        }
    
    cur.execute(f"""
        SELECT user_id, telegram_verified, phone, full_name
        FROM t_p93479485_cargo_map_integratio.users 
        WHERE telegram = '{telegram_escaped}'
    """)
    existing_user = cur.fetchone()
    
    if existing_user and existing_user['telegram_verified']:
        user_id = str(existing_user['user_id'])
        
        cur.execute(f"""
            DELETE FROM t_p93479485_cargo_map_integratio.telegram_verification_codes 
            WHERE telegram_username = '{telegram_escaped}'
        """)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'is_login': True,
                'user_id': user_id,
                'telegram_username': telegram_username,
                'phone': existing_user['phone'],
                'full_name': existing_user['full_name']
            }),
            'isBase64Encoded': False
        }
    
    else:
        if not phone or not full_name:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'phone and full_name are required for registration'}),
                'isBase64Encoded': False
            }
        
        new_user_id = str(uuid.uuid4())
        phone_escaped = phone.replace("'", "''")
        full_name_escaped = full_name.replace("'", "''")
        
        if existing_user:
            cur.execute(f"""
                UPDATE t_p93479485_cargo_map_integratio.users 
                SET telegram = '{telegram_escaped}', 
                    telegram_verified = TRUE,
                    phone = '{phone_escaped}',
                    full_name = '{full_name_escaped}',
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id::text = '{str(existing_user["user_id"])}'
                RETURNING user_id
            """)
            result = cur.fetchone()
            user_id = str(result['user_id'])
        else:
            cur.execute(f"""
                INSERT INTO t_p93479485_cargo_map_integratio.users 
                (user_id, telegram, telegram_verified, phone, full_name, role)
                VALUES ('{new_user_id}', '{telegram_escaped}', TRUE, '{phone_escaped}', '{full_name_escaped}', 'user')
                RETURNING user_id
            """)
            result = cur.fetchone()
            user_id = str(result['user_id'])
        
        cur.execute(f"""
            DELETE FROM t_p93479485_cargo_map_integratio.telegram_verification_codes 
            WHERE telegram_username = '{telegram_escaped}'
        """)
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'is_registration': True,
                'user_id': user_id,
                'telegram_username': telegram_username,
                'phone': phone,
                'full_name': full_name
            }),
            'isBase64Encoded': False
        }
