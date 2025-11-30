import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Webhook для получения сообщений от Telegram бота и сохранения chat_id
    Args: event with httpMethod, body containing Telegram update
          context with request_id attribute
    Returns: HTTP response confirming webhook received
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
        
        # Получаем данные из Telegram update
        message = body_data.get('message', {})
        from_user = message.get('from', {})
        
        chat_id = from_user.get('id')
        username = from_user.get('username', '').lower()
        
        if not chat_id or not username:
            print(f"[DEBUG] Webhook received but no chat_id or username found")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        print(f"[DEBUG] Webhook received from @{username} with chat_id={chat_id}")
        
        # Сохраняем chat_id в базу данных
        dsn = os.environ.get('DATABASE_URL')
        if dsn:
            conn = psycopg2.connect(dsn)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            
            username_escaped = username.replace("'", "''")
            
            # Обновляем chat_id для пользователя с таким username
            cur.execute(f"""
                UPDATE t_p93479485_cargo_map_integratio.users 
                SET telegram_chat_id = {chat_id}
                WHERE LOWER(telegram) = '{username_escaped}'
            """)
            
            rows_updated = cur.rowcount
            conn.commit()
            
            print(f"[DEBUG] Updated {rows_updated} users with chat_id={chat_id} for @{username}")
            
            cur.close()
            conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Webhook error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
