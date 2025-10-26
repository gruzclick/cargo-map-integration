'''
Input validation and sanitization utilities
'''

import re
from typing import Dict, Any, Optional

class ValidationError(Exception):
    pass

def validate_email(email: str) -> str:
    if not email or not isinstance(email, str):
        raise ValidationError('Email is required')
    
    email = email.strip().lower()
    
    if len(email) > 254:
        raise ValidationError('Email is too long')
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError('Invalid email format')
    
    return email

def validate_password(password: str, min_length: int = 8) -> str:
    if not password or not isinstance(password, str):
        raise ValidationError('Password is required')
    
    if len(password) < min_length:
        raise ValidationError(f'Password must be at least {min_length} characters')
    
    if len(password) > 128:
        raise ValidationError('Password is too long')
    
    has_letter = re.search(r'[a-zA-Z]', password)
    has_digit = re.search(r'\d', password)
    
    if not has_letter or not has_digit:
        raise ValidationError('Password must contain both letters and numbers')
    
    return password

def validate_full_name(name: str) -> str:
    if not name or not isinstance(name, str):
        raise ValidationError('Full name is required')
    
    name = name.strip()
    
    if len(name) < 2:
        raise ValidationError('Full name is too short')
    
    if len(name) > 100:
        raise ValidationError('Full name is too long')
    
    if not re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', name):
        raise ValidationError('Full name contains invalid characters')
    
    return name

def sanitize_string(text: str, max_length: int = 1000) -> str:
    if not text or not isinstance(text, str):
        return ''
    
    text = text.strip()
    
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r'<[^>]+>', '', text)
    
    text = text.replace('<', '&lt;').replace('>', '&gt;')
    
    if len(text) > max_length:
        text = text[:max_length]
    
    return text

def validate_uuid(uuid_str: str) -> str:
    if not uuid_str or not isinstance(uuid_str, str):
        raise ValidationError('UUID is required')
    
    uuid_pattern = r'^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$'
    if not re.match(uuid_pattern, uuid_str.lower()):
        raise ValidationError('Invalid UUID format')
    
    return uuid_str.lower()

def validate_phone(phone: str) -> str:
    if not phone or not isinstance(phone, str):
        raise ValidationError('Phone is required')
    
    phone = re.sub(r'[\s\-\(\)]', '', phone)
    
    phone = re.sub(r'^\+?', '+', phone)
    
    if not re.match(r'^\+\d{10,15}$', phone):
        raise ValidationError('Invalid phone format')
    
    return phone

def validate_action(action: str, allowed_actions: list) -> str:
    if not action or not isinstance(action, str):
        raise ValidationError('Action is required')
    
    if action not in allowed_actions:
        raise ValidationError(f'Invalid action. Allowed: {", ".join(allowed_actions)}')
    
    return action
