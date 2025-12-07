import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Проверяет токен сессии и возвращает данные пользователя Telegram
    Args: event with httpMethod POST, body with session_token
          context with request_id attribute
    Returns: HTTP response with telegram user data or error
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
        session_token = body_data.get('session_token', '').strip()
        
        if not session_token:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Session token required'}),
                'isBase64Encoded': False
            }
        
        # Проверяем токен в базе
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Database not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        session_token_escaped = session_token.replace("'", "''")
        
        cur.execute(f"""
            SELECT 
                session_token,
                telegram_user_id,
                telegram_username,
                telegram_first_name,
                telegram_last_name,
                telegram_photo_url,
                expires_at,
                used
            FROM t_p93479485_cargo_map_integratio.telegram_auth_sessions
            WHERE session_token = '{session_token_escaped}'
        """)
        
        session = cur.fetchone()
        
        if not session:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Session not found or expired'}),
                'isBase64Encoded': False
            }
        
        # Проверяем срок действия
        expires_at = session['expires_at']
        if datetime.utcnow() > expires_at:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Session expired'}),
                'isBase64Encoded': False
            }
        
        # Проверяем, не использован ли токен
        if session['used']:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Session already used'}),
                'isBase64Encoded': False
            }
        
        # Проверяем, подтвердил ли пользователь вход (telegram_user_id != 0)
        if session['telegram_user_id'] == 0:
            cur.close()
            conn.close()
            return {
                'statusCode': 202,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'pending': True, 'message': 'Waiting for user confirmation'}),
                'isBase64Encoded': False
            }
        
        # Отмечаем токен как использованный
        cur.execute(f"""
            UPDATE t_p93479485_cargo_map_integratio.telegram_auth_sessions
            SET used = TRUE
            WHERE session_token = '{session_token_escaped}'
        """)
        conn.commit()
        
        # Проверяем, существует ли пользователь с таким telegram_chat_id
        cur.execute(f"""
            SELECT user_id, telegram_id, telegram, full_name, phone, phone_number, 
                   company, inn, avatar, role
            FROM t_p93479485_cargo_map_integratio.users
            WHERE telegram_chat_id = {session['telegram_user_id']}
            LIMIT 1
        """)
        
        existing_user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        result = {
            'success': True,
            'telegram_data': {
                'user_id': session['telegram_user_id'],
                'username': session['telegram_username'],
                'first_name': session['telegram_first_name'],
                'last_name': session['telegram_last_name'],
                'photo_url': session['telegram_photo_url']
            },
            'user_exists': existing_user is not None
        }
        
        if existing_user:
            result['user'] = {
                'user_id': str(existing_user['user_id']),
                'telegram_id': existing_user['telegram_id'],
                'telegram': existing_user['telegram'],
                'full_name': existing_user['full_name'],
                'phone_number': existing_user['phone_number'] or existing_user['phone'],
                'company': existing_user['company'],
                'inn': existing_user['inn'],
                'avatar': existing_user['avatar'],
                'role': existing_user['role']
            }
        
        print(f"[DEBUG] Verified session: {session_token}, user_exists: {existing_user is not None}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Verify error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }