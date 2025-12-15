import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''Получить активные заявки грузоотправителя (может быть несколько)'''
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
        SELECT id, sender_name, cargo_type, quantity, warehouse_marketplace, 
               pickup_address, pickup_date, pickup_time, contact_phone, 
               latitude, longitude, status, created_at
        FROM orders_shipper
        WHERE user_id = %s AND status IN ('pending', 'active')
        ORDER BY created_at DESC
    ''', (user_id,))
    
    results = cur.fetchall()
    cur.close()
    conn.close()
    
    orders = []
    for row in results:
        orders.append({
            'id': str(row[0]),
            'sender_name': row[1],
            'cargo_type': row[2],
            'quantity': row[3],
            'warehouse_marketplace': row[4],
            'pickup_address': row[5],
            'pickup_date': row[6].isoformat() if row[6] else None,
            'pickup_time': str(row[7]) if row[7] else None,
            'contact_phone': row[8],
            'latitude': float(row[9]),
            'longitude': float(row[10]),
            'status': row[11],
            'created_at': row[12].isoformat()
        })
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'orders': orders})
    }
