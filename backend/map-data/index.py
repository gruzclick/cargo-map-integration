import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Business: Get real-time map data with cargo and drivers positions
    Args: event - dict with httpMethod (GET, POST, OPTIONS)
          context - object with request_id attribute
    Returns: HTTP response with markers data
    """
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    if method == 'GET':
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        cur.execute("""
            SELECT cargo_id, name, details, weight, lat, lng, status, cargo_type 
            FROM cargo 
            WHERE status = 'waiting'
        """)
        cargo_rows = cur.fetchall()
        
        cur.execute("""
            SELECT driver_id, name, vehicle_type, capacity, lat, lng, status, vehicle_category 
            FROM drivers
        """)
        driver_rows = cur.fetchall()
        
        cur.close()
        conn.close()
        
        markers: List[Dict[str, Any]] = []
        
        for row in cargo_rows:
            markers.append({
                'id': row[0],
                'type': 'cargo',
                'lat': float(row[4]),
                'lng': float(row[5]),
                'name': row[1],
                'details': f"{row[2]}, {row[3]}кг",
                'status': 'Ожидает',
                'cargoType': row[7] if row[7] else 'box'
            })
        
        for row in driver_rows:
            markers.append({
                'id': row[0],
                'type': 'driver',
                'lat': float(row[4]),
                'lng': float(row[5]),
                'name': row[1],
                'details': f"{row[2]}, грузоподъёмность {row[3]}т",
                'status': 'Свободен' if row[6] == 'free' else 'Занят',
                'vehicleCategory': row[7] if row[7] else 'car'
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        marker_type = body_data.get('type')
        marker_id = body_data.get('id')
        lat = body_data.get('lat')
        lng = body_data.get('lng')
        
        conn = psycopg2.connect(database_url)
        cur = conn.cursor()
        
        if marker_type == 'driver':
            cur.execute("""
                UPDATE drivers 
                SET lat = %s, lng = %s, updated_at = CURRENT_TIMESTAMP 
                WHERE driver_id = %s
            """, (lat, lng, marker_id))
        elif marker_type == 'cargo':
            cur.execute("""
                UPDATE cargo 
                SET lat = %s, lng = %s, updated_at = CURRENT_TIMESTAMP 
                WHERE cargo_id = %s
            """, (lat, lng, marker_id))
        
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
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }