import json
import os
import psycopg2
from typing import Dict, Any
import uuid

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Сохранение и получение профиля пользователя (адреса, транспорт)
    Args: event - dict с httpMethod, body, headers
          context - object с request_id, function_name
    Returns: HTTP response с данными профиля
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('x-user-id') or headers.get('X-User-Id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    try:
        database_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute("""
                SELECT id, type, name, address, city, postcode, country, phone, is_default
                FROM t_p93479485_cargo_map_integratio.user_addresses
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            addresses = cur.fetchall()
            
            cur.execute("""
                SELECT id, type, brand, model, year, license_plate, capacity, color, photo
                FROM t_p93479485_cargo_map_integratio.user_vehicles
                WHERE user_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            vehicles = cur.fetchall()
            
            result = {
                'addresses': [
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
                ],
                'vehicles': [
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
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps(result)
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            data_type = body_data.get('type')
            
            if data_type == 'address':
                addr_type = body_data.get('address_type', 'warehouse')
                name = body_data.get('name')
                address = body_data.get('address')
                city = body_data.get('city')
                postcode = body_data.get('postcode')
                country = body_data.get('country', 'Россия')
                phone = body_data.get('phone')
                is_default = body_data.get('is_default', False)
                
                cur.execute("""
                    INSERT INTO t_p93479485_cargo_map_integratio.user_addresses (user_id, type, name, address, city, postcode, country, phone, is_default)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (user_id, addr_type, name, address, city, postcode, country, phone, is_default))
                
                address_id = cur.fetchone()[0]
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'id': str(address_id)})
                }
            
            elif data_type == 'vehicle':
                vehicle_type = body_data.get('vehicle_type')
                brand = body_data.get('brand')
                model = body_data.get('model')
                year = body_data.get('year')
                license_plate = body_data.get('license_plate')
                capacity = body_data.get('capacity', 0)
                color = body_data.get('color')
                photo = body_data.get('photo')
                
                cur.execute("""
                    INSERT INTO t_p93479485_cargo_map_integratio.user_vehicles (user_id, type, brand, model, year, license_plate, capacity, color, photo)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (user_id, vehicle_type, brand, model, year, license_plate, capacity, color, photo))
                
                vehicle_id = cur.fetchone()[0]
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'id': str(vehicle_id)})
                }
        
        if method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            data_type = body_data.get('type')
            item_id = body_data.get('id')
            
            if data_type == 'address':
                cur.execute("DELETE FROM t_p93479485_cargo_map_integratio.user_addresses WHERE id = %s AND user_id = %s", (item_id, user_id))
            elif data_type == 'vehicle':
                cur.execute("DELETE FROM t_p93479485_cargo_map_integratio.user_vehicles WHERE id = %s AND user_id = %s", (item_id, user_id))
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }