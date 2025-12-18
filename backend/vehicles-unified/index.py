'''
Единая функция управления транспортом перевозчиков
Поддерживает получение списка, сохранение и удаление автомобилей
'''
import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Missing X-User-Id header'}),
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        
        if method == 'GET':
            return get_vehicles(conn, user_id)
        elif method == 'POST':
            return save_vehicles(conn, user_id, event)
        elif method == 'DELETE':
            return delete_vehicle(conn, user_id, event)
        else:
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }


def get_vehicles(conn, user_id: str) -> Dict[str, Any]:
    '''Получить список автомобилей пользователя'''
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id, driver_name, driver_phone, driver_license_number,
               car_brand, car_model, car_number, car_number_photo_url,
               capacity_boxes, capacity_pallets, created_at
        FROM vehicles
        WHERE user_id = %s
        ORDER BY created_at DESC
    ''', (user_id,))
    
    rows = cur.fetchall()
    vehicles = []
    
    for row in rows:
        vehicles.append({
            'id': str(row[0]),
            'driver_name': row[1],
            'driver_phone': row[2],
            'driver_license_number': row[3],
            'car_brand': row[4],
            'car_model': row[5],
            'car_number': row[6],
            'car_number_photo_url': row[7],
            'capacity_boxes': row[8],
            'capacity_pallets': row[9],
            'created_at': row[10].isoformat()
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'vehicles': vehicles
        }),
        'isBase64Encoded': False
    }


def save_vehicles(conn, user_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Сохранить новые автомобили'''
    body_data = json.loads(event.get('body', '{}'))
    vehicles: List[Dict] = body_data.get('vehicles', [])
    
    if not vehicles:
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'No vehicles provided'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    saved_vehicles = []
    
    for vehicle in vehicles:
        required_fields = ['driver_name', 'driver_phone', 'driver_license_number', 
                         'car_brand', 'car_model', 'car_number']
        
        missing = [f for f in required_fields if not vehicle.get(f)]
        if missing:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': False, 
                    'error': f'Missing required fields: {", ".join(missing)}'
                }),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            INSERT INTO vehicles 
            (user_id, driver_name, driver_phone, driver_license_number, 
             car_brand, car_model, car_number, car_number_photo_url, 
             capacity_boxes, capacity_pallets)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, driver_name, car_brand, car_number, created_at
        ''', (
            user_id,
            vehicle['driver_name'],
            vehicle['driver_phone'],
            vehicle['driver_license_number'],
            vehicle['car_brand'],
            vehicle['car_model'],
            vehicle['car_number'],
            vehicle.get('car_number_photo_url'),
            vehicle.get('capacity_boxes', 0),
            vehicle.get('capacity_pallets', 0)
        ))
        
        row = cur.fetchone()
        saved_vehicles.append({
            'id': str(row[0]),
            'driver_name': row[1],
            'car_brand': row[2],
            'car_number': row[3],
            'created_at': row[4].isoformat()
        })
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'saved_vehicles': saved_vehicles
        }),
        'isBase64Encoded': False
    }


def delete_vehicle(conn, user_id: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Удалить автомобиль'''
    body_data = json.loads(event.get('body', '{}'))
    vehicle_id = body_data.get('id')
    
    if not vehicle_id:
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Vehicle ID required'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    
    cur.execute("""
        DELETE FROM vehicles 
        WHERE id = %s AND user_id = %s
        RETURNING id
    """, (vehicle_id, user_id))
    
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if not deleted:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Vehicle not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'vehicle_id': vehicle_id}),
        'isBase64Encoded': False
    }
