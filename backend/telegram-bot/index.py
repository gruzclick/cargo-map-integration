'''
Business: Telegram bot for sending verification codes
Args: event - dict with httpMethod, body (from Telegram webhook)
      context - object with request_id attribute
Returns: HTTP response for Telegram webhook
'''

import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if 'message' in body_data:
            return handle_telegram_message(body_data)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }

def handle_telegram_message(update: Dict[str, Any]) -> Dict[str, Any]:
    database_url = os.environ.get('DATABASE_URL')
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    message = update.get('message', {})
    chat_id = message.get('chat', {}).get('id')
    text = message.get('text', '')
    
    if not chat_id or not text:
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    if text.startswith('/start'):
        send_telegram_message(bot_token, chat_id, 
            "👋 Привет! Я бот для подтверждения регистрации.\n\n"
            "После регистрации на сайте отправьте сюда код подтверждения, который придет в SMS или укажите при регистрации."
        )
    elif len(text) == 6 and text.isdigit():
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT user_id, full_name, phone 
            FROM users 
            WHERE telegram_code = %s 
            AND telegram_code_expires > CURRENT_TIMESTAMP
            AND phone_verified = FALSE
        """, (text,))
        
        result = cur.fetchone()
        
        if result:
            user_id, full_name, phone = result
            
            cur.execute("""
                UPDATE users 
                SET phone_verified = TRUE, 
                    telegram_code = NULL,
                    telegram_chat_id = %s
                WHERE user_id = %s
            """, (chat_id, user_id))
            
            conn.commit()
            
            send_telegram_message(bot_token, chat_id,
                f"✅ Отлично, {full_name}!\n\n"
                f"Ваш телефон {phone} подтвержден.\n"
                f"Теперь вы можете войти в систему!"
            )
        else:
            send_telegram_message(bot_token, chat_id,
                "❌ Неверный или истекший код.\n\n"
                "Попробуйте зарегистрироваться снова."
            )
        
        cur.close()
        conn.close()
    else:
        send_telegram_message(bot_token, chat_id,
            "❓ Отправьте 6-значный код подтверждения, который вы получили при регистрации."
        )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }

def send_telegram_message(bot_token: str, chat_id: int, text: str):
    import urllib.request
    import urllib.parse
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }).encode()
    
    req = urllib.request.Request(url, data=data)
    urllib.request.urlopen(req)
