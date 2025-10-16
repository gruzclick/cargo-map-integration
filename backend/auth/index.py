'''
Business: User registration and authentication without verification
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with request_id attribute
Returns: HTTP response with user data or auth token
'''

import json
import os
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2
import jwt

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
            return register_user(body_data, database_url, jwt_secret)
        elif action == 'login':
            return login_user(body_data, database_url, jwt_secret)
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def register_user(data: Dict[str, Any], database_url: str, jwt_secret: str) -> Dict[str, Any]:
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
                          inn, organization_name, phone, phone_verified)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, TRUE)
        RETURNING user_id
    """, (email, password_hash, full_name, user_type, entity_type, 
          inn, organization_name, phone))
    
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
            'message': 'Registration successful',
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
        SELECT user_id, full_name, user_type
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
    
    user_id, full_name, user_type = result
    
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
