import json
import os
import psycopg2
from typing import Dict, Any
import requests

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка массовой Telegram рассылки пользователям
    Args: event - dict с httpMethod, body (message, audience, imageUrl)
          context - object с request_id, function_name
    Returns: HTTP response с количеством отправленных сообщений
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
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        message = body_data.get('message', '')
        audience = body_data.get('audience', 'all')
        image_url = body_data.get('imageUrl', '')
        
        if not message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Message is required'})
            }
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Bot token not configured'})
            }
        
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        query = "SELECT telegram_chat_id, user_type FROM users WHERE telegram_chat_id IS NOT NULL"
        conditions = []
        
        if audience == 'cargo':
            conditions.append("user_type = 'client'")
        elif audience == 'vehicle':
            conditions.append("user_type = 'carrier'")
        elif audience == 'active':
            conditions.append("updated_at > NOW() - INTERVAL '7 days'")
        elif audience == 'inactive':
            conditions.append("updated_at < NOW() - INTERVAL '30 days'")
        
        if conditions:
            query += " AND " + " AND ".join(conditions)
        
        cur.execute(query)
        users = cur.fetchall()
        
        sent_count = 0
        failed_count = 0
        
        for telegram_chat_id, _ in users:
            try:
                if image_url:
                    url = f"https://api.telegram.org/bot{bot_token}/sendPhoto"
                    payload = {
                        'chat_id': telegram_chat_id,
                        'photo': image_url,
                        'caption': message,
                        'parse_mode': 'Markdown'
                    }
                else:
                    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
                    payload = {
                        'chat_id': telegram_chat_id,
                        'text': message,
                        'parse_mode': 'Markdown'
                    }
                
                response = requests.post(url, json=payload, timeout=10)
                
                if response.status_code == 200:
                    sent_count += 1
                else:
                    failed_count += 1
            except Exception:
                failed_count += 1
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'sent': sent_count,
                'failed': failed_count,
                'total': len(users)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }