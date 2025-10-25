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
    conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
    return conn

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
        
        elif action == 'get_stats':
            cur.execute("SELECT COUNT(*) as total FROM t_p93479485_cargo_map_integratio.users")
            users_count = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM t_p93479485_cargo_map_integratio.deliveries WHERE status = 'active'")
            active_orders = cur.fetchone()['total']
            
            cur.execute("SELECT COALESCE(SUM(delivery_price), 0) as total FROM t_p93479485_cargo_map_integratio.deliveries WHERE status = 'completed'")
            total_revenue = cur.fetchone()['total']
            
            cur.execute("SELECT COUNT(*) as total FROM t_p93479485_cargo_map_integratio.carriers")
            active_drivers = cur.fetchone()['total']
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'stats': {
                        'totalUsers': users_count,
                        'activeOrders': active_orders,
                        'totalRevenue': float(total_revenue),
                        'activeDrivers': active_drivers
                    }
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'get_users':
            cur.execute("SELECT user_id, phone, full_name, email, user_type, email_verified, created_at FROM t_p93479485_cargo_map_integratio.users ORDER BY created_at DESC")
            users_data = cur.fetchall()
            
            users_list = []
            for user in users_data:
                users_list.append({
                    'id': user['user_id'],
                    'phone_number': user['phone'] or '-',
                    'full_name': user['full_name'],
                    'email': user['email'],
                    'role': user['user_type'],
                    'status': 'active' if user['email_verified'] else 'inactive',
                    'created_at': user['created_at'].isoformat() if user['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': users_list}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_deliveries':
            cur.execute("SELECT delivery_id, client_id, carrier_id, status, pickup_address, delivery_address, delivery_price, created_at FROM t_p93479485_cargo_map_integratio.deliveries ORDER BY created_at DESC")
            deliveries_data = cur.fetchall()
            
            deliveries_list = []
            for delivery in deliveries_data:
                deliveries_list.append({
                    'id': delivery['delivery_id'],
                    'user_id': delivery['client_id'],
                    'driver_id': delivery['carrier_id'],
                    'status': delivery['status'],
                    'pickup_address': delivery['pickup_address'],
                    'delivery_address': delivery['delivery_address'],
                    'delivery_price': float(delivery['delivery_price']) if delivery['delivery_price'] else 0,
                    'created_at': delivery['created_at'].isoformat() if delivery['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'deliveries': deliveries_list}),
                'isBase64Encoded': False
            }
        
        elif action == 'update_user_status':
            user_id = body_data.get('user_id')
            status = body_data.get('status')
            
            if not user_id or not status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User ID and status are required'}),
                    'isBase64Encoded': False
                }
            
            email_verified = True if status == 'active' else False
            cur.execute("UPDATE t_p93479485_cargo_map_integratio.users SET email_verified = %s WHERE user_id = %s", (email_verified, user_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'User status updated'}),
                'isBase64Encoded': False
            }
        
        elif action == 'update_delivery_status':
            delivery_id = body_data.get('delivery_id')
            status = body_data.get('status')
            
            if not delivery_id or not status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Delivery ID and status are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("UPDATE t_p93479485_cargo_map_integratio.deliveries SET status = %s WHERE delivery_id = %s", (status, delivery_id))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Delivery status updated'}),
                'isBase64Encoded': False
            }
        
        elif action == 'delete_test_users':
            admin_token = event.get('headers', {}).get('x-auth-token')
            
            if not admin_token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Admin token required'}),
                    'isBase64Encoded': False
                }
            
            test_emails = [
                'test@example.com',
                'newuser@example.com',
                'client@test.ru',
                'carrier@test.ru',
                'company@test.ru'
            ]
            
            cur.execute(
                """
                DELETE FROM t_p93479485_cargo_map_integratio.users 
                WHERE email = ANY(%s)
                RETURNING user_id, email
                """,
                (test_emails,)
            )
            deleted_users = cur.fetchall()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': f'Deleted {len(deleted_users)} test users',
                    'deleted': [{'id': str(u['user_id']), 'email': u['email']} for u in deleted_users]
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
    
    finally:
        cur.close()
        conn.close()