import json
import os
import random
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram verification - send code and verify
    Args: event with httpMethod, body containing action, telegram_username, code
          context with request_id attribute
    Returns: HTTP response with verification status
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
            'body': ''
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
            user_id = body_data.get('user_id')
            phone = body_data.get('phone')
            
            if not telegram_username:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Telegram username is required'}),
                    'isBase64Encoded': False
                }
            
            if not user_id and not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id or phone is required'}),
                    'isBase64Encoded': False
                }
            
            code = str(random.randint(100000, 999999))
            expires_at = (datetime.now() + timedelta(minutes=10)).isoformat()
            
            telegram_escaped = telegram_username.replace("'", "''")
            
            if phone:
                phone_escaped = phone.replace("'", "''")
                cur.execute(f"SELECT user_id FROM t_p93479485_cargo_map_integratio.users WHERE phone = '{phone_escaped}'")
                result = cur.fetchone()
                if result:
                    user_id = str(result['user_id'])
            
            if not user_id:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            user_id_escaped = str(user_id).replace("'", "''")
            
            cur.execute(f"""
                DELETE FROM t_p93479485_cargo_map_integratio.telegram_verification_codes 
                WHERE user_id::text = '{user_id_escaped}'
            """)
            
            cur.execute(f"""
                INSERT INTO t_p93479485_cargo_map_integratio.telegram_verification_codes 
                (user_id, telegram_username, code, expires_at)
                VALUES ('{user_id_escaped}', '{telegram_escaped}', '{code}', '{expires_at}')
            """)
            conn.commit()
            
            telegram_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if telegram_bot_token:
                try:
                    import requests
                    message = f"🔐 Ваш код подтверждения: {code}\n\nКод действителен 10 минут."
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
            user_id = body_data.get('user_id')
            phone = body_data.get('phone')
            code = body_data.get('code', '').strip()
            
            if not code:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Code is required'}),
                    'isBase64Encoded': False
                }
            
            if not user_id and not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id or phone is required'}),
                    'isBase64Encoded': False
                }
            
            if phone:
                phone_escaped = phone.replace("'", "''")
                cur.execute(f"SELECT user_id FROM t_p93479485_cargo_map_integratio.users WHERE phone = '{phone_escaped}'")
                result = cur.fetchone()
                if result:
                    user_id = str(result['user_id'])
            
            if not user_id:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            user_id_escaped = str(user_id).replace("'", "''")
            code_escaped = code.replace("'", "''")
            
            cur.execute(f"""
                SELECT telegram_username, expires_at 
                FROM t_p93479485_cargo_map_integratio.telegram_verification_codes
                WHERE user_id::text = '{user_id_escaped}' AND code = '{code_escaped}'
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
            
            telegram_escaped = verification['telegram_username'].replace("'", "''")
            cur.execute(f"""
                UPDATE t_p93479485_cargo_map_integratio.users 
                SET telegram = '{telegram_escaped}', telegram_verified = TRUE 
                WHERE user_id::text = '{user_id_escaped}'
            """)
            
            cur.execute(f"""
                DELETE FROM t_p93479485_cargo_map_integratio.telegram_verification_codes 
                WHERE user_id::text = '{user_id_escaped}'
            """)
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Telegram успешно подтверждён',
                    'telegram_username': verification['telegram_username']
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
        
    except Exception as e:
        print(f"Error: {e}")
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
