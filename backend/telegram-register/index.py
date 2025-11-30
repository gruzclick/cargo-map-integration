import json
import os
import random
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration via Telegram verification
    Args: event with httpMethod, body containing action, telegram_username, code, phone
          context with request_id attribute
    Returns: HTTP response with registration status and user data
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
            telegram_username = body_data.get('telegram_username', '').strip().lstrip('@')
            phone = body_data.get('phone', '').strip()
            
            if not telegram_username:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Telegram username is required'}),
                    'isBase64Encoded': False
                }
            
            telegram_escaped = telegram_username.replace("'", "''")
            cur.execute(f"SELECT user_id FROM t_p93479485_cargo_map_integratio.users WHERE telegram = '{telegram_escaped}' AND telegram_verified = TRUE")
            existing_user = cur.fetchone()
            
            if existing_user:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Этот Telegram уже зарегистрирован'}),
                    'isBase64Encoded': False
                }
            
            code = str(random.randint(100000, 999999))
            expires_at = (datetime.now() + timedelta(minutes=10)).isoformat()
            
            cur.execute(f"""
                DELETE FROM t_p93479485_cargo_map_integratio.telegram_verification_codes 
                WHERE telegram_username = '{telegram_escaped}'
            """)
            
            cur.execute(f"""
                INSERT INTO t_p93479485_cargo_map_integratio.telegram_verification_codes 
                (user_id, telegram_username, code, expires_at)
                VALUES (0, '{telegram_escaped}', '{code}', '{expires_at}')
            """)
            conn.commit()
            
            telegram_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if telegram_bot_token:
                try:
                    import requests
                    message = f"🔐 Ваш код подтверждения для регистрации: {code}\n\nКод действителен 10 минут."
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
                    'code_for_demo': code
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'verify_code':
            telegram_username = body_data.get('telegram_username', '').strip().lstrip('@')
            code = body_data.get('code', '').strip()
            phone = body_data.get('phone', '').strip()
            full_name = body_data.get('full_name', '').strip()
            
            if not code or not telegram_username:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Code and telegram_username are required'}),
                    'isBase64Encoded': False
                }
            
            telegram_escaped = telegram_username.replace("'", "''")
            code_escaped = code.replace("'", "''")
            
            cur.execute(f"""
                SELECT user_id, expires_at 
                FROM t_p93479485_cargo_map_integratio.telegram_verification_codes
                WHERE telegram_username = '{telegram_escaped}' AND code = '{code_escaped}'
            """)
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
            
            new_user_id = str(uuid.uuid4())
            phone_escaped = phone.replace("'", "''") if phone else ''
            full_name_escaped = full_name.replace("'", "''") if full_name else telegram_username
            
            cur.execute(f"""
                INSERT INTO t_p93479485_cargo_map_integratio.users 
                (user_id, telegram, telegram_verified, phone, full_name, email_verified, created_at, updated_at, role_status_set)
                VALUES (
                    '{new_user_id}',
                    '{telegram_escaped}',
                    TRUE,
                    {'NULL' if not phone else f"'{phone_escaped}'"},
                    '{full_name_escaped}',
                    FALSE,
                    NOW(),
                    NOW(),
                    FALSE
                )
                RETURNING user_id, telegram, phone, full_name, created_at
            """)
            new_user = cur.fetchone()
            
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
                    'message': 'Регистрация успешна!',
                    'user': {
                        'user_id': str(new_user['user_id']),
                        'telegram': new_user['telegram'],
                        'telegram_verified': True,
                        'phone': new_user.get('phone'),
                        'full_name': new_user['full_name'],
                        'role_status_set': False,
                        'created_at': new_user['created_at'].isoformat() if new_user['created_at'] else None
                    }
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action. Use send_code or verify_code'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()