'''
Business: Admin registration, login, and password management
Args: event with httpMethod, body; context with request_id
Returns: HTTP response with admin data and JWT token
'''

import json
import os
import hashlib
import secrets
import re
from typing import Dict, Any, List
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2
from psycopg2.extras import RealDictCursor

class ValidationError(Exception):
    pass

class RateLimiter:
    def __init__(self):
        self.attempts: Dict[str, List[datetime]] = {}
        self.lockouts: Dict[str, datetime] = {}
    
    def is_locked_out(self, ip: str) -> bool:
        if ip in self.lockouts:
            lockout_time = self.lockouts[ip]
            if datetime.now() < lockout_time:
                return True
            else:
                del self.lockouts[ip]
        return False
    
    def check_rate_limit(self, ip: str, max_attempts: int = 5, window_seconds: int = 300) -> Dict:
        if self.is_locked_out(ip):
            remaining_time = (self.lockouts[ip] - datetime.now()).seconds
            return {'allowed': False, 'reason': 'locked_out', 'retry_after': remaining_time}
        
        now = datetime.now()
        window_start = now - timedelta(seconds=window_seconds)
        
        if ip not in self.attempts:
            self.attempts[ip] = []
        
        self.attempts[ip] = [t for t in self.attempts[ip] if t > window_start]
        
        if len(self.attempts[ip]) >= max_attempts:
            self.lockouts[ip] = now + timedelta(minutes=15)
            return {'allowed': False, 'reason': 'rate_limited', 'retry_after': 900}
        
        self.attempts[ip].append(now)
        return {'allowed': True, 'attempts_remaining': max_attempts - len(self.attempts[ip])}
    
    def clear_attempts(self, ip: str):
        if ip in self.attempts:
            del self.attempts[ip]
        if ip in self.lockouts:
            del self.lockouts[ip]

rate_limiter = RateLimiter()

def validate_email(email: str) -> str:
    if not email or not isinstance(email, str):
        raise ValidationError('Email is required')
    email = email.strip().lower()
    if len(email) > 254:
        raise ValidationError('Email is too long')
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError('Invalid email format')
    return email

def validate_password(password: str, min_length: int = 8) -> str:
    if not password or not isinstance(password, str):
        raise ValidationError('Password is required')
    if len(password) < min_length:
        raise ValidationError(f'Password must be at least {min_length} characters')
    if len(password) > 128:
        raise ValidationError('Password is too long')
    if min_length > 1:
        has_letter = re.search(r'[a-zA-Z]', password)
        has_digit = re.search(r'\d', password)
        if not has_letter or not has_digit:
            raise ValidationError('Password must contain both letters and numbers')
    return password

def validate_full_name(name: str) -> str:
    if not name or not isinstance(name, str):
        raise ValidationError('Full name is required')
    name = name.strip()
    if len(name) < 2:
        raise ValidationError('Full name is too short')
    if len(name) > 100:
        raise ValidationError('Full name is too long')
    if not re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', name):
        raise ValidationError('Full name contains invalid characters')
    return name

def validate_action(action: str, allowed_actions: list) -> str:
    if not action or not isinstance(action, str):
        raise ValidationError('Action is required')
    if action not in allowed_actions:
        raise ValidationError(f'Invalid action')
    return action

def generate_token(admin_id: int, email: str) -> str:
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    data = f"{admin_id}:{email}"
    return hashlib.sha256(f"{data}:{secret}".encode()).hexdigest()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_admin_token(token: str, conn) -> Dict[str, Any]:
    if not token:
        return {'valid': False, 'error': 'Требуется токен администратора'}
    
    cur = conn.cursor()
    cur.execute("SELECT id, email, full_name, is_active FROM admins WHERE is_active = true")
    admins = cur.fetchall()
    
    for admin in admins:
        expected_token_data = f"{admin['id']}:{admin['email']}"
        secret = os.environ.get('JWT_SECRET', 'default-secret-key')
        expected_token = hashlib.sha256(f"{expected_token_data}:{secret}".encode()).hexdigest()
        
        if token == expected_token:
            return {
                'valid': True, 
                'admin_id': admin['id'],
                'email': admin['email'],
                'full_name': admin['full_name']
            }
    
    return {'valid': False, 'error': 'Недействительный токен администратора'}

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
        print(f"SMTP not configured: host={smtp_host}, user={smtp_user}, password={'set' if smtp_password else 'not set'}")
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
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Admin-Token',
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
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON'}),
            'isBase64Encoded': False
        }
    
    allowed_actions = ['register', 'login', 'send_reset_code', 'verify_reset_code', 'reset_password', 
                       'get_stats', 'get_users', 'get_deliveries', 'update_delivery_status', 'update_user_status',
                       'delete_test_users', 'get_biometric_status', 'save_biometric', 'get_all_users',
                       'delete_table_data', 'clear_all_test_data']
    
    action = body_data.get('action')
    
    auth_actions = ['register', 'login', 'send_reset_code', 'verify_reset_code', 'reset_password']
    if action in auth_actions:
        ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
        
        rate_check = rate_limiter.check_rate_limit(ip, max_attempts=5, window_seconds=300)
        if not rate_check['allowed']:
            return {
                'statusCode': 429,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Retry-After': str(rate_check.get('retry_after', 900))
                },
                'body': json.dumps({
                    'error': 'Too many login attempts. Please try again later.',
                    'retry_after': rate_check.get('retry_after', 900)
                }),
                'isBase64Encoded': False
            }
    
    try:
        action = validate_action(body_data.get('action'), allowed_actions)
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if action == 'register':
            try:
                email = validate_email(body_data.get('email'))
                password = validate_password(body_data.get('password'))
                full_name = validate_full_name(body_data.get('full_name'))
            except ValidationError as e:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)}),
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
            try:
                email = validate_email(body_data.get('email'))
                password = validate_password(body_data.get('password'), min_length=1)
            except ValidationError as e:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, email, full_name, is_active FROM admins WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            admin = cur.fetchone()
            
            if not admin:
                rate_limiter.check_rate_limit(ip, max_attempts=5, window_seconds=300)
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
            
            rate_limiter.clear_attempts(ip)
            
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
            try:
                email = validate_email(body_data.get('email'))
            except ValidationError as e:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)}),
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
        
        elif action == 'get_all_users':
            cur.execute("""
                SELECT user_id, phone, full_name, email, user_type, entity_type, 
                       email_verified, phone_verified, created_at, updated_at
                FROM t_p93479485_cargo_map_integratio.users 
                ORDER BY created_at DESC
            """)
            users_data = cur.fetchall()
            
            users_list = []
            for user in users_data:
                users_list.append({
                    'id': str(user['user_id']),
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'phone': user['phone'] or 'Не указан',
                    'user_type': user['user_type'],
                    'entity_type': user['entity_type'],
                    'email_verified': user['email_verified'],
                    'phone_verified': user['phone_verified'],
                    'status': 'active' if user['email_verified'] else 'inactive',
                    'created_at': user['created_at'].isoformat() if user['created_at'] else None,
                    'updated_at': user['updated_at'].isoformat() if user['updated_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'users': users_list,
                    'total': len(users_list)
                }),
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
            admin_token = event.get('headers', {}).get('x-auth-token') or event.get('headers', {}).get('X-Auth-Token')
            token_check = verify_admin_token(admin_token, conn)
            
            if not token_check['valid']:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': token_check.get('error', 'Недействительный токен')}),
                    'isBase64Encoded': False
                }
            
            test_emails = [
                'test@example.com',
                'newuser@example.com',
                'client@test.ru',
                'carrier@test.ru',
                'company@test.ru'
            ]
            
            deleted_count = 0
            for email in test_emails:
                cur.execute(
                    "DELETE FROM t_p93479485_cargo_map_integratio.users WHERE email = %s",
                    (email,)
                )
                deleted_count += cur.rowcount
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'message': f'Удалено {deleted_count} тестовых пользователей'
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'delete_table_data':
            admin_token = event.get('headers', {}).get('x-auth-token') or event.get('headers', {}).get('X-Auth-Token')
            token_check = verify_admin_token(admin_token, conn)
            
            if not token_check['valid']:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': token_check.get('error', 'Недействительный токен')}),
                    'isBase64Encoded': False
                }
            
            table = body_data.get('table')
            allowed_tables = ['users', 'drivers', 'cargo', 'deliveries', 'login_logs']
            
            if table not in allowed_tables:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Invalid table. Allowed: {", ".join(allowed_tables)}'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"DELETE FROM t_p93479485_cargo_map_integratio.{table}")
            deleted_count = cur.rowcount
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'deleted_count': deleted_count,
                    'table': table
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'clear_all_test_data':
            admin_token = event.get('headers', {}).get('x-auth-token') or event.get('headers', {}).get('X-Auth-Token')
            token_check = verify_admin_token(admin_token, conn)
            
            if not token_check['valid']:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': token_check.get('error', 'Недействительный токен')}),
                    'isBase64Encoded': False
                }
            
            deleted_counts = {}
            tables = ['users', 'drivers', 'cargo', 'deliveries', 'login_logs']
            
            for table in tables:
                cur.execute(f"DELETE FROM t_p93479485_cargo_map_integratio.{table}")
                deleted_counts[table] = cur.rowcount
            
            cur.execute("DELETE FROM t_p93479485_cargo_map_integratio.admins WHERE email = 'admin@test.com'")
            deleted_counts['admins'] = cur.rowcount
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'deleted': deleted_counts
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