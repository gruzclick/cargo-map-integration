import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get all users from database for admin panel
    Args: event - HTTP request event with httpMethod, headers
          context - context object with request_id attribute
    Returns: HTTP response with users list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database URL not configured'})
        }
    
    conn = None
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                user_id,
                email,
                full_name,
                user_type,
                entity_type,
                inn,
                organization_name,
                phone,
                email_verified,
                phone_verified,
                created_at,
                updated_at,
                login_attempts,
                last_login_ip
            FROM t_p93479485_cargo_map_integratio.users
            ORDER BY created_at DESC
        """)
        
        rows = cursor.fetchall()
        users = []
        
        for row in rows:
            users.append({
                'user_id': str(row[0]),
                'email': row[1],
                'full_name': row[2],
                'user_type': row[3],
                'entity_type': row[4],
                'inn': row[5],
                'organization_name': row[6],
                'phone': row[7],
                'email_verified': row[8],
                'phone_verified': row[9],
                'created_at': row[10].isoformat() if row[10] else None,
                'updated_at': row[11].isoformat() if row[11] else None,
                'login_attempts': row[12],
                'last_login_ip': row[13]
            })
        
        cursor.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'users': users, 'count': len(users)})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if conn:
            conn.close()
