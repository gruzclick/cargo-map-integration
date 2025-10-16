'''
Business: User registration and authentication with email verification
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with request_id attribute
Returns: HTTP response with user data or verification status
'''

import json
import os
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
            return register_user(body_data, database_url)
        elif action == 'verify':
            return verify_email(body_data, database_url)
        elif action == 'login':
            return login_user(body_data, database_url, jwt_secret)
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        token = params.get('token')
        if token:
            return verify_email_by_token(token, database_url)
    
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
    
    if not all([email, password, full_name, user_type, entity_type]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    verification_token = secrets.token_urlsafe(32)
    verification_expires = datetime.now() + timedelta(hours=24)
    
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
    
    cur.execute("""
        INSERT INTO users (email, password_hash, full_name, user_type, entity_type, 
                          inn, organization_name, phone, verification_token, verification_token_expires)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING user_id
    """, (email, password_hash, full_name, user_type, entity_type, 
          inn, organization_name, phone, verification_token, verification_expires))
    
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
    
    send_verification_email(email, verification_token, full_name)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Registration successful. Please check your email to verify your account.',
            'user_id': str(user_id)
        }),
        'isBase64Encoded': False
    }

def send_verification_email(email: str, token: str, full_name: str):
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    
    if not smtp_user or not smtp_password:
        return
    
    verification_link = f"https://your-app-url.com/verify?token={token}"
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Подтверждение регистрации'
    msg['From'] = smtp_user
    msg['To'] = email
    
    text = f"""
    Здравствуйте, {full_name}!
    
    Пожалуйста, подтвердите вашу электронную почту, перейдя по ссылке:
    {verification_link}
    
    Ссылка действительна 24 часа.
    """
    
    html = f"""
    <html>
      <body>
        <h2>Здравствуйте, {full_name}!</h2>
        <p>Пожалуйста, подтвердите вашу электронную почту:</p>
        <p><a href="{verification_link}" style="background: #0EA5E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Подтвердить email</a></p>
        <p style="color: #666;">Ссылка действительна 24 часа.</p>
      </body>
    </html>
    """
    
    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    msg.attach(part1)
    msg.attach(part2)
    
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
    server.quit()

def verify_email_by_token(token: str, database_url: str) -> Dict[str, Any]:
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT user_id, verification_token_expires 
        FROM users 
        WHERE verification_token = %s AND email_verified = FALSE
    """, (token,))
    
    result = cur.fetchone()
    
    if not result:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid or already used token'}),
            'isBase64Encoded': False
        }
    
    user_id, expires = result
    
    if datetime.now() > expires:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Verification token expired'}),
            'isBase64Encoded': False
        }
    
    cur.execute("""
        UPDATE users 
        SET email_verified = TRUE, verification_token = NULL 
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
        'body': json.dumps({'message': 'Email verified successfully'}),
        'isBase64Encoded': False
    }

def verify_email(data: Dict[str, Any], database_url: str) -> Dict[str, Any]:
    token = data.get('token')
    return verify_email_by_token(token, database_url)

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
        SELECT user_id, full_name, user_type, email_verified 
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
    
    user_id, full_name, user_type, email_verified = result
    
    if not email_verified:
        return {
            'statusCode': 403,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Please verify your email first'}),
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
