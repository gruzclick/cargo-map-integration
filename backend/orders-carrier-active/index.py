import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Получить активную заявку перевозчика (только одна активная заявка на пользователя)'''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
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
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id, vehicle_id, warehouse_marketplace, warehouse_city, warehouse_address,
               capacity_boxes, capacity_pallets, latitude, longitude, status, created_at
        FROM orders_carrier
        WHERE user_id = %s AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1
    ''', (user_id,))
    
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    if not result:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'order': None})
        }
    
    order = {
        'id': str(result[0]),
        'vehicle_id': str(result[1]) if result[1] else None,
        'warehouse_marketplace': result[2],
        'warehouse_city': result[3],
        'warehouse_address': result[4],
        'capacity_boxes': result[5],
        'capacity_pallets': result[6],
        'latitude': float(result[7]),
        'longitude': float(result[8]),
        'status': result[9],
        'created_at': result[10].isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'order': order})
    }
