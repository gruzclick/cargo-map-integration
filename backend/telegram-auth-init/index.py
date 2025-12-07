import json
import os
import secrets
from datetime import datetime, timedelta
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Инициализирует процесс авторизации через Telegram, создаёт токен и ссылку на бота
    Args: event with httpMethod POST
          context with request_id attribute
    Returns: HTTP response with bot link and session token
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
        # Генерируем уникальный токен сессии
        session_token = f"AUTH_{secrets.token_urlsafe(32)}"
        
        # Сохраняем токен в базу (истекает через 5 минут)
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
        
        expires_at = datetime.utcnow() + timedelta(minutes=5)
        
        cur.execute(f"""
            INSERT INTO t_p93479485_cargo_map_integratio.telegram_auth_sessions 
            (session_token, telegram_user_id, expires_at, used)
            VALUES ('{session_token}', 0, '{expires_at.isoformat()}', FALSE)
        """)
        
        conn.commit()
        cur.close()
        conn.close()
        
        # Формируем ссылку на бота с параметром
        bot_username = 'gruzclick_2fa_bot'
        bot_link = f'https://t.me/{bot_username}?start={session_token}'
        
        print(f"[DEBUG] Created auth session: {session_token}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'session_token': session_token,
                'bot_link': bot_link,
                'expires_in': 300
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Init error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
