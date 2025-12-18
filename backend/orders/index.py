'''
Единая функция управления заявками перевозчиков и грузоотправителей
Поддерживает создание, получение и удаление заявок
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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Role',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = event.get('headers', {}).get('X-User-Id')
    role = event.get('headers', {}).get('X-Role', 'shipper')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'X-User-Id header required'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    
    try:
        if method == 'GET':
            return get_orders(conn, user_id, role)
        elif method == 'POST':
            return create_order(conn, user_id, role, event)
        elif method == 'DELETE':
            return delete_order(conn, user_id, role, event)
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    finally:
        conn.close()


def get_orders(conn, user_id: str, role: str) -> Dict[str, Any]:
    '''Получить активные заявки пользователя'''
    cur = conn.cursor()
    
    if role == 'carrier':
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
    
    else:  # shipper
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


def create_order(conn, user_id: str, role: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Создать заявку перевозчика или грузоотправителя'''
    body_data = json.loads(event.get('body', '{}'))
    cur = conn.cursor()
    
    if role == 'carrier':
        vehicle_id = body_data.get('vehicle_id')
        warehouse_marketplace = body_data.get('warehouse_marketplace', '')
        warehouse_city = body_data.get('warehouse_city', '')
        warehouse_address = body_data.get('warehouse_address', '')
        capacity_boxes = body_data.get('capacity_boxes', 0)
        capacity_pallets = body_data.get('capacity_pallets', 0)
        latitude = body_data.get('latitude')
        longitude = body_data.get('longitude')
        
        if not warehouse_marketplace or latitude is None or longitude is None:
            cur.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'warehouse_marketplace, latitude, longitude are required'}),
                'isBase64Encoded': False
            }
        
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
    
    else:  # shipper
        cargo_items: List[Dict] = body_data.get('cargo_items', [])
        latitude = body_data.get('latitude')
        longitude = body_data.get('longitude')
        
        if not cargo_items or latitude is None or longitude is None:
            cur.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'cargo_items, latitude, longitude are required'}),
                'isBase64Encoded': False
            }
        
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
            
            if not all([sender_name, warehouse_marketplace, warehouse_city, warehouse_address, 
                       pickup_address, pickup_date, pickup_time, contact_phone]):
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


def delete_order(conn, user_id: str, role: str, event: Dict[str, Any]) -> Dict[str, Any]:
    '''Удалить заявку пользователя'''
    body = json.loads(event.get('body', '{}'))
    order_id = body.get('order_id')
    
    if not order_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'order_id required'}),
            'isBase64Encoded': False
        }
    
    cur = conn.cursor()
    
    if role == 'carrier':
        cur.execute("""
            DELETE FROM orders_carrier 
            WHERE id = %s AND user_id = %s
            RETURNING id
        """, (order_id, user_id))
    else:
        cur.execute("""
            DELETE FROM orders_shipper 
            WHERE id = %s AND user_id = %s
            RETURNING id
        """, (order_id, user_id))
    
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    
    if not deleted:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Order not found or access denied'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'order_id': order_id}),
        'isBase64Encoded': False
    }
