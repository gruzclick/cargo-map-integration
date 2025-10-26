'''
Authentication and authorization helpers
'''

import hashlib
import os
from typing import Dict, Any, Optional
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

class AuthError(Exception):
    pass

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
    return conn

def verify_admin_token(token: str) -> Optional[Dict[str, Any]]:
    if not token or len(token) < 10:
        raise AuthError('Invalid token format')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            SELECT id, email, full_name, role, is_active 
            FROM admins 
            WHERE token = %s AND is_active = true
            """,
            (token,)
        )
        admin = cur.fetchone()
        
        if not admin:
            raise AuthError('Invalid or expired token')
        
        return dict(admin)
    finally:
        cur.close()
        conn.close()

def check_admin_permission(admin: Dict[str, Any], required_role: str) -> bool:
    role_hierarchy = {
        'superadmin': 3,
        'moderator': 2,
        'support': 1
    }
    
    user_level = role_hierarchy.get(admin.get('role', ''), 0)
    required_level = role_hierarchy.get(required_role, 0)
    
    if user_level < required_level:
        raise AuthError(f'Insufficient permissions. Required: {required_role}')
    
    return True

def require_auth(event: Dict[str, Any], required_role: str = 'support') -> Dict[str, Any]:
    token = event.get('headers', {}).get('X-Auth-Token') or \
            event.get('headers', {}).get('x-auth-token')
    
    if not token:
        raise AuthError('Authentication token required')
    
    admin = verify_admin_token(token)
    check_admin_permission(admin, required_role)
    
    return admin

def log_admin_action(admin_id: int, action: str, details: Dict[str, Any], ip: str):
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            """
            INSERT INTO admin_logs (admin_id, action, details, ip_address, created_at)
            VALUES (%s, %s, %s, %s, NOW())
            """,
            (admin_id, action, psycopg2.extras.Json(details), ip)
        )
        conn.commit()
    except Exception as e:
        print(f"Failed to log admin action: {e}")
    finally:
        cur.close()
        conn.close()
