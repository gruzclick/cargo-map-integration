import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для управления профилями пользователей
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        if not dsn:
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'DATABASE_URL not configured'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor()
        
        # GET - получить профиль пользователя
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute('''
                SELECT user_id, full_name, passport_series, passport_number, 
                       phone, rating, reviews_count, created_at, updated_at
                FROM users
                WHERE user_id = %s
            ''', (user_id,))
            
            row = cursor.fetchone()
            
            if not row:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Profile not found'}),
                    'isBase64Encoded': False
                }
            
            profile = {
                'user_id': row[0],
                'full_name': row[1],
                'passport_series': row[2],
                'passport_number': row[3],
                'phone': row[4],
                'rating': float(row[5]) if row[5] else 0.0,
                'reviews_count': row[6],
                'created_at': row[7].isoformat() if row[7] else None,
                'updated_at': row[8].isoformat() if row[8] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(profile),
                'isBase64Encoded': False
            }
        
        # POST - создать новый профиль
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            full_name = body_data.get('full_name', '').strip()
            passport_series = body_data.get('passport_series', '').strip()
            passport_number = body_data.get('passport_number', '').strip()
            phone = body_data.get('phone', '').strip()
            
            if not user_id or not full_name or not passport_series or not passport_number or not phone:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'All fields are required'}),
                    'isBase64Encoded': False
                }
            
            # Проверка существующего пользователя
            cursor.execute('SELECT user_id FROM users WHERE user_id = %s', (user_id,))
            existing = cursor.fetchone()
            
            if existing:
                # Обновляем существующего пользователя
                cursor.execute('''
                    UPDATE users 
                    SET full_name = %s, passport_series = %s, passport_number = %s, phone = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = %s
                    RETURNING user_id, full_name, passport_series, passport_number, phone, 
                              rating, reviews_count, created_at, updated_at
                ''', (full_name, passport_series, passport_number, phone, user_id))
            else:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'User not found. Please register first'}),
                    'isBase64Encoded': False
                }
            
            row = cursor.fetchone()
            conn.commit()
            
            profile = {
                'user_id': row[0],
                'full_name': row[1],
                'passport_series': row[2],
                'passport_number': row[3],
                'phone': row[4],
                'rating': float(row[5]) if row[5] else 0.0,
                'reviews_count': row[6],
                'created_at': row[7].isoformat() if row[7] else None,
                'updated_at': row[8].isoformat() if row[8] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(profile),
                'isBase64Encoded': False
            }
        
        # PUT - обновить профиль
        if method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            user_id = body_data.get('user_id')
            full_name = body_data.get('full_name')
            passport_series = body_data.get('passport_series')
            passport_number = body_data.get('passport_number')
            phone = body_data.get('phone')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            updates = []
            params = []
            
            if full_name:
                updates.append('full_name = %s')
                params.append(full_name.strip())
            if passport_series:
                updates.append('passport_series = %s')
                params.append(passport_series.strip())
            if passport_number:
                updates.append('passport_number = %s')
                params.append(passport_number.strip())
            if phone:
                updates.append('phone = %s')
                params.append(phone.strip())
            
            if not updates:
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'No fields to update'}),
                    'isBase64Encoded': False
                }
            
            updates.append('updated_at = CURRENT_TIMESTAMP')
            params.append(user_id)
            
            query = f'''
                UPDATE users 
                SET {', '.join(updates)}
                WHERE user_id = %s
                RETURNING user_id, full_name, passport_series, passport_number, phone, 
                          rating, reviews_count, created_at, updated_at
            '''
            
            cursor.execute(query, params)
            row = cursor.fetchone()
            
            if not row:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': 'Profile not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            profile = {
                'user_id': row[0],
                'full_name': row[1],
                'passport_series': row[2],
                'passport_number': row[3],
                'phone': row[4],
                'rating': float(row[5]) if row[5] else 0.0,
                'reviews_count': row[6],
                'created_at': row[7].isoformat() if row[7] else None,
                'updated_at': row[8].isoformat() if row[8] else None
            }
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(profile),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }