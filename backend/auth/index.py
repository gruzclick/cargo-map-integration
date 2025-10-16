'''
Business: User registration and authentication with Telegram verification
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with request_id attribute
Returns: HTTP response with user data or verification status
'''

import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
import jwt
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'register':
            return register_user(body_data, database_url)
        elif action == 'verify_code':
            return verify_telegram_code(body_data, database_url)
        elif action == 'login':
            return login_user(body_data, database_url, jwt_secret)
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def register_user(data: Dict[str, Any], database_url: str) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    user_type = data.get('user_type')
    entity_type = data.get('entity_type')
    inn = data.get('inn')
    organization_name = data.get('organization_name')
    phone = data.get('phone')
    
    if not all([email, password, full_name, user_type, entity_type, phone]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    telegram_code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    code_expires = datetime.now() + timedelta(minutes=15)
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("SELECT user_id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email already registered'}),
            'isBase64Encoded': False
        }
    
    cur.execute("SELECT user_id FROM users WHERE phone = %s", (phone,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Phone already registered'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        INSERT INTO users (email, password_hash, full_name, user_type, entity_type, 
                          inn, organization_name, phone, telegram_code, telegram_code_expires, phone_verified)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE)
        RETURNING user_id
    """, (email, password_hash, full_name, user_type, entity_type, 
          inn, organization_name, phone, telegram_code, code_expires))
    
    user_id = cur.fetchone()[0]
    
    if user_type == 'carrier':
        vehicle_type = data.get('vehicle_type', 'car')
        capacity = data.get('capacity', 0)
        
        cur.execute("""
            INSERT INTO carriers (user_id, vehicle_type, capacity, vehicle_status)
            VALUES (%s, %s, %s, 'free')
        """, (user_id, vehicle_type, capacity))
    
    conn.commit()
    cur.close()
    conn.close()
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    bot_username = get_bot_username(bot_token)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Registration successful',
            'user_id': str(user_id),
            'telegram_code': telegram_code,
            'bot_username': bot_username,
            'phone': phone
        }),
        'isBase64Encoded': False
    }

def verify_telegram_code(data: Dict[str, Any], database_url: str) -> Dict[str, Any]:
    phone = data.get('phone')
    code = data.get('code')
    
    if not phone or not code:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing phone or code'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT user_id, telegram_code_expires 
        FROM users 
        WHERE phone = %s AND telegram_code = %s AND phone_verified = FALSE
    """, (phone, code))
    
    result = cur.fetchone()
    
    if not result:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid code or phone'}),
            'isBase64Encoded': False
        }
    
    user_id, expires = result
    
    if datetime.now() > expires:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Code expired'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        UPDATE users 
        SET phone_verified = TRUE, telegram_code = NULL 
        WHERE user_id = %s
    """, (user_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': 'Phone verified successfully'}),
        'isBase64Encoded': False
    }

def login_user(data: Dict[str, Any], database_url: str, jwt_secret: str) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing email or password'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT user_id, full_name, user_type, phone_verified 
        FROM users 
        WHERE email = %s AND password_hash = %s
    """, (email, password_hash))
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if not result:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid credentials'}),
            'isBase64Encoded': False
        }
    
    user_id, full_name, user_type, phone_verified = result
    
    if not phone_verified:
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Please verify your phone first'}),
            'isBase64Encoded': False
        }
    
    token = jwt.encode({
        'user_id': str(user_id),
        'email': email,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, jwt_secret, algorithm='HS256')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'token': token,
            'user': {
                'user_id': str(user_id),
                'email': email,
                'full_name': full_name,
                'user_type': user_type
            }
        }),
        'isBase64Encoded': False
    }

def get_bot_username(bot_token: str) -> str:
    if not bot_token:
        return 'your_bot'
    
    try:
        url = f"https://api.telegram.org/bot{bot_token}/getMe"
        req = urllib.request.Request(url)
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode())
        return data.get('result', {}).get('username', 'your_bot')
    except:
        return 'your_bot'
