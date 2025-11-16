import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get real-time map data with cargo and drivers positions + user statistics
    Args: event - dict with httpMethod (GET, POST, OPTIONS), path for /stats endpoint
          context - object with request_id attribute
    Returns: HTTP response with markers data or user statistics (updated)
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('path', '/')
    
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
    
    database_url = os.environ.get('DATABASE_URL')
    
    if method == 'GET' and '/stats' in path:
        try:
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            cur.execute("""
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN user_type = 'driver' THEN 1 END) as drivers,
                    COUNT(CASE WHEN user_type = 'client' THEN 1 END) as clients,
                    COUNT(CASE WHEN user_type = 'logist' THEN 1 END) as logists,
                    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users
                FROM t_p93479485_cargo_map_integratio.users
            """)
            
            row = cur.fetchone()
            cur.close()
            conn.close()
            
            result = {
                'total': int(row[0]) if row[0] else 0,
                'drivers': int(row[1]) if row[1] else 0,
                'clients': int(row[2]) if row[2] else 0,
                'logists': int(row[3]) if row[3] else 0,
                'verified': int(row[4]) if row[4] else 0
            }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    database_url = os.environ.get('DATABASE_URL')
    
    if method == 'GET':
        try:
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            # Get cargo (Simple Query Protocol - no parameters)
            cur.execute("""
                SELECT cargo_id, name, details, weight, lat, lng, status, cargo_type,
                       ready_status, ready_time, quantity, destination_warehouse, 
                       client_address, client_rating
                FROM cargo 
                WHERE status = 'waiting'
                LIMIT 100
            """)
            cargo_rows = cur.fetchall()
            
            # Get drivers (Simple Query Protocol - no parameters)
            cur.execute("""
                SELECT driver_id, name, vehicle_type, capacity, lat, lng, status, vehicle_category,
                       rating, free_space, destination_warehouse, phone
                FROM drivers
                LIMIT 100
            """)
            driver_rows = cur.fetchall()
            
            cur.close()
            conn.close()
            
            markers: List[Dict[str, Any]] = []
            
            for row in cargo_rows:
                markers.append({
                    'id': row[0],
                    'type': 'cargo',
                    'lat': float(row[4]) if row[4] else 55.7558,
                    'lng': float(row[5]) if row[5] else 37.6173,
                    'name': row[1] or 'Груз',
                    'details': f"{row[2] or 'Описание отсутствует'}, {row[3] or 0}кг",
                    'status': 'Ожидает',
                    'cargoType': row[7] if row[7] else 'box',
                    'readyStatus': row[8] if row[8] else 'ready',
                    'readyTime': row[9].isoformat() if row[9] else None,
                    'quantity': int(row[10]) if row[10] else 0,
                    'weight': float(row[3]) if row[3] else 0,
                    'destinationWarehouse': row[11] if row[11] else 'Не указан',
                    'clientAddress': row[12] if row[12] else 'Не указан',
                    'clientRating': float(row[13]) if row[13] else 5.0
                })
            
            for row in driver_rows:
                vehicle_status = row[6] if row[6] in ['free', 'has_space', 'full'] else 'free'
                markers.append({
                    'id': row[0],
                    'type': 'driver',
                    'lat': float(row[4]) if row[4] else 55.7558,
                    'lng': float(row[5]) if row[5] else 37.6173,
                    'name': row[1] or 'Водитель',
                    'details': f"{row[2] or 'Грузовик'}, грузоподъёмность {row[3] or 0}т",
                    'status': 'Свободен' if row[6] == 'free' else 'Занят',
                    'vehicleCategory': row[7] if row[7] else 'car',
                    'vehicleStatus': vehicle_status,
                    'rating': float(row[8]) if row[8] else 5.0,
                    'capacity': float(row[3]) if row[3] else 0,
                    'freeSpace': float(row[9]) if row[9] else 0,
                    'destinationWarehouse': row[10] if row[10] else 'Не указан',
                    'phone': row[11] if row[11] else ''
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'markers': markers}),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e), 'markers': []}),
                'isBase64Encoded': False
            }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            conn = psycopg2.connect(database_url)
            cur = conn.cursor()
            
            if action == 'update_location':
                user_id = body_data.get('user_id', '')
                lat = body_data.get('lat', 0)
                lng = body_data.get('lng', 0)
                
                # Simple Query - embed values directly
                cur.execute(f"""
                    UPDATE drivers 
                    SET lat = {lat}, lng = {lng}, updated_at = CURRENT_TIMESTAMP 
                    WHERE driver_id = '{user_id}'
                """)
                
            elif action == 'update_status':
                user_id = body_data.get('user_id', '')
                status = body_data.get('status', 'free')
                
                # Simple Query - embed values directly
                cur.execute(f"""
                    UPDATE drivers 
                    SET status = '{status}', updated_at = CURRENT_TIMESTAMP 
                    WHERE driver_id = '{user_id}'
                """)
                
            elif action == 'accept_cargo':
                cargo_id = body_data.get('cargo_id', '')
                driver_id = body_data.get('driver_id', '')
                
                # Simple Query - embed values directly
                cur.execute(f"""
                    UPDATE cargo 
                    SET status = 'accepted', driver_id = '{driver_id}', updated_at = CURRENT_TIMESTAMP 
                    WHERE cargo_id = '{cargo_id}'
                """)
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e), 'success': False}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }