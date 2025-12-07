#!/usr/bin/env python3
"""
Скрипт для настройки Telegram бота
Использование: python3 setup_telegram_bot.py <BOT_TOKEN>
"""

import sys
import requests

def setup_bot(bot_token):
    webhook_url = "https://functions.poehali.dev/8b815ea6-d517-4175-acb3-4e819045c985"
    
    print("🤖 Настройка Telegram бота...")
    print(f"📍 Webhook URL: {webhook_url}")
    
    # Удаляем старый webhook
    print("\n1️⃣ Удаление старого webhook...")
    delete_response = requests.post(
        f'https://api.telegram.org/bot{bot_token}/deleteWebhook',
        json={'drop_pending_updates': True}
    )
    
    if delete_response.ok:
        print("✅ Старый webhook удалён")
    else:
        print(f"⚠️  Ошибка удаления: {delete_response.text}")
    
    # Устанавливаем новый webhook
    print("\n2️⃣ Установка нового webhook...")
    set_response = requests.post(
        f'https://api.telegram.org/bot{bot_token}/setWebhook',
        json={'url': webhook_url}
    )
    
    if set_response.ok:
        data = set_response.json()
        if data.get('ok'):
            print("✅ Webhook успешно установлен!")
        else:
            print(f"❌ Ошибка: {data.get('description')}")
    else:
        print(f"❌ Ошибка HTTP: {set_response.status_code}")
    
    # Проверяем статус
    print("\n3️⃣ Проверка статуса webhook...")
    info_response = requests.get(
        f'https://api.telegram.org/bot{bot_token}/getWebhookInfo'
    )
    
    if info_response.ok:
        info = info_response.json()['result']
        print(f"📊 Webhook URL: {info.get('url')}")
        print(f"📊 Pending updates: {info.get('pending_update_count', 0)}")
        print(f"📊 Last error: {info.get('last_error_message', 'Нет ошибок')}")
        
        if info.get('url') == webhook_url:
            print("\n🎉 Бот настроен правильно!")
        else:
            print("\n⚠️  URL не совпадает!")
    else:
        print(f"❌ Не удалось получить информацию: {info_response.text}")
    
    # Получаем информацию о боте
    print("\n4️⃣ Информация о боте...")
    me_response = requests.get(f'https://api.telegram.org/bot{bot_token}/getMe')
    
    if me_response.ok:
        bot_info = me_response.json()['result']
        print(f"🤖 Имя: {bot_info.get('first_name')}")
        print(f"🤖 Username: @{bot_info.get('username')}")
        print(f"🤖 ID: {bot_info.get('id')}")
    
    print("\n✅ Готово! Теперь отправьте /start боту для проверки")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Использование: python3 setup_telegram_bot.py <BOT_TOKEN>")
        print("Токен можно получить у @BotFather в Telegram")
        sys.exit(1)
    
    bot_token = sys.argv[1]
    setup_bot(bot_token)
