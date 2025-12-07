'''
Business: Обновление и получение личных данных пользователя с синхронизацией между устройствами
Args: event с httpMethod, body; context с request_id
Returns: HTTP response с обновлёнными данными пользователя
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute("""
                SELECT user_id, telegram_id, full_name, phone_number, telegram, company, inn, avatar, role
                FROM t_p93479485_cargo_map_integratio.users
                WHERE user_id = %s
            """, (user_id,))
            
            user_data = cur.fetchone()
            cur.close()
            conn.close()
            
            if not user_data:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': dict(user_data)
                }),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            full_name = body_data.get('full_name')
            phone_number = body_data.get('phone_number')
            telegram = body_data.get('telegram')
            company = body_data.get('company')
            inn = body_data.get('inn')
            avatar = body_data.get('avatar')
            
            if not full_name or not phone_number:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Full name and phone are required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                UPDATE t_p93479485_cargo_map_integratio.users
                SET full_name = %s,
                    phone_number = %s,
                    telegram = %s,
                    company = %s,
                    inn = %s,
                    avatar = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s
                RETURNING user_id, telegram_id, full_name, phone_number, telegram, company, inn, avatar, role
            """, (full_name, phone_number, telegram, company, inn, avatar, user_id))
            
            updated_user = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            if not updated_user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': dict(updated_user)
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"Error in user-profile-update: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
