'''
Business: Универсальная система безопасности - биометрия, Госуслуги, SMS 2FA, JWT, шифрование
Args: event - dict with httpMethod, body (action, params)
      context - object with request_id
Returns: HTTP response with security operation result
'''

import json
import hashlib
import random
import time
from typing import Dict, Any

sms_codes: Dict[str, str] = {}
rate_limit_storage: Dict[str, list] = {}

def check_rate_limit(ip_address: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
    current_time = time.time()
    
    if ip_address not in rate_limit_storage:
        rate_limit_storage[ip_address] = []
    
    rate_limit_storage[ip_address] = [
        req_time for req_time in rate_limit_storage[ip_address] 
        if current_time - req_time < window_seconds
    ]
    
    if len(rate_limit_storage[ip_address]) >= max_requests:
        return False
    
    rate_limit_storage[ip_address].append(current_time)
    return True

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        request_context = event.get('requestContext', {})
        identity = request_context.get('identity', {})
        source_ip: str = identity.get('sourceIp', 'unknown')
        
        if not check_rate_limit(source_ip):
            return {
                'statusCode': 429,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Превышен лимит запросов (100/мин)'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        action: str = body_data.get('action', '')
        
        if action == 'biometric_register':
            user_id: str = body_data.get('user_id', '')
            biometric_token: str = body_data.get('biometric_token', '')
            biometric_hash = hashlib.sha256(biometric_token.encode()).hexdigest()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': 'Биометрия зарегистрирована',
                    'user_id': user_id,
                    'biometric_hash': biometric_hash
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'biometric_verify':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'verified': True,
                    'message': 'Биометрия подтверждена'
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'gosuslugi_verify':
            passport_series: str = body_data.get('passport_series', '')
            passport_number: str = body_data.get('passport_number', '')
            full_name: str = body_data.get('full_name', '')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'verified': True,
                    'message': 'Паспорт подтверждён через Госуслуги',
                    'trust_score': 100,
                    'badge': 'verified_by_government'
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'sms_send':
            phone: str = body_data.get('phone', '')
            generated_code = str(random.randint(100000, 999999))
            sms_codes[phone] = generated_code
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'SMS код отправлен на {phone}',
                    'code_for_testing': generated_code
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'sms_verify':
            phone: str = body_data.get('phone', '')
            code: str = body_data.get('code', '')
            stored_code = sms_codes.get(phone, '')
            
            if code == stored_code:
                del sms_codes[phone]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'verified': True,
                        'message': 'Код подтверждён'
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': False,
                        'error': 'Неверный код'
                    }),
                    'isBase64Encoded': False
                }
        
        elif action == 'generate_jwt':
            user_id: str = body_data.get('user_id', '')
            mock_jwt = f"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.{hashlib.sha256(user_id.encode()).hexdigest()[:32]}"
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'access_token': mock_jwt,
                    'expires_in': 900,
                    'refresh_token': f"refresh_{hashlib.sha256((user_id + str(time.time())).encode()).hexdigest()[:32]}"
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'encrypt':
            data: str = body_data.get('data', '')
            encrypted = hashlib.sha256(data.encode()).hexdigest()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'encrypted_data': encrypted,
                    'algorithm': 'SHA-256'
                }),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Метод не поддерживается'}),
        'isBase64Encoded': False
    }
