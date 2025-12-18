'''
Единая функция управления профилем пользователя
Включает личные данные, адреса, транспорт и паспортные данные
'''
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            'body': json.dumps({'error': 'X-User-Id header required'}),
            'isBase64Encoded': False
        }
    
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        
        query_params = event.get('queryStringParameters', {}) or {}
        section = query_params.get('section', 'all')
        
        if method == 'GET':
            return get_profile(conn, user_id, section)
        elif method == 'POST':
            return create_profile_item(conn, user_id, event)
        elif method == 'PUT':
            return update_profile(conn, user_id, event)
        elif method == 'DELETE':
            return delete_profile_item(conn, user_id, event)
        else:
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        print(f"Error in user-profile-unified: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_profile(conn, user_id: str, section: str) -> Dict[str, Any]:
    '''Получить данные профиля пользователя'''
    cur = conn.cursor()
    result = {}
    
    if section in ['all', 'personal']:
        cur.execute("""
            SELECT user_id, telegram_id, full_name, phone_number, telegram, company, inn, 
                   avatar, role, passport_series, passport_number, rating, reviews_count
            FROM t_p93479485_cargo_map_integratio.users
            WHERE user_id = %s
        """, (user_id,))
        
        user_data = cur.fetchone()
        if user_data:
            result['personal'] = {
                'user_id': user_data[0],
                'telegram_id': user_data[1],
                'full_name': user_data[2],
                'phone_number': user_data[3],
                'telegram': user_data[4],
                'company': user_data[5],
                'inn': user_data[6],
                'avatar': user_data[7],
                'role': user_data[8],
                'passport_series': user_data[9],
                'passport_number': user_data[10],
                'rating': float(user_data[11]) if user_data[11] else 0.0,
                'reviews_count': user_data[12]
            }
    
    if section in ['all', 'addresses']:
        cur.execute("""
            SELECT id, type, name, address, city, postcode, country, phone, is_default
            FROM t_p93479485_cargo_map_integratio.user_addresses
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        
        addresses = cur.fetchall()
        result['addresses'] = [
            {
                'id': str(row[0]),
                'type': row[1],
                'name': row[2],
                'address': row[3],
                'city': row[4],
                'postcode': row[5],
                'country': row[6],
                'phone': row[7],
                'is_default': row[8]
            }
            for row in addresses
        ]
    
    if section in ['all', 'vehicles']:
        cur.execute("""
            SELECT id, type, brand, model, year, license_plate, capacity, color, photo
            FROM t_p93479485_cargo_map_integratio.user_vehicles
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        
        vehicles = cur.fetchall()
        result['vehicles'] = [
            {
                'id': str(row[0]),
                'type': row[1],
                'brand': row[2],
                'model': row[3],
                'year': row[4],
                'license_plate': row[5],
                'capacity': row[6],
                'color': row[7],
                'photo': row[8]
            }
            for row in vehicles
        ]
    
    cur.close()
    conn.close()
    
    if not result:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Profile not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'profile': result}),
        'isBase64Encoded': False
    }


def update_profile(conn, user_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Обновить личные данные пользователя'''
    body_data = json.loads(event.get('body', '{}'))
    cur = conn.cursor()
    
    updates = []
    params = []
    
    fields = ['full_name', 'phone_number', 'telegram', 'company', 'inn', 'avatar', 
              'passport_series', 'passport_number']
    
    for field in fields:
        if field in body_data:
            updates.append(f'{field} = %s')
            params.append(body_data[field])
    
    if not updates:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No fields to update'}),
            'isBase64Encoded': False
        }
    
    updates.append('updated_at = CURRENT_TIMESTAMP')
    params.append(user_id)
    
    query = f"""
        UPDATE t_p93479485_cargo_map_integratio.users
        SET {', '.join(updates)}
        WHERE user_id = %s
        RETURNING user_id, full_name, phone_number, company, inn
    """
    
    cur.execute(query, params)
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
            'user': {
                'user_id': updated_user[0],
                'full_name': updated_user[1],
                'phone_number': updated_user[2],
                'company': updated_user[3],
                'inn': updated_user[4]
            }
        }),
        'isBase64Encoded': False
    }


def create_profile_item(conn, user_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Создать адрес или транспорт'''
    body_data = json.loads(event.get('body', '{}'))
    item_type = body_data.get('type')
    cur = conn.cursor()
    
    if item_type == 'address':
        addr_type = body_data.get('address_type', 'warehouse')
        name = body_data.get('name')
        address = body_data.get('address')
        city = body_data.get('city')
        postcode = body_data.get('postcode')
        country = body_data.get('country', 'Россия')
        phone = body_data.get('phone')
        is_default = body_data.get('is_default', False)
        
        cur.execute("""
            INSERT INTO t_p93479485_cargo_map_integratio.user_addresses 
            (user_id, type, name, address, city, postcode, country, phone, is_default)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, addr_type, name, address, city, postcode, country, phone, is_default))
        
        item_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'id': str(item_id)}),
            'isBase64Encoded': False
        }
    
    elif item_type == 'vehicle':
        vehicle_type = body_data.get('vehicle_type')
        brand = body_data.get('brand')
        model = body_data.get('model')
        year = body_data.get('year')
        license_plate = body_data.get('license_plate')
        capacity = body_data.get('capacity', 0)
        color = body_data.get('color')
        photo = body_data.get('photo')
        
        cur.execute("""
            INSERT INTO t_p93479485_cargo_map_integratio.user_vehicles 
            (user_id, type, brand, model, year, license_plate, capacity, color, photo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_id, vehicle_type, brand, model, year, license_plate, capacity, color, photo))
        
        item_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'id': str(item_id)}),
            'isBase64Encoded': False
        }
    
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid type. Use "address" or "vehicle"'}),
            'isBase64Encoded': False
        }


def delete_profile_item(conn, user_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Удалить адрес или транспорт'''
    body_data = json.loads(event.get('body', '{}'))
    item_type = body_data.get('type')
    item_id = body_data.get('id')
    cur = conn.cursor()
    
    if item_type == 'address':
        cur.execute("""
            DELETE FROM t_p93479485_cargo_map_integratio.user_addresses 
            WHERE id = %s AND user_id = %s
        """, (item_id, user_id))
    elif item_type == 'vehicle':
        cur.execute("""
            DELETE FROM t_p93479485_cargo_map_integratio.user_vehicles 
            WHERE id = %s AND user_id = %s
        """, (item_id, user_id))
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid type'}),
            'isBase64Encoded': False
        }
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }
