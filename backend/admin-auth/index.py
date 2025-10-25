'''
Business: Admin registration, login, and password management
Args: event with httpMethod, body; context with request_id
Returns: HTTP response with admin data and JWT token
'''

import json
import os
import hashlib
import secrets
from typing import Dict, Any
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2
from psycopg2.extras import RealDictCursor

def generate_token(admin_id: int, email: str) -> str:
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    data = f"{admin_id}:{email}:{datetime.now().isoformat()}"
    return hashlib.sha256(f"{data}:{secret}".encode()).hexdigest()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def send_email(to_email: str, code: str) -> bool:
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    if not all([smtp_host, smtp_user, smtp_password]):
        return False
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Код восстановления пароля - ГрузКлик Админ'
    msg['From'] = smtp_user
    msg['To'] = to_email
    
    text = f"""
Здравствуйте!

Ваш код для восстановления пароля администратора: {code}

Код действителен 15 минут.

ГрузКлик
    """
    
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Восстановление пароля</h2>
        <p>Ваш код:</p>
        <div style="background: #f0f0f0; padding: 20px; font-size: 24px; font-weight: bold; text-align: center;">{code}</div>
        <p style="color: #666; font-size: 12px;">Код действителен 15 минут.</p>
      </body>
    </html>
    """
    
    msg.attach(MIMEText(text, 'plain', 'utf-8'))
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        return True
    except:
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
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
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if action == 'register':
            email = body_data.get('email')
            password = body_data.get('password')
            full_name = body_data.get('full_name')
            
            if not email or not password or not full_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email, password, and full name are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT id FROM admins WHERE email = %s", (email,))
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin with this email already exists'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            two_factor_secret = secrets.token_hex(16)
            
            cur.execute(
                """
                INSERT INTO admins (email, password_hash, full_name, two_factor_secret)
                VALUES (%s, %s, %s, %s)
                RETURNING id, email, full_name, created_at
                """,
                (email, password_hash, full_name, two_factor_secret)
            )
            admin = cur.fetchone()
            conn.commit()
            
            token = generate_token(admin['id'], admin['email'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'admin': {
                        'id': admin['id'],
                        'email': admin['email'],
                        'full_name': admin['full_name'],
                        'created_at': admin['created_at'].isoformat()
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            email = body_data.get('email')
            password = body_data.get('password')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email and password are required'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, email, full_name, is_active FROM admins WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            admin = cur.fetchone()
            
            if not admin:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid email or password'}),
                    'isBase64Encoded': False
                }
            
            if not admin['is_active']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin account is deactivated'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token(admin['id'], admin['email'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'admin': {
                        'id': admin['id'],
                        'email': admin['email'],
                        'full_name': admin['full_name']
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'send_reset_code':
            email = body_data.get('email')
            
            if not email:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT id FROM admins WHERE email = %s", (email,))
            admin = cur.fetchone()
            
            if not admin:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin not found'}),
                    'isBase64Encoded': False
                }
            
            code = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
            expires_at = datetime.now() + timedelta(minutes=15)
            
            cur.execute(
                "INSERT INTO password_reset_codes (email, code, expires_at) VALUES (%s, %s, %s)",
                (email, code, expires_at)
            )
            conn.commit()
            
            email_sent = send_email(email, code)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': 'Reset code sent' if email_sent else 'Reset code created (email not configured)',
                    'email_sent': email_sent
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'reset_password':
            email = body_data.get('email')
            code = body_data.get('code')
            new_password = body_data.get('new_password')
            
            if not email or not code or not new_password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email, code, and new password are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """
                SELECT id FROM password_reset_codes 
                WHERE email = %s AND code = %s AND used = false AND expires_at > NOW()
                ORDER BY created_at DESC LIMIT 1
                """,
                (email, code)
            )
            reset_code = cur.fetchone()
            
            if not reset_code:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid or expired reset code'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(new_password)
            
            cur.execute(
                "UPDATE admins SET password_hash = %s, updated_at = NOW() WHERE email = %s",
                (password_hash, email)
            )
            
            cur.execute(
                "UPDATE password_reset_codes SET used = true WHERE id = %s",
                (reset_code['id'],)
            )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Password reset successfully'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()