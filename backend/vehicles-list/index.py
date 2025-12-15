import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получить список сохранённых автомобилей пользователя
    GET /vehicles-list
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
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
        # Подключение к БД
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        # Получаем все автомобили пользователя
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
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }
