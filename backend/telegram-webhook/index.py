import json
import os
import psycopg2
import requests
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_user_profile_photo(user_id: int, bot_token: str) -> str:
    '''
    Получает URL фото профиля пользователя
    '''
    try:
        # Получаем список фото профиля
        response = requests.get(
            f'https://api.telegram.org/bot{bot_token}/getUserProfilePhotos',
            params={'user_id': user_id, 'limit': 1},
            timeout=5
        )
        
        if not response.ok:
            return ''
        
        data = response.json()
        photos = data.get('result', {}).get('photos', [])
        
        if not photos or not photos[0]:
            return ''
        
        # Берём самое большое фото (последнее в массиве)
        file_id = photos[0][-1]['file_id']
        
        # Получаем путь к файлу
        file_response = requests.get(
            f'https://api.telegram.org/bot{bot_token}/getFile',
            params={'file_id': file_id},
            timeout=5
        )
        
        if not file_response.ok:
            return ''
        
        file_data = file_response.json()
        file_path = file_data.get('result', {}).get('file_path', '')
        
        if not file_path:
            return ''
        
        # Формируем URL для загрузки
        photo_url = f'https://api.telegram.org/file/bot{bot_token}/{file_path}'
        return photo_url
        
    except Exception as e:
        print(f"[ERROR] Failed to get profile photo: {e}")
        return ''

def handle_auth_request(chat_id: int, username: str, first_name: str, last_name: str, session_token: str, bot_token: str):
    '''
    Обрабатывает запрос авторизации через Telegram
    '''
    try:
        full_name = f"{first_name} {last_name}".strip()
        
        # Отправляем запрос подтверждения
        response_text = f"🔐 *GruzClick* запрашивает доступ к вашему профилю\n\n"
        response_text += f"📋 Будут получены:\n"
        response_text += f"✅ Имя: {full_name}\n"
        if username:
            response_text += f"✅ Username: @{username}\n"
        response_text += f"\nПодтвердите вход для продолжения:"
        
        keyboard = {
            'inline_keyboard': [[
                {'text': '✅ Подтвердить вход', 'callback_data': f'auth_confirm:{session_token}'}
            ], [
                {'text': '❌ Отмена', 'callback_data': f'auth_cancel:{session_token}'}
            ]]
        }
        
        response = requests.post(
            f'https://api.telegram.org/bot{bot_token}/sendMessage',
            json={
                'chat_id': chat_id,
                'text': response_text,
                'parse_mode': 'Markdown',
                'reply_markup': keyboard
            },
            timeout=5
        )
        
        if response.ok:
            print(f"[DEBUG] Sent auth confirmation request to {chat_id}")
        else:
            print(f"[ERROR] Failed to send auth message: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"[ERROR] Failed to handle auth request: {e}")
        import traceback
        print(traceback.format_exc())

def handle_callback_query(callback_query: Dict[str, Any]) -> Dict[str, Any]:
    '''
    Обрабатывает нажатие на inline кнопки
    '''
    try:
        callback_id = callback_query.get('id')
        callback_data = callback_query.get('data', '')
        from_user = callback_query.get('from', {})
        message = callback_query.get('message', {})
        
        chat_id = from_user.get('id')
        username = from_user.get('username', '')
        first_name = from_user.get('first_name', '')
        last_name = from_user.get('last_name', '')
        message_id = message.get('message_id')
        
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        
        if not bot_token:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        # Парсим callback_data
        if ':' in callback_data:
            action, session_token = callback_data.split(':', 1)
            
            if action == 'auth_confirm':
                # Получаем URL фото профиля
                photo_url = get_user_profile_photo(chat_id, bot_token)
                
                # Сохраняем данные в сессию
                dsn = os.environ.get('DATABASE_URL')
                if dsn:
                    conn = psycopg2.connect(dsn)
                    cur = conn.cursor()
                    
                    session_token_escaped = session_token.replace("'", "''")
                    username_escaped = username.replace("'", "''")
                    first_name_escaped = first_name.replace("'", "''")
                    last_name_escaped = last_name.replace("'", "''")
                    photo_url_escaped = photo_url.replace("'", "''") if photo_url else ''
                    
                    cur.execute(f"""
                        UPDATE t_p93479485_cargo_map_integratio.telegram_auth_sessions
                        SET 
                            telegram_user_id = {chat_id},
                            telegram_username = '{username_escaped}',
                            telegram_first_name = '{first_name_escaped}',
                            telegram_last_name = '{last_name_escaped}',
                            telegram_photo_url = '{photo_url_escaped}'
                        WHERE session_token = '{session_token_escaped}'
                    """)
                    
                    conn.commit()
                    cur.close()
                    conn.close()
                    
                    print(f"[DEBUG] Auth confirmed for session {session_token}, photo: {bool(photo_url)}")
                
                # Обновляем сообщение
                success_text = "✅ *Вход подтверждён!*\n\nВозвращайтесь на сайт GruzClick для продолжения."
                
                requests.post(
                    f'https://api.telegram.org/bot{bot_token}/editMessageText',
                    json={
                        'chat_id': chat_id,
                        'message_id': message_id,
                        'text': success_text,
                        'parse_mode': 'Markdown'
                    },
                    timeout=5
                )
                
                # Отвечаем на callback
                requests.post(
                    f'https://api.telegram.org/bot{bot_token}/answerCallbackQuery',
                    json={
                        'callback_query_id': callback_id,
                        'text': '✅ Вход подтверждён!'
                    },
                    timeout=5
                )
                
            elif action == 'auth_cancel':
                # Отменяем вход
                cancel_text = "❌ Вход отменён.\n\nВы можете закрыть это окно."
                
                requests.post(
                    f'https://api.telegram.org/bot{bot_token}/editMessageText',
                    json={
                        'chat_id': chat_id,
                        'message_id': message_id,
                        'text': cancel_text
                    },
                    timeout=5
                )
                
                # Отвечаем на callback
                requests.post(
                    f'https://api.telegram.org/bot{bot_token}/answerCallbackQuery',
                    json={
                        'callback_query_id': callback_id,
                        'text': 'Вход отменён'
                    },
                    timeout=5
                )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Callback error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Webhook для получения сообщений от Telegram бота и сохранения chat_id
    Args: event with httpMethod, body containing Telegram update
          context with request_id attribute
    Returns: HTTP response confirming webhook received
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        
        # Обработка callback query (нажатие на inline кнопки)
        callback_query = body_data.get('callback_query')
        if callback_query:
            return handle_callback_query(callback_query)
        
        # Получаем данные из Telegram update
        message = body_data.get('message', {})
        from_user = message.get('from', {})
        
        chat_id = from_user.get('id')
        username = from_user.get('username', '')
        first_name = from_user.get('first_name', '')
        last_name = from_user.get('last_name', '')
        
        if not chat_id:
            print(f"[DEBUG] Webhook received but no chat_id found")
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        print(f"[DEBUG] Webhook received from @{username} (ID: {chat_id})")
        
        # Обработка команды /start с параметром
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        message_text = message.get('text', '')
        
        if bot_token and message_text.startswith('/start'):
            parts = message_text.split(' ', 1)
            
            # Если есть параметр (токен авторизации)
            if len(parts) > 1 and parts[1].startswith('AUTH_'):
                session_token = parts[1]
                print(f"[DEBUG] Auth request with token: {session_token}")
                handle_auth_request(chat_id, username, first_name, last_name, session_token, bot_token)
                print(f"[DEBUG] Sent auth confirmation request to {chat_id}")
                
                # Завершаем обработку - не нужно сохранять в базу
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True}),
                    'isBase64Encoded': False
                }
            else:
                # Обычный /start без параметров
                response_text = "👋 Добро пожаловать в GruzClick!\n\n✅ Бот активирован! Теперь вы будете получать коды для входа в приложение."
                try:
                    requests.post(
                        f'https://api.telegram.org/bot{bot_token}/sendMessage',
                        json={
                            'chat_id': chat_id,
                            'text': response_text
                        },
                        timeout=5
                    )
                    print(f"[DEBUG] Sent welcome message to {chat_id}")
                except Exception as e:
                    print(f"[ERROR] Failed to send message: {e}")
        
        # Сохраняем chat_id в базу данных (для старой логики с кодами)
        if username:
            dsn = os.environ.get('DATABASE_URL')
            if dsn:
                conn = psycopg2.connect(dsn)
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                username_escaped = username.lower().replace("'", "''")
                
                # Обновляем chat_id для пользователя с таким username
                cur.execute(f"""
                    UPDATE t_p93479485_cargo_map_integratio.users 
                    SET telegram_chat_id = {chat_id}
                    WHERE LOWER(telegram) = '{username_escaped}'
                """)
                
                rows_updated = cur.rowcount
                conn.commit()
                
                print(f"[DEBUG] Updated {rows_updated} users with chat_id={chat_id} for @{username}")
                
                cur.close()
                conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        print(f"[ERROR] Webhook error: {e}")
        import traceback
        print(traceback.format_exc())
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }