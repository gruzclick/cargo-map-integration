import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Создать заявку перевозчика с привязкой к автомобилю и складу'''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    user_id = event.get('headers', {}).get('X-User-Id')
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'X-User-Id header required'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    vehicle_id = body_data.get('vehicle_id')
    warehouse_marketplace = body_data.get('warehouse_marketplace', '')
    warehouse_city = body_data.get('warehouse_city', '')
    warehouse_address = body_data.get('warehouse_address', '')
    capacity_boxes = body_data.get('capacity_boxes', 0)
    capacity_pallets = body_data.get('capacity_pallets', 0)
    latitude = body_data.get('latitude')
    longitude = body_data.get('longitude')
    
    if not warehouse_marketplace or latitude is None or longitude is None:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'warehouse_marketplace, latitude, longitude are required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute('''
        INSERT INTO orders_carrier 
        (user_id, vehicle_id, warehouse_marketplace, warehouse_city, warehouse_address, 
         capacity_boxes, capacity_pallets, latitude, longitude, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'active')
        RETURNING id, created_at
    ''', (user_id, vehicle_id, warehouse_marketplace, warehouse_city, warehouse_address,
          capacity_boxes, capacity_pallets, latitude, longitude))
    
    result = cur.fetchone()
    order_id, created_at = result
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'order_id': str(order_id),
            'created_at': created_at.isoformat()
        })
    }
