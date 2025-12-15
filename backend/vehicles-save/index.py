import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Сохранить данные автомобилей перевозчика в базу данных
    POST /vehicles-save
    Body: { "vehicles": [...] }
    '''
    method: str = event.get('httpMethod', 'POST')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Получаем user_id из заголовков
    user_id = event.get('headers', {}).get('X-User-Id') or event.get('headers', {}).get('x-user-id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Missing X-User-Id header'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        vehicles: List[Dict] = body_data.get('vehicles', [])
        
        if not vehicles:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'No vehicles provided'}),
                'isBase64Encoded': False
            }
        
        # Подключение к БД
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        saved_vehicles = []
        
        for vehicle in vehicles:
            # Валидация обязательных полей
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
            
            # Вставка в БД
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
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }
