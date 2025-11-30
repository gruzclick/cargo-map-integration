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
    Business: User registration and login via Telegram verification
    Args: event with httpMethod, body containing action, telegram_username, code, phone
          context with request_id attribute
    Returns: HTTP response with registration/login status and user data
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
            
            is_login = existing_user is not None
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
            code_sent_via_bot = False
            telegram_error = None
            
            if telegram_bot_token and telegram_bot_token.strip():
                try:
                    import requests
                    action_text = 'входа' if is_login else 'регистрации'
                    message = f"🔐 Ваш код подтверждения для {action_text}: {code}\n\nКод действителен 10 минут."
                    
                    # Получаем chat_id из базы данных
                    chat_id = None
                    
                    cur.execute(f"""
                        SELECT telegram_chat_id 
                        FROM t_p93479485_cargo_map_integratio.users 
                        WHERE LOWER(telegram) = '{telegram_escaped}'
                        LIMIT 1
                    """)
                    
                    chat_result = cur.fetchone()
                    if chat_result and chat_result['telegram_chat_id']:
                        chat_id = chat_result['telegram_chat_id']
                        print(f"[DEBUG] Found chat_id from DB: {chat_id} for @{telegram_username}")
                    else:
                        print(f"[DEBUG] No chat_id in DB for @{telegram_username}, trying getUpdates")
                        
                        # Fallback: пробуем получить из updates
                        updates_response = requests.get(
                            f'https://api.telegram.org/bot{telegram_bot_token}/getUpdates',
                            timeout=5
                        )
                        
                        if updates_response.status_code == 200:
                            updates_data = updates_response.json()
                            if updates_data.get('ok'):
                                for update in updates_data.get('result', []):
                                    msg = update.get('message', {})
                                    from_user = msg.get('from', {})
                                    if from_user.get('username', '').lower() == telegram_username.lower():
                                        chat_id = from_user.get('id')
                                        print(f"[DEBUG] Found chat_id from updates: {chat_id} for @{telegram_username}")
                                        
                                        # Сохраняем в базу для будущих использований
                                        cur.execute(f"""
                                            UPDATE t_p93479485_cargo_map_integratio.users 
                                            SET telegram_chat_id = {chat_id}
                                            WHERE LOWER(telegram) = '{telegram_escaped}'
                                        """)
                                        conn.commit()
                                        break
                    
                    if chat_id:
                        response = requests.post(
                            f'https://api.telegram.org/bot{telegram_bot_token}/sendMessage',
                            json={
                                'chat_id': chat_id,
                                'text': message
                            },
                            timeout=5
                        )
                        
                        print(f"[DEBUG] Send message response: status={response.status_code}, body={response.text}")
                        
                        if response.status_code == 200:
                            response_data = response.json()
                            if response_data.get('ok'):
                                code_sent_via_bot = True
                            else:
                                telegram_error = response_data.get('description', 'Unknown error')
                                print(f"[ERROR] Telegram API error: {telegram_error}")
                        else:
                            telegram_error = f"HTTP {response.status_code}"
                            print(f"[ERROR] HTTP error: {response.status_code} - {response.text}")
                    else:
                        telegram_error = "Пользователь должен сначала написать боту /start"
                        print(f"[ERROR] Chat ID not found for @{telegram_username}. User needs to start bot first.")
                        
                except Exception as e:
                    telegram_error = str(e)
                    print(f"[ERROR] Failed to send Telegram message: {e}")
                    import traceback
                    print(traceback.format_exc())
            
            response_body = {
                'success': True,
                'message': f'Код отправлен в Telegram @{telegram_username}',
                'is_login': is_login,
                'bot_configured': code_sent_via_bot
            }
            
            if not code_sent_via_bot:
                response_body['code_for_demo'] = code
                if telegram_error:
                    response_body['bot_error'] = telegram_error
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(response_body),
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
            
            cur.execute(f"SELECT user_id, telegram, phone, full_name, role, carrier_status, client_status, client_ready_date, role_status_set, current_lat, current_lng, telegram_verified FROM t_p93479485_cargo_map_integratio.users WHERE telegram = '{telegram_escaped}' AND telegram_verified = TRUE")
            existing_user = cur.fetchone()
            
            if existing_user:
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
                        'message': 'Вход выполнен успешно!',
                        'is_login': True,
                        'user': {
                            'user_id': str(existing_user['user_id']),
                            'telegram': existing_user['telegram'],
                            'telegram_verified': existing_user['telegram_verified'],
                            'phone': existing_user.get('phone'),
                            'full_name': existing_user.get('full_name'),
                            'role': existing_user.get('role'),
                            'carrier_status': existing_user.get('carrier_status'),
                            'client_status': existing_user.get('client_status'),
                            'client_ready_date': existing_user['client_ready_date'].isoformat() if existing_user.get('client_ready_date') else None,
                            'role_status_set': existing_user.get('role_status_set', False),
                            'current_lat': float(existing_user['current_lat']) if existing_user.get('current_lat') else None,
                            'current_lng': float(existing_user['current_lng']) if existing_user.get('current_lng') else None
                        }
                    }),
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
                    'is_login': False,
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