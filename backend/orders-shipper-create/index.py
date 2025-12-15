import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Создать заявку грузоотправителя (можно несколько грузов за раз)'''
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
    cargo_items: List[Dict] = body_data.get('cargo_items', [])
    latitude = body_data.get('latitude')
    longitude = body_data.get('longitude')
    
    if not cargo_items or latitude is None or longitude is None:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'cargo_items, latitude, longitude are required'})
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    created_orders = []
    
    for item in cargo_items:
        sender_name = item.get('sender_name', '')
        cargo_type = item.get('cargo_type', 'box')
        quantity = item.get('quantity', 1)
        warehouse_marketplace = item.get('warehouse_marketplace', '')
        warehouse_city = item.get('warehouse_city', '')
        warehouse_address = item.get('warehouse_address', '')
        pickup_address = item.get('pickup_address', '')
        pickup_date = item.get('pickup_date')
        pickup_time = item.get('pickup_time')
        contact_phone = item.get('contact_phone', '')
        
        if not all([sender_name, warehouse_marketplace, warehouse_city, warehouse_address, pickup_address, pickup_date, pickup_time, contact_phone]):
            continue
        
        cur.execute('''
            INSERT INTO orders_shipper 
            (user_id, sender_name, cargo_type, quantity, warehouse_marketplace, warehouse_city, warehouse_address,
             pickup_address, pickup_date, pickup_time, contact_phone, latitude, longitude, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id, created_at
        ''', (user_id, sender_name, cargo_type, quantity, warehouse_marketplace, warehouse_city, warehouse_address,
              pickup_address, pickup_date, pickup_time, contact_phone, latitude, longitude))
        
        result = cur.fetchone()
        order_id, created_at = result
        
        created_orders.append({
            'order_id': str(order_id),
            'created_at': created_at.isoformat()
        })
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'created_count': len(created_orders),
            'orders': created_orders
        })
    }