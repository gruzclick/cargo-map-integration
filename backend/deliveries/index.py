'''
Business: Manage delivery orders (create, read, update)
Args: event - dict with httpMethod, body, queryStringParameters, headers
      context - object with request_id attribute
Returns: HTTP response with delivery data
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from datetime import datetime
import jwt

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    user_id = None
    user_type = None
    
    if auth_token:
        try:
            decoded = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
            user_id = decoded.get('user_id')
            user_type = decoded.get('user_type')
        except:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid or expired token'}),
                'isBase64Encoded': False
            }
    
    if method == 'GET':
        return get_deliveries(user_id, user_type, database_url)
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        return create_delivery(body_data, user_id, database_url)
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        return update_delivery(body_data, user_id, database_url)
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }

def get_deliveries(user_id: str, user_type: str, database_url: str) -> Dict[str, Any]:
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if user_type == 'client':
        cur.execute("""
            SELECT delivery_id, pickup_address, delivery_address, warehouse_address,
                   cargo_quantity, cargo_unit, weight, delivery_date, delivery_price,
                   contact_phone, status, created_at
            FROM deliveries
            WHERE client_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
    elif user_type == 'carrier':
        cur.execute("""
            SELECT d.delivery_id, d.pickup_address, d.delivery_address, d.warehouse_address,
                   d.cargo_quantity, d.cargo_unit, d.weight, d.delivery_date, d.delivery_price,
                   d.contact_phone, d.status, d.created_at
            FROM deliveries d
            LEFT JOIN carriers c ON c.carrier_id = d.carrier_id
            WHERE c.user_id = %s OR d.status = 'pending'
            ORDER BY d.created_at DESC
        """, (user_id,))
    else:
        cur.execute("""
            SELECT delivery_id, pickup_address, delivery_address, warehouse_address,
                   cargo_quantity, cargo_unit, weight, delivery_date, delivery_price,
                   contact_phone, status, created_at
            FROM deliveries
            WHERE status = 'pending'
            ORDER BY created_at DESC
            LIMIT 50
        """)
    
    rows = cur.fetchall()
    cur.close()
    conn.close()
    
    deliveries: List[Dict[str, Any]] = []
    for row in rows:
        deliveries.append({
            'delivery_id': str(row[0]),
            'pickup_address': row[1],
            'delivery_address': row[2],
            'warehouse_address': row[3],
            'cargo_quantity': row[4],
            'cargo_unit': row[5],
            'weight': float(row[6]) if row[6] else 0,
            'delivery_date': row[7].isoformat() if row[7] else None,
            'delivery_price': float(row[8]) if row[8] else 0,
            'contact_phone': row[9],
            'status': row[10],
            'created_at': row[11].isoformat() if row[11] else None
        })
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'deliveries': deliveries}),
        'isBase64Encoded': False
    }

def create_delivery(data: Dict[str, Any], user_id: str, database_url: str) -> Dict[str, Any]:
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'}),
            'isBase64Encoded': False
        }
    
    pickup_address = data.get('pickup_address')
    delivery_address = data.get('delivery_address')
    warehouse_address = data.get('warehouse_address')
    cargo_quantity = data.get('cargo_quantity')
    cargo_unit = data.get('cargo_unit')
    weight = data.get('weight')
    delivery_date = data.get('delivery_date')
    delivery_price = data.get('delivery_price')
    contact_phone = data.get('contact_phone')
    
    if not all([pickup_address, delivery_address, warehouse_address, cargo_quantity, 
                cargo_unit, weight, delivery_date, delivery_price, contact_phone]):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing required fields'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO deliveries (client_id, pickup_address, delivery_address, warehouse_address,
                               cargo_quantity, cargo_unit, weight, delivery_date, 
                               delivery_price, contact_phone, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
        RETURNING delivery_id
    """, (user_id, pickup_address, delivery_address, warehouse_address,
          cargo_quantity, cargo_unit, weight, delivery_date, 
          delivery_price, contact_phone))
    
    delivery_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'message': 'Delivery created successfully',
            'delivery_id': str(delivery_id)
        }),
        'isBase64Encoded': False
    }

def update_delivery(data: Dict[str, Any], user_id: str, database_url: str) -> Dict[str, Any]:
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authentication required'}),
            'isBase64Encoded': False
        }
    
    delivery_id = data.get('delivery_id')
    status = data.get('status')
    
    if not delivery_id or not status:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing delivery_id or status'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    cur.execute("""
        UPDATE deliveries 
        SET status = %s, updated_at = CURRENT_TIMESTAMP
        WHERE delivery_id = %s
        RETURNING delivery_id
    """, (status, delivery_id))
    
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    if not result:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Delivery not found'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': 'Delivery updated successfully'}),
        'isBase64Encoded': False
    }